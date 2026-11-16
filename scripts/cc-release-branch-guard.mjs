// Bramka gałęzi wydania (@007, decyzja L0 16.11.2026: jedyna gałąź produkcyjna = main).
//
// Incydent 16.11: automaty publikacji zbudowały i wdrożyły produkcję z gałęzi
// feat/cc-design-system-2027-pilot (wspólny katalog przełączony 15.11), która nie
// zawierała main → produkcja cofnęła zatwierdzone poprawki. Ta bramka działa w
// build-pages-release.mjs, więc obejmuje KAŻDY skrypt wdrożeniowy.
//
// Zasady:
//  1. Wydanie tylko z gałęzi main albo z odłączonego HEAD (osobne drzewo wydania).
//  2. HEAD musi zawierać origin/main (nic, co już jest na main, nie może zniknąć).
//     Gdy lokalny main jest w tyle — bramka sama dociąga (fast-forward lub rebase
//     własnych, niewysłanych commitów). Konflikt = STOP.
//  3. Awaryjne wyłączenie tylko świadomie: CC_RELEASE_BRANCH_GUARD=off (decyzja L0).
import { execFileSync } from 'node:child_process';

export const PRODUCTION_BRANCH = 'main';

/** Czysta decyzja (testowalna): co zrobić przy danym stanie repo. */
export function decide({ branch, containsMain, mainContainsHead }) {
  if (branch && branch !== PRODUCTION_BRANCH) {
    return { action: 'refuse', reason: `gałąź „${branch}” — wydanie wolno budować tylko z „${PRODUCTION_BRANCH}”` };
  }
  if (containsMain) return { action: 'ok' };
  if (!branch) {
    return { action: 'refuse', reason: 'odłączony HEAD nie zawiera origin/main — zbuduj z aktualnego origin/main' };
  }
  return { action: mainContainsHead ? 'fast-forward' : 'rebase' };
}

function git(root, args, opts = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}
function isAncestor(root, a, b) {
  try { git(root, ['merge-base', '--is-ancestor', a, b]); return true; } catch { return false; }
}

export function enforceReleaseBranch(root, env = process.env, log = console.log) {
  if (String(env.CC_RELEASE_BRANCH_GUARD || '').toLowerCase() === 'off') {
    log('⚠️ Bramka gałęzi wydania WYŁĄCZONA (CC_RELEASE_BRANCH_GUARD=off).');
    return { action: 'skipped' };
  }
  try { git(root, ['fetch', '--quiet', 'origin', PRODUCTION_BRANCH], { timeout: 120_000 }); }
  catch (e) { throw new Error(`Wydanie przerwane — BRAMKA GAŁĘZI: nie można pobrać origin/${PRODUCTION_BRANCH} (${String(e.message).split('\n')[0]}). Bez tego nie wiadomo, czy wydanie nie cofnie cudzych poprawek.`); }
  let branch = '';
  try { branch = git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']); } catch { branch = ''; }
  const remote = `origin/${PRODUCTION_BRANCH}`;
  const state = { branch, containsMain: isAncestor(root, remote, 'HEAD'), mainContainsHead: isAncestor(root, 'HEAD', remote) };
  const d = decide(state);
  if (d.action === 'refuse') throw new Error(`Wydanie przerwane — BRAMKA GAŁĘZI: ${d.reason}.`);
  if (d.action === 'fast-forward') {
    git(root, ['merge', '--ff-only', remote]);
    log(`🔄 Bramka gałęzi: lokalny ${PRODUCTION_BRANCH} dociągnięty do ${remote}.`);
  } else if (d.action === 'rebase') {
    try {
      git(root, ['rebase', remote]);
      log(`🔄 Bramka gałęzi: niewysłane commity przeniesione na ${remote}.`);
    } catch (e) {
      try { git(root, ['rebase', '--abort']); } catch {}
      throw new Error(`Wydanie przerwane — BRAMKA GAŁĘZI: konflikt przy przenoszeniu commitów na ${remote}. Rozwiąż ręcznie i powiadom @007.`);
    }
  }
  if (!isAncestor(root, remote, 'HEAD')) throw new Error('Wydanie przerwane — BRAMKA GAŁĘZI: po dociągnięciu HEAD nadal nie zawiera origin/main.');
  return d;
}

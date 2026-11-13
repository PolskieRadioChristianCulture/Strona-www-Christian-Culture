import fs from 'node:fs';

const p = 'C:/Users/czark/Desktop/@ICC/Misja CC/JOMA_SHARED_MEMORY/SKRZYNKA/narzedzia/openbot-automation.mjs';
let code = fs.readFileSync(p, 'utf8');

const targetAgentsDefs = `    const otherAgentsRows = db
      .prepare("SELECT agent_json FROM projection_agents WHERE agent_id NOT IN (?, ?, ?) ORDER BY sort_order ASC, agent_id ASC")
      .all(ANTIGRAVITY_AGENT_ID, PUBLIKATOR_AGENT_ID, OPENBOT_CC_AGENT_ID);`;

const newAgentsDefs = `    const noemiAgent = {
      id: NOEMI_AGENT_ID,
      name: "Rada JOMA & Router L1 (@077 Noemi)",
      title: "Rada JOMA & Router Orkiestracji L1 (@077)",
      description: "Rada JOMA i Router Orkiestracji L1 (@077 Noemi): klasyfikacja ryzyka T0–T4, routing tokenów (route-tokens), koordynacja 21 Kolegiów i nadzór nad pamięcią współdzieloną na darmowym AI.",
      notifications: true,
      model: FREE_MODEL_GUARD.model,
      reasoningEffort: FREE_MODEL_GUARD.effort,
      threadId: NOEMI_THREAD_ID,
      workspacePath: NOEMI_WORKSPACE,
      preview: "🕊️ Rada JOMA i Router L1 (@077 Noemi) gotowa • Koordynacja 21 Kolegiów Federacji @777 (100% Free AI)",
      updatedAt: now,
      avatarSeed: "first-bot:face:77",
      avatarHue: 200,
      avatarUrl: null,
      provider: FREE_MODEL_GUARD.provider,
      access: "full",
      computerUse: true,
      allowAutomation: true,
    };

    const a150Agent = {
      id: A150_AGENT_ID,
      name: "Recenzent Biblijny K1–K12 UBG (@150)",
      title: "Recenzent Biblijny i Doktrynalny L5 (@150)",
      description: "Niezależny Recenzent Biblijny L5 (@150): 12-krokowa procedura kontrolna K1–K12, weryfikacja dosłowności UBG, 28 Zasad Wiary i brak czerwonych flag doktrynalnych.",
      notifications: true,
      model: FREE_MODEL_GUARD.model,
      reasoningEffort: FREE_MODEL_GUARD.effort,
      threadId: A150_THREAD_ID,
      workspacePath: A150_WORKSPACE,
      preview: "📖 Recenzent Biblijny K1–K12 UBG (@150) aktywny • Standard Pisma Świętego i 28 Zasad Wiary",
      updatedAt: now,
      avatarSeed: "first-bot:face:50",
      avatarHue: 120,
      avatarUrl: null,
      provider: FREE_MODEL_GUARD.provider,
      access: "full",
      computerUse: true,
      allowAutomation: true,
    };

    const a520Agent = {
      id: A520_AGENT_ID,
      name: "Główny Grafik Redakcyjny i Reżyser Obrazu (@A520)",
      title: "Reżyser Obrazu i Visual Guardian L5 (@A520)",
      description: "Główny Grafik Redakcyjny i Reżyser Obrazu L5 (@A520): bramka IMAGE_CONTENT_MATCH = PASS, kadrowanie 16:9 / 9:16 / 1:1 / 2:3 Pinterest i standard anty-slop.",
      notifications: true,
      model: FREE_MODEL_GUARD.model,
      reasoningEffort: FREE_MODEL_GUARD.effort,
      threadId: A520_THREAD_ID,
      workspacePath: A520_WORKSPACE,
      preview: "🎨 Główny Grafik i Visual Guardian (@A520) aktywny • Zgodność treściowa obrazu i standard Retina",
      updatedAt: now,
      avatarSeed: "first-bot:face:20",
      avatarHue: 280,
      avatarUrl: null,
      provider: FREE_MODEL_GUARD.provider,
      access: "full",
      computerUse: true,
      allowAutomation: true,
    };

    const smccAgent = {
      id: SMCC_AGENT_ID,
      name: "Strażnik Misji & Audytor Zero-QA (@SMCC)",
      title: "Strażnik Standardów i Jakości Kodu L5 (@SMCC)",
      description: "Strażnik Misji CC i Audytor Zero-QA L5 (@SMCC): test:guardian, test:mobile-premium, test:cc-regression, touch target 44px, pomarańczowy CTA #FF7A00 i ochrona kanałów live.",
      notifications: true,
      model: FREE_MODEL_GUARD.model,
      reasoningEffort: FREE_MODEL_GUARD.effort,
      threadId: SMCC_THREAD_ID,
      workspacePath: SMCC_WORKSPACE,
      preview: "🛡️ Strażnik Misji CC Zero-QA (@SMCC) na straży • Zero regresji i najwyższy standard technologiczny",
      updatedAt: now,
      avatarSeed: "first-bot:face:8",
      avatarHue: 350,
      avatarUrl: null,
      provider: FREE_MODEL_GUARD.provider,
      access: "full",
      computerUse: true,
      allowAutomation: true,
    };

    const rutAgent = {
      id: RUT_AGENT_ID,
      name: "Asystentka Rut (Koordynatorka Dnia L0)",
      title: "Koordynatorka Dnia i Planera CC LIFE (@Rut)",
      description: "Osobista Asystentka Rut (Koordynatorka Dnia L0 & CC LIFE): transkrypcja audio, harmonogram dnia, integracja @ccMC i wieczorny bilans misyjny Dowódcy.",
      notifications: true,
      model: FREE_MODEL_GUARD.model,
      reasoningEffort: FREE_MODEL_GUARD.effort,
      threadId: RUT_THREAD_ID,
      workspacePath: RUT_WORKSPACE,
      preview: "📋 Asystentka Rut aktywna • Koordynacja dnia i integracja @ccMC dla Dowódcy",
      updatedAt: now,
      avatarSeed: "first-bot:face:14",
      avatarHue: 60,
      avatarUrl: null,
      provider: FREE_MODEL_GUARD.provider,
      access: "full",
      computerUse: true,
      allowAutomation: true,
    };

    const otherAgentsRows = db
      .prepare("SELECT agent_json FROM projection_agents WHERE agent_id NOT IN (?, ?, ?, ?, ?, ?, ?, ?) ORDER BY sort_order ASC, agent_id ASC")
      .all(ANTIGRAVITY_AGENT_ID, PUBLIKATOR_AGENT_ID, OPENBOT_CC_AGENT_ID, NOEMI_AGENT_ID, A150_AGENT_ID, A520_AGENT_ID, SMCC_AGENT_ID, RUT_AGENT_ID);`;

if (!code.includes('noemiAgent =')) {
  code = code.replace(targetAgentsDefs, newAgentsDefs);
  console.log('New agents objects created');
}

// Podmiana tablicy agentsArray
const targetArray = 'const agentsArray = [antigravityAgent, publikatorAgent, openBotCcAgent, ...otherAgents];';
const newArray = 'const agentsArray = [antigravityAgent, noemiAgent, publikatorAgent, openBotCcAgent, a150Agent, a520Agent, smccAgent, rutAgent, ...otherAgents];';
if (code.includes(targetArray)) {
  code = code.replace(targetArray, newArray);
  console.log('agentsArray updated');
}

// Podmiana uruchomień upsertAgent
const targetUpsert = `    upsertAgent.run(ANTIGRAVITY_AGENT_ID, ANTIGRAVITY_THREAD_ID, FREE_MODEL_GUARD.model, now, 0, JSON.stringify(antigravityAgent), rosterSeq);
    upsertAgent.run(PUBLIKATOR_AGENT_ID, PUBLIKATOR_THREAD_ID, FREE_MODEL_GUARD.model, now, 1, JSON.stringify(publikatorAgent), rosterSeq);
    upsertAgent.run(OPENBOT_CC_AGENT_ID, OPENBOT_CC_THREAD_ID, FREE_MODEL_GUARD.model, now, 2, JSON.stringify(openBotCcAgent), rosterSeq);`;

const newUpsert = `    upsertAgent.run(ANTIGRAVITY_AGENT_ID, ANTIGRAVITY_THREAD_ID, FREE_MODEL_GUARD.model, now, 0, JSON.stringify(antigravityAgent), rosterSeq);
    upsertAgent.run(NOEMI_AGENT_ID, NOEMI_THREAD_ID, FREE_MODEL_GUARD.model, now, 1, JSON.stringify(noemiAgent), rosterSeq);
    upsertAgent.run(PUBLIKATOR_AGENT_ID, PUBLIKATOR_THREAD_ID, FREE_MODEL_GUARD.model, now, 2, JSON.stringify(publikatorAgent), rosterSeq);
    upsertAgent.run(OPENBOT_CC_AGENT_ID, OPENBOT_CC_THREAD_ID, FREE_MODEL_GUARD.model, now, 3, JSON.stringify(openBotCcAgent), rosterSeq);
    upsertAgent.run(A150_AGENT_ID, A150_THREAD_ID, FREE_MODEL_GUARD.model, now, 4, JSON.stringify(a150Agent), rosterSeq);
    upsertAgent.run(A520_AGENT_ID, A520_THREAD_ID, FREE_MODEL_GUARD.model, now, 5, JSON.stringify(a520Agent), rosterSeq);
    upsertAgent.run(SMCC_AGENT_ID, SMCC_THREAD_ID, FREE_MODEL_GUARD.model, now, 6, JSON.stringify(smccAgent), rosterSeq);
    upsertAgent.run(RUT_AGENT_ID, RUT_THREAD_ID, FREE_MODEL_GUARD.model, now, 7, JSON.stringify(rutAgent), rosterSeq);`;

if (code.includes(targetUpsert)) {
  code = code.replace(targetUpsert, newUpsert);
  console.log('upsertAgent calls updated');
}

// Podmiana rejestracji wątków projection_threads
const targetThreadsEnd = `    ).run(PUBLIKATOR_THREAD_ID, PUBLIKATOR_AGENT_ID, "Publikator CC", now, now, rosterSeq);

    db.prepare(
      \`INSERT INTO projection_threads (thread_id, agent_id, title, active_turn_id, created_at, updated_at, last_event_sequence)
       VALUES (?, ?, ?, NULL, ?, ?, ?)
       ON CONFLICT(thread_id) DO UPDATE SET
         agent_id = excluded.agent_id,
         title = excluded.title,
         updated_at = excluded.updated_at,
         last_event_sequence = MAX(projection_threads.last_event_sequence, excluded.last_event_sequence)\`
    ).run(OPENBOT_CC_THREAD_ID, OPENBOT_CC_AGENT_ID, "Open Bot CC", now, now, rosterSeq);`;

const newThreadsEnd = `    ).run(PUBLIKATOR_THREAD_ID, PUBLIKATOR_AGENT_ID, "Publikator CC", now, now, rosterSeq);

    db.prepare(
      \`INSERT INTO projection_threads (thread_id, agent_id, title, active_turn_id, created_at, updated_at, last_event_sequence)
       VALUES (?, ?, ?, NULL, ?, ?, ?)
       ON CONFLICT(thread_id) DO UPDATE SET
         agent_id = excluded.agent_id,
         title = excluded.title,
         updated_at = excluded.updated_at,
         last_event_sequence = MAX(projection_threads.last_event_sequence, excluded.last_event_sequence)\`
    ).run(OPENBOT_CC_THREAD_ID, OPENBOT_CC_AGENT_ID, "Open Bot CC", now, now, rosterSeq);

    const extraThreads = [
      [NOEMI_THREAD_ID, NOEMI_AGENT_ID, "Rada JOMA & Router L1 (@077 Noemi)"],
      [A150_THREAD_ID, A150_AGENT_ID, "Recenzent Biblijny K1–K12 UBG (@150)"],
      [A520_THREAD_ID, A520_AGENT_ID, "Główny Grafik Redakcyjny i Reżyser Obrazu (@A520)"],
      [SMCC_THREAD_ID, SMCC_AGENT_ID, "Strażnik Misji & Audytor Zero-QA (@SMCC)"],
      [RUT_THREAD_ID, RUT_AGENT_ID, "Asystentka Rut (Koordynatorka Dnia L0)"]
    ];
    for (const [tid, aid, tname] of extraThreads) {
      db.prepare(
        \`INSERT INTO projection_threads (thread_id, agent_id, title, active_turn_id, created_at, updated_at, last_event_sequence)
         VALUES (?, ?, ?, NULL, ?, ?, ?)
         ON CONFLICT(thread_id) DO UPDATE SET
           agent_id = excluded.agent_id,
           title = excluded.title,
           updated_at = excluded.updated_at,
           last_event_sequence = MAX(projection_threads.last_event_sequence, excluded.last_event_sequence)\`
      ).run(tid, aid, tname, now, now, rosterSeq);
    }`;

if (code.includes(targetThreadsEnd)) {
  code = code.replace(targetThreadsEnd, newThreadsEnd);
  console.log('extraThreads registered');
}

// Rozszerzenie targetAgents w sekcji wspomnień (seeding memories)
const targetTargetAgents = 'const targetAgents = [ANTIGRAVITY_AGENT_ID, PUBLIKATOR_AGENT_ID, OPENBOT_CC_AGENT_ID];';
const newTargetAgents = 'const targetAgents = [ANTIGRAVITY_AGENT_ID, NOEMI_AGENT_ID, PUBLIKATOR_AGENT_ID, OPENBOT_CC_AGENT_ID, A150_AGENT_ID, A520_AGENT_ID, SMCC_AGENT_ID, RUT_AGENT_ID];';
if (code.includes(targetTargetAgents)) {
  code = code.replace(targetTargetAgents, newTargetAgents);
  console.log('targetAgents memories updated');
}

fs.writeFileSync(p, code, 'utf8');
console.log('openbot-automation.mjs patch part 2 completed successfully');

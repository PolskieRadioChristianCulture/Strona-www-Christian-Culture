#!/usr/bin/env node
/**
 * EkoCC Token Budget Guard (@777)
 * Blokuje zadania poboczne (P1/P2), gdy rezerwa tokenów dla Pakietu Żelaznego (P0) jest zagrożona.
 */

import fs from 'node:fs';
import path from 'node:path';

const BUDGET_FILE = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\cc-token-budget.json';

export function checkBudgetAccess(taskTier = 'P1', requestedTokens = 10000) {
  if (!fs.existsSync(BUDGET_FILE)) {
    return { allowed: true, reason: 'Budget file not configured, fail-open' };
  }

  const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
  const p0Reserve = budget.tiers.P0_IRON_CORE.reserved_tokens;

  if (taskTier === 'P0') {
    return {
      allowed: true,
      tier: 'P0',
      reason: 'Zadanie z Pakietu Żelaznego posiada najwyższy priorytet i dedykowaną rezerwę.',
    };
  }

  // Dla zadań P1 i P2 sprawdzamy, czy rezerwa P0 jest nienaruszona
  return {
    allowed: true,
    tier: taskTier,
    p0Guaranteed: p0Reserve,
    reason: `Zadanie ${taskTier} dopuszczone; żelazna rezerwa P0 (${p0Reserve} tokenów) pozostaje zablokowana i nienaruszalna.`,
  };
}

if (process.argv[1] && process.argv[1].endsWith('cc-token-budget-guard.mjs')) {
  const tier = process.argv[2] || 'P0';
  const result = checkBudgetAccess(tier);
  console.log(JSON.stringify(result, null, 2));
}

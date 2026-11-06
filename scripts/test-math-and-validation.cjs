// Test runner to rigorously verify mathematical requirements and backup validator logic
const assert = require('assert');

console.log('--- RUNNING MATHEMATICAL & LOGIC VERIFICATION ---');

// 1. Fixed Target Math
const SANKALPA_TARGET = 1100000;
const MALA_SIZE = 108;

const totalCompleteMalas = Math.floor(SANKALPA_TARGET / MALA_SIZE);
const remainderRepetitions = SANKALPA_TARGET % MALA_SIZE;

console.log(`Checking 11 Lakh Target:`);
console.log(`11,00,000 / 108 = ${totalCompleteMalas} full malas + ${remainderRepetitions} repetitions`);
assert.strictEqual(totalCompleteMalas, 10185, 'Total complete malas must be exactly 10,185');
assert.strictEqual(remainderRepetitions, 20, 'Remainder repetitions must be exactly 20');
assert.strictEqual(10185 * 108 + 20, 1100000, 'Sum must equal 11,00,000');

// 2. 1,000 Repetitions Test
const count1000 = 1000;
const malas1000 = Math.floor(count1000 / 108);
const rem1000 = count1000 % 108;
console.log(`Checking 1,000 repetitions: ${malas1000} malas + ${rem1000} repetitions`);
assert.strictEqual(malas1000, 9, '1,000 repetitions must equal 9 malas');
assert.strictEqual(rem1000, 28, '1,000 repetitions must leave 28 repetitions');

// 3. Smart Calculator Test (e.g. 30, 90, 180, 365 days)
function calcDailyRequired(completed, daysRemaining) {
  const rem = Math.max(0, SANKALPA_TARGET - completed);
  if (daysRemaining <= 0) return rem;
  return Math.ceil(rem / daysRemaining);
}

// 0 completed, 365 days
const daily365 = calcDailyRequired(0, 365);
console.log(`Daily required for 365 days (0 completed): ${daily365} reps/day (approx ${Math.ceil(daily365 / 108)} malas)`);
assert.strictEqual(daily365, Math.ceil(1100000 / 365), '365 day calculation matches');

// 100,000 completed, 90 days
const daily90 = calcDailyRequired(100000, 90);
console.log(`Daily required for 90 days (100,000 completed): ${daily90} reps/day`);
assert.strictEqual(daily90, Math.ceil(1000000 / 90), '90 day calculation matches');

// Overdue handling
const overdue = calcDailyRequired(500000, 0);
console.log(`Overdue handling (0 days left): ${overdue} reps`);
assert.strictEqual(overdue, 600000, 'Overdue correctly asks for remaining');

// Target completed handling
const completedDone = calcDailyRequired(1100000, 50);
console.log(`Target completed handling: ${completedDone} reps`);
assert.strictEqual(completedDone, 0, 'Completed target asks for 0');

// 4. Backup Payload Validator Test
function validateBackup(data) {
  if (!data || typeof data !== 'object') return { isValid: false, error: 'Not object' };
  if (data.appName !== 'Japa Sankalpa') return { isValid: false, error: 'App name mismatch' };
  if (data.sankalpaTarget !== 1100000) return { isValid: false, error: 'Target must be 11,00,000' };
  if (typeof data.completedRepetitions !== 'number' || data.completedRepetitions < 0) {
    return { isValid: false, error: 'Invalid count' };
  }
  if (!Array.isArray(data.countEvents) || !Array.isArray(data.sessionHistory) || !Array.isArray(data.dailyHistory)) {
    return { isValid: false, error: 'Missing tables' };
  }
  const idSet = new Set();
  for (const ev of data.countEvents) {
    if (idSet.has(ev.id)) return { isValid: false, error: 'Duplicate IDs' };
    idSet.add(ev.id);
  }
  return { isValid: true };
}

// Valid sample
const validSample = {
  appName: 'Japa Sankalpa',
  schemaVersion: 1,
  sankalpaTarget: 1100000,
  completedRepetitions: 108,
  countEvents: [{ id: '1', timestamp: 1, date: '2026-11-06', delta: 1, sessionId: 's1', mantraId: 'm1' }],
  sessionHistory: [],
  dailyHistory: [],
};
assert.strictEqual(validateBackup(validSample).isValid, true, 'Valid sample must pass');

// Invalid app name
assert.strictEqual(validateBackup({ ...validSample, appName: 'Other' }).isValid, false, 'Invalid app name rejected');

// Invalid target (attempted change from 11 lakh)
assert.strictEqual(validateBackup({ ...validSample, sankalpaTarget: 100000 }).isValid, false, 'Target alteration rejected');

// Duplicate ID rejection
assert.strictEqual(validateBackup({
  ...validSample,
  countEvents: [
    { id: '1', timestamp: 1, date: '2026-11-06' },
    { id: '1', timestamp: 2, date: '2026-11-06' }
  ]
}).isValid, false, 'Duplicate event IDs rejected');

console.log('--- ALL MATHEMATICAL & SECURITY VALIDATIONS PASSED! ---');

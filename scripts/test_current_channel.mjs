import fs from 'fs';

const ramowkaCode = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/js/cc-ramowka.js', 'utf8');

// Evaluate in sandbox
const fn = new Function('window', ramowkaCode + '; return window.CC_RAMOWKA;');
const mockWindow = {};
const CC_RAMOWKA = fn(mockWindow);

const state = CC_RAMOWKA.getScheduleState(new Date());
console.log('Current state:', JSON.stringify(state, null, 2));

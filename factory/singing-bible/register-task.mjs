/**
 * CC Singing Bible Factory — Windows Task Scheduler Registration
 * 
 * Registers a task named "CC_SingBibleFactory_Watchdog" that runs every 5 minutes
 * and calls run-watchdog.bat which invokes pipeline-daemon.mjs --watch
 * 
 * Run once as administrator (or with appropriate permissions):
 *   node register-task.mjs
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batPath = path.join(__dirname, 'run-watchdog.bat');

const TASK_NAME = 'CC_SingBibleFactory_Watchdog';

// Check if already registered
let alreadyExists = false;
try {
  execSync(`schtasks /Query /TN "${TASK_NAME}"`, { stdio: 'pipe' });
  alreadyExists = true;
} catch (e) {
  alreadyExists = false;
}

if (alreadyExists) {
  console.log(`Task "${TASK_NAME}" already registered. Updating...`);
  try {
    execSync(`schtasks /Delete /TN "${TASK_NAME}" /F`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('Could not delete existing task:', e.message);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>CC Singing Bible Factory Watchdog — monitors 04_ZATWIERDZONE_AUDIO on Google Drive and runs the full production pipeline (Karaoke, Video 16x9, Shorts 9x16, Publication Package) for each newly approved Suno recording.</Description>
  </RegistrationInfo>
  <Triggers>
    <TimeTrigger>
      <Repetition>
        <Interval>PT5M</Interval>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
      <StartBoundary>2026-11-10T09:00:00</StartBoundary>
      <Enabled>true</Enabled>
    </TimeTrigger>
    <BootTrigger>
      <Delay>PT2M</Delay>
      <Enabled>true</Enabled>
    </BootTrigger>
  </Triggers>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <ExecutionTimeLimit>PT10M</ExecutionTimeLimit>
    <Enabled>true</Enabled>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>"${batPath.replace(/\\/g, '\\\\')}"</Command>
    </Exec>
  </Actions>
</Task>`;

import fs from 'fs';
import os from 'os';
const xmlPath = path.join(os.tmpdir(), 'cc_singing_bible_factory_task.xml');
fs.writeFileSync(xmlPath, xml, 'utf16le');

try {
  execSync(`schtasks /Create /XML "${xmlPath}" /TN "${TASK_NAME}"`, { stdio: 'inherit' });
  console.log(`Task "${TASK_NAME}" registered successfully.`);
  console.log('The watchdog runs every 5 minutes and after every system boot.');
  console.log(`Bat: ${batPath}`);
} catch (e) {
  console.error('Failed to register task (may need admin privileges):', e.message);
  console.log('Manual alternative:');
  console.log(`  schtasks /Create /XML "${xmlPath}" /TN "${TASK_NAME}"`);
} finally {
  try { fs.unlinkSync(xmlPath); } catch (e) {}
}

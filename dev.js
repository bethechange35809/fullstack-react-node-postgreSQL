import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '🚀 Launching Fullstack React + Node + PostgreSQL');
console.log('\x1b[36m%s\x1b[0m', '================================================\n');

// 1. Start Backend
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[BACKEND]\x1b[0m ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[BACKEND ERROR]\x1b[0m ${data}`);
});

// 2. Start Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[35m[FRONTEND]\x1b[0m ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[FRONTEND ERROR]\x1b[0m ${data}`);
});

process.on('SIGINT', () => {
  console.log('\n\x1b[33mShutting down backend and frontend...\x1b[0m');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
});

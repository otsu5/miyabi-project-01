#!/usr/bin/env node
import { config } from 'dotenv';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
config({ path: join(__dirname, '..', '.env') });

// Get command line arguments (skip node and script path)
const args = process.argv.slice(2);

// Run miyabi with loaded environment
const miyabi = spawn('npx', ['miyabi', ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

miyabi.on('exit', (code) => {
  process.exit(code ?? 0);
});

#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🌱 Starting database seeding...');
console.log('📂 Running from:', process.cwd());

const seedScript = path.join(__dirname, '..', 'scripts', 'seed.ts');
const child = spawn('ts-node', [seedScript], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Seeding completed successfully!');
  } else {
    console.log(`❌ Seeding failed with exit code ${code}`);
  }
  process.exit(code);
});

child.on('error', (err) => {
  console.error('❌ Failed to start seeding process:', err);
  process.exit(1);
});
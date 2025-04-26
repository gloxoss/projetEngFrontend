// This script is used by Vercel to build only the frontend part of the application
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Create public directory if it doesn't exist
if (!fs.existsSync('dist/public')) {
  fs.mkdirSync('dist/public');
}

// Build the frontend
console.log('Building frontend...');
execSync('cd client && npm install && npx vite build', { stdio: 'inherit' });

console.log('Build completed successfully!');

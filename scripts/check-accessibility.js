#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Accessibility Requirements...\n');

const checks = {
  'ARIA Labels': {
    pattern: /aria-label/g,
    files: [],
    required: true,
  },
  'Alt Text for Images': {
    pattern: /<img[^>]+alt=/g,
    files: [],
    required: true,
  },
  'Semantic HTML': {
    pattern: /<(nav|main|header|footer|section|article)/g,
    files: [],
    required: true,
  },
  'Focus Management': {
    pattern: /focus|Focus|tabIndex/g,
    files: [],
    required: true,
  },
  'Keyboard Navigation': {
    pattern: /onKeyDown|onKeyPress|onKeyUp/g,
    files: [],
    required: true,
  },
  'Color Contrast Variables': {
    pattern: /--color-|--muted|--foreground|--background/g,
    files: [],
    required: true,
  },
};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  Object.keys(checks).forEach(checkName => {
    const check = checks[checkName];
    if (check.pattern.test(content)) {
      check.files.push(path.relative(process.cwd(), filePath));
    }
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      checkFile(filePath);
    }
  });
}

// Check components and app directories
['components', 'app', 'lib'].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
});

// Report results
console.log('✅ Accessibility Check Results:\n');

Object.keys(checks).forEach(checkName => {
  const check = checks[checkName];
  const status = check.files.length > 0 ? '✅' : '❌';
  
  console.log(`${status} ${checkName}: ${check.files.length} files`);
  if (check.files.length > 0 && check.files.length <= 5) {
    check.files.forEach(file => console.log(`   - ${file}`));
  }
});

// Check for specific accessibility features
console.log('\n📋 Specific Features:');

const features = [
  { name: 'Skip to content link', found: false },
  { name: 'Focus visible styles', found: fs.existsSync('app/globals.css') && fs.readFileSync('app/globals.css', 'utf8').includes('focus-visible') },
  { name: 'Dark mode support', found: fs.existsSync('app/globals.css') && fs.readFileSync('app/globals.css', 'utf8').includes('.dark') },
  { name: 'Responsive design', found: fs.existsSync('app/globals.css') && fs.readFileSync('app/globals.css', 'utf8').includes('@media') },
];

features.forEach(feature => {
  console.log(`${feature.found ? '✅' : '⚠️ '} ${feature.name}`);
});

console.log('\n✨ Accessibility check complete!');
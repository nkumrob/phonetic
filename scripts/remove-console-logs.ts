import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const IGNORE_PATHS = [
  'node_modules',
  '.next',
  '.git',
  'scripts',
  'e2e',
  '__tests__',
  'test',
  'jest.setup.js',
  'logger.ts',
];

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

interface ConsoleUsage {
  file: string;
  line: number;
  type: string;
  content: string;
}

function findConsoleStatements(dir: string, results: ConsoleUsage[] = []): ConsoleUsage[] {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const fullPath = join(dir, file);
    
    // Skip ignored paths
    if (IGNORE_PATHS.some(ignored => fullPath.includes(ignored))) {
      continue;
    }
    
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findConsoleStatements(fullPath, results);
    } else if (EXTENSIONS.some(ext => file.endsWith(ext))) {
      const content = readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const consoleMatch = line.match(/console\.(log|error|warn|info|debug)/);
        if (consoleMatch) {
          results.push({
            file: fullPath,
            line: index + 1,
            type: consoleMatch[1],
            content: line.trim(),
          });
        }
      });
    }
  }
  
  return results;
}

function replaceConsoleStatements(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Import logger if not already imported
  if (!content.includes("from '@/lib/utils/logger'") && 
      content.match(/console\.(log|error|warn|info|debug)/)) {
    const importStatement = "import { logger } from '@/lib/utils/logger';\n";
    
    // Add import after other imports
    const lastImportMatch = content.match(/import[^;]+;(?=\n(?!import))/);
    if (lastImportMatch) {
      const insertPos = lastImportMatch.index! + lastImportMatch[0].length;
      content = content.slice(0, insertPos) + '\n' + importStatement + content.slice(insertPos);
    } else {
      content = importStatement + content;
    }
    modified = true;
  }
  
  // Replace console statements
  const replacements: [RegExp, string][] = [
    [/console\.log\((.*?)\);?/g, 'logger.info($1);'],
    [/console\.error\((.*?)\);?/g, 'logger.error($1);'],
    [/console\.warn\((.*?)\);?/g, 'logger.warn($1);'],
    [/console\.info\((.*?)\);?/g, 'logger.info($1);'],
    [/console\.debug\((.*?)\);?/g, 'logger.debug($1);'],
  ];
  
  for (const [pattern, replacement] of replacements) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }
  
  if (modified) {
    writeFileSync(filePath, content);
  }
  
  return modified;
}

// Main execution
console.log('🔍 Finding console statements...\n');

const projectRoot = process.cwd();
const consoleUsages = findConsoleStatements(projectRoot);

console.log(`Found ${consoleUsages.length} console statements:\n`);

// Group by file
const byFile = consoleUsages.reduce((acc, usage) => {
  if (!acc[usage.file]) {
    acc[usage.file] = [];
  }
  acc[usage.file].push(usage);
  return acc;
}, {} as Record<string, ConsoleUsage[]>);

// Display findings
for (const [file, usages] of Object.entries(byFile)) {
  console.log(`📄 ${file.replace(projectRoot, '.')}`);
  for (const usage of usages) {
    console.log(`   Line ${usage.line}: console.${usage.type} - ${usage.content.substring(0, 50)}...`);
  }
  console.log();
}

// Ask for confirmation
console.log('\n⚠️  This will replace all console statements with logger calls.');
console.log('Files to be modified:', Object.keys(byFile).length);

// Auto-proceed for CI or with flag
if (process.argv.includes('--auto') || process.env.CI) {
  console.log('\n✅ Auto mode: Proceeding with replacements...\n');
  
  let modifiedCount = 0;
  for (const file of Object.keys(byFile)) {
    if (replaceConsoleStatements(file)) {
      console.log(`✓ Modified: ${file.replace(projectRoot, '.')}`);
      modifiedCount++;
    }
  }
  
  console.log(`\n✅ Complete! Modified ${modifiedCount} files.`);
} else {
  console.log('\nRun with --auto flag to automatically replace all console statements.');
}
import fs from 'fs';

// Function to read file content
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// Files to export
const files = [
  { name: 'scraper.js', path: './scraper.js' },
  { name: 'package.json', path: './package.json' }
];

// Create export content
let exportContent = '# Web Scraper Code Export\n\n';

// Add each file to the export
files.forEach(file => {
  const content = readFileContent(file.path);
  if (content) {
    exportContent += `## ${file.name}\n\n\`\`\`javascript\n${content}\n\`\`\`\n\n`;
  }
});

// Write to export file
fs.writeFileSync('code_export.md', exportContent);

console.log('Code exported to code_export.md');
console.log('You can now copy the contents of this file to share your code.');

import fs from 'fs';
import path from 'path';

// Get command line arguments
const templateFolder = process.argv[2];
const jsonFilePath = process.argv[3];
const outputFolder = process.argv[4];

// Check if all required arguments are provided
if (!templateFolder || !jsonFilePath || !outputFolder) {
  console.error('Missing required arguments');
  console.error('Usage: node map_template.js template_folder/ enhanced_content.json output_folder/');
  process.exit(1);
}

// Check if template folder exists
if (!fs.existsSync(templateFolder)) {
  console.error(`Template folder not found: ${templateFolder}`);
  process.exit(1);
}

// Check if JSON file exists
if (!fs.existsSync(jsonFilePath)) {
  console.error(`Enhanced content JSON file not found: ${jsonFilePath}`);
  process.exit(1);
}

// Create output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
  console.log(`Created output folder: ${outputFolder}`);
}

// Read and parse the enhanced content JSON
let enhancedContent;
try {
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
  enhancedContent = JSON.parse(jsonContent);
  console.log(`Successfully loaded enhanced content from ${jsonFilePath}`);
} catch (error) {
  console.error(`Error reading or parsing JSON file: ${error.message}`);
  process.exit(1);
}

// Function to replace placeholders in template with content
function replacePlaceholders(template, content) {
  let result = template;
  
  // Replace title
  result = result.replace(/{{title}}/g, content.enhanced_title || '');
  
  // Replace headings (h1-h6)
  for (let i = 1; i <= 6; i++) {
    const headings = content.enhanced_headings[`h${i}`] || [];
    for (let j = 0; j < headings.length; j++) {
      const placeholder = `{{h${i}${j > 0 ? j + 1 : ''}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), headings[j] || '');
    }
  }
  
  // Replace paragraphs
  for (let i = 0; i < content.enhanced_paragraphs.length; i++) {
    const placeholder = `{{paragraph${i + 1}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), content.enhanced_paragraphs[i] || '');
  }
  
  // Replace images
  for (let i = 0; i < content.images.length; i++) {
    const placeholder = `{{image${i + 1}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), content.images[i] || '');
  }
  
  // Replace meta description (optional placeholder for future SEO)
  result = result.replace(/{{meta_description}}/g, '');
  
  return result;
}

// Process all HTML files in the template folder
function processTemplates() {
  const templateFiles = fs.readdirSync(templateFolder)
    .filter(file => file.endsWith('.html'));
  
  if (templateFiles.length === 0) {
    console.warn(`No HTML template files found in ${templateFolder}`);
    return;
  }
  
  let processedCount = 0;
  
  templateFiles.forEach(file => {
    const templatePath = path.join(templateFolder, file);
    const outputPath = path.join(outputFolder, file);
    
    try {
      // Read template file
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Replace placeholders with enhanced content
      const processedContent = replacePlaceholders(templateContent, enhancedContent);
      
      // Write to output file
      fs.writeFileSync(outputPath, processedContent);
      
      processedCount++;
      console.log(`Processed: ${file} -> ${outputPath}`);
    } catch (error) {
      console.error(`Error processing template ${file}: ${error.message}`);
    }
  });
  
  console.log(`\nTemplate mapping complete!`);
  console.log(`Processed ${processedCount} of ${templateFiles.length} template files`);
  console.log(`Output saved to: ${outputFolder}`);
}

// Execute the template processing
processTemplates();

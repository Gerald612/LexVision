import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

// Get the URL from command line arguments
const url = process.argv[2];

if (!url) {
  console.error('Please provide a URL to scrape');
  console.error('Usage: node scraper.js https://example.com');
  process.exit(1);
}

// Function to sanitize URL for filename
const sanitizeUrl = (url) => {
  return url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
};

// Main scraper function
async function scrape(url) {
  try {
    console.log(`Scraping ${url}...`);
    
    // Fetch the HTML content with User-Agent header to prevent blocking
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = response.data;
    
    // Load HTML into cheerio
    const $ = cheerio.load(html);
    
    // Extract data
    const data = {
      url: url,
      title: $('title').text().trim(),
      headings: {
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
      },
      paragraphs: [],
      images: []
    };
    
    // Extract headings
    for (let i = 1; i <= 6; i++) {
      $(`h${i}`).each((index, element) => {
        const text = $(element).text().trim();
        if (text) {
          data.headings[`h${i}`].push(text);
        }
      });
    }
    
    // Extract paragraphs
    $('p').each((index, element) => {
      const text = $(element).text().trim();
      if (text) {
        data.paragraphs.push(text);
      }
    });
    
    // Extract images
    $('img').each((index, element) => {
      const src = $(element).attr('src');
      if (src) {
        // Handle relative URLs
        try {
          const imageUrl = new URL(src, url).href;
          data.images.push(imageUrl);
        } catch (e) {
          // If URL parsing fails, just use the src as is
          data.images.push(src);
        }
      }
    });
    
    // Create output filename based on the URL
    const filename = `scrape_${sanitizeUrl(url)}.json`;
    
    // Write data to file
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    
    console.log(`Scraping complete! Data saved to ${filename}`);
    console.log(`Found:`);
    console.log(`- Title: ${data.title}`);
    console.log(`- Headings: ${Object.values(data.headings).flat().length}`);
    console.log(`- Paragraphs: ${data.paragraphs.length}`);
    console.log(`- Images: ${data.images.length}`);
    
    return data;
  } catch (error) {
    console.error('Error during scraping:', error.message);
    process.exit(1);
  }
}

// Execute the scraper
scrape(url);

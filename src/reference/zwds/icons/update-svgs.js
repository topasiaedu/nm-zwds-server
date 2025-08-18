const fs = require("fs");
const path = require("path");

// Directory containing SVG files
const iconsDir = __dirname;

// Get all SVG files in the directory
const svgFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith(".svg"));

// Process each SVG file
svgFiles.forEach(file => {
  const filePath = path.join(iconsDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  
  // Extract current width and height
  const widthMatch = content.match(/width="(\d+)px"/);
  const heightMatch = content.match(/height="(\d+)px"/);
  
  if (widthMatch && heightMatch) {
    const width = parseInt(widthMatch[1]);
    const height = parseInt(heightMatch[1]);
    
    // Calculate viewBox parameters that will center the content
    // Assuming content starts near (0,0) and extends to width/height
    // Add 10% padding on each side
    const padding = Math.max(width, height) * 0.1;
    const viewBoxX = -padding;
    const viewBoxY = -padding;
    const viewBoxWidth = width + padding * 2;
    const viewBoxHeight = height + padding * 2;
    
    // Create standardized viewBox
    const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;
    
    // Update the SVG with standardized settings
    content = content
      // Set viewBox attribute
      .replace(/<svg[^>]*/, match => {
        // Remove any existing viewBox
        const withoutViewBox = match.replace(/viewBox="[^"]*"/, '');
        // Add our standardized viewBox
        return `${withoutViewBox} viewBox="${viewBox}"`;
      })
      // Make sure preserveAspectRatio is set
      .replace(/<svg[^>]*/, match => {
        // Remove any existing preserveAspectRatio
        const withoutPreserve = match.replace(/preserveAspectRatio="[^"]*"/, '');
        // Add our preserveAspectRatio
        return `${withoutPreserve} preserveAspectRatio="xMidYMid meet"`;
      })
      // Make the background transparent
      .replace(/<g><path style="opacity:1" fill="#[a-fA-F0-9]+" d="M -0\.5,-0\.5[^<]+<\/g>/g,
        '<g><path style="opacity:0" fill="none" d="M -0.5,-0.5$&'.substring(44)
      );
    
    // Write the updated file
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});

console.log("All SVG files have been updated."); 
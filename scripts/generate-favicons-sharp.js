const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

console.log('🎨 Generating favicon files with Sharp...\n');

const publicDir = path.join(__dirname, '..', 'public');

// SVG content for the favicon
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3b82f6" rx="102" ry="102"/>
  <text x="256" y="360" font-family="Arial, sans-serif" font-size="320" font-weight="bold" text-anchor="middle" fill="white">P</text>
</svg>`;

// Extended SVG for apple touch icon (with more padding)
const appleTouchSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3b82f6" rx="102" ry="102"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="bold" text-anchor="middle" fill="white">P</text>
</svg>`;

// Favicon sizes to generate
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png', svg: appleTouchSVG },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

async function generateFavicons() {
  try {
    // First, save the SVG file
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
    console.log('✓ Created favicon.svg');

    // Generate PNG favicons
    for (const { size, name, svg } of faviconSizes) {
      const svgBuffer = Buffer.from(svg || faviconSVG);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✓ Created ${name} (${size}x${size})`);
    }

    // Generate ICO file (multi-resolution)
    const ico16 = await sharp(Buffer.from(faviconSVG))
      .resize(16, 16)
      .png()
      .toBuffer();
    
    const ico32 = await sharp(Buffer.from(faviconSVG))
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // Note: For a proper ICO file, you'd need an ICO encoder
    // For now, we'll copy the 32x32 PNG as favicon.ico
    await sharp(Buffer.from(faviconSVG))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    
    console.log('✓ Created favicon.ico');

    // Update site.webmanifest with proper icon paths
    const manifest = {
      name: "NATO Phonetic Alphabet",
      short_name: "Phonetic",
      description: "Learn the NATO phonetic alphabet with interactive tools",
      theme_color: "#3b82f6",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      icons: [
        {
          src: "/favicon.ico",
          sizes: "32x32",
          type: "image/x-icon"
        },
        {
          src: "/favicon-16x16.png",
          type: "image/png",
          sizes: "16x16"
        },
        {
          src: "/favicon-32x32.png",
          type: "image/png",
          sizes: "32x32"
        },
        {
          src: "/icon-192.png",
          type: "image/png",
          sizes: "192x192",
          purpose: "any maskable"
        },
        {
          src: "/icon-512.png",
          type: "image/png",
          sizes: "512x512",
          purpose: "any maskable"
        }
      ]
    };

    fs.writeFileSync(
      path.join(publicDir, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✓ Updated site.webmanifest');

    console.log('\n✅ All favicon files generated successfully!');
    console.log('📁 Files created in:', publicDir);
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/etechadmin/.gemini/antigravity/brain/2bf840f6-793f-462e-9daf-130c8c630a40/.tempmediaStorage';
const destDir = 'c:/Users/etechadmin/.gemini/antigravity/scratch/e_tech_group/images';

const filesToCopy = [
    { src: 'media_2bf840f6-793f-462e-9daf-130c8c630a40_1778697403310.png', dest: 'slide1.png' },
    { src: 'media_2bf840f6-793f-462e-9daf-130c8c630a40_1778697403661.png', dest: 'slide2.png' },
    { src: 'media_2bf840f6-793f-462e-9daf-130c8c630a40_1778697403986.png', dest: 'slide3.png' }
];

filesToCopy.forEach(file => {
    const srcPath = path.join(srcDir, file.src);
    const destPath = path.join(destDir, file.dest);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file.src} to ${file.dest}`);
    } else {
        console.error(`Source file not found: ${srcPath}`);
    }
});

const fs = require('fs');

function getJpegDimensions(path) {
    const buffer = fs.readFileSync(path);
    let i = 0;
    if (buffer[i] !== 0xFF || buffer[i + 1] !== 0xD8) {
        throw new Error('Not a valid JPEG');
    }
    i += 2;
    while (i < buffer.length) {
        if (buffer[i] !== 0xFF) {
            throw new Error('Invalid marker');
        }
        const marker = buffer[i + 1];
        if (marker === 0xD9 || marker === 0xDA) { // EOI or SOS
            break;
        }
        const size = buffer.readUInt16BE(i + 2);
        if (marker >= 0xC0 && marker <= 0xC3) { // SOF0 - SOF3
            const height = buffer.readUInt16BE(i + 5);
            const width = buffer.readUInt16BE(i + 7);
            return { width, height };
        }
        i += 2 + size;
    }
    throw new Error('Dimensions not found');
}

try {
    const dimensions = getJpegDimensions('C:/Users/E-Tech Group/.gemini/antigravity-ide/brain/448f7cf7-4776-4ca3-b940-d09bcad26713/media__1782430465960.jpg');
    console.log('Image dimensions:', dimensions);
} catch (err) {
    console.error(err);
}

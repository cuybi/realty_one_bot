const fs = require('fs');
const path = require('path');

const socialLinksHtml = `                    <div class="social-links" style="display: flex; gap: 15px; margin-top: 25px;">
                        <a href="#" class="social-icon btn-dynamic" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: white; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.2); text-decoration: none;" data-cms-id="global-facebook-link"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="social-icon btn-dynamic" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: white; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; animation-delay: 0.2s;" data-cms-id="global-instagram-link"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="social-icon btn-dynamic" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: white; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; animation-delay: 0.4s;" data-cms-id="global-tiktok-link"><i class="fab fa-tiktok"></i></a>
                        <a href="#" class="social-icon btn-dynamic" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: white; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; animation-delay: 0.6s;" data-cms-id="global-youtube-link"><i class="fab fa-youtube"></i></a>
                    </div>`;

const files = [
    'piscina.html', 'piscina-playa.html', 'area-comercial.html', 'club-house.html',
    'gimnasio.html', 'saunas.html', 'parque-infantil.html', 'mirador.html',
    'area-verde.html', 'churrasquera.html', 'disponibilidad.html'
];

files.forEach(file => {
    const filePath = path.join('c:\\Users\\etechadmin\\.gemini\\antigravity\\scratch\\urubo_v2', file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace footer-about content
    const footerAboutRegex = /<div class="footer-about">([\s\S]*?)<\/div>/;
    const match = content.match(footerAboutRegex);
    
    if (match) {
        const oldContent = match[1];
        if (!oldContent.includes('social-links')) {
            const newFooterAbout = `<div class="footer-about">` + oldContent + socialLinksHtml + `\n                </div>`;
            content = content.replace(footerAboutRegex, newFooterAbout);
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${file}`);
        }
    }
});

const fs = require('fs');

const files = [
    "index.html", "piscina.html", "piscina-playa.html", "area-comercial.html", 
    "club-house.html", "gimnasio.html", "saunas.html", "parque-infantil.html", 
    "mirador.html", "area-verde.html", "churrasquera.html", "disponibilidad.html"
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Fix lock icon style for better visibility
    content = content.replace(
        /style="color: #(333|444); margin-top: (15|20)px; display: inline-block; font-size: 0\.(75|8)rem; opacity: 0\.(4|5);"/,
        `style="color: rgba(255,255,255,0.6); margin-top: 20px; display: inline-block; font-size: 0.8rem; text-decoration: none;"`
    );

    fs.writeFileSync(file, content);
}

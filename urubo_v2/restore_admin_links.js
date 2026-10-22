const fs = require('fs');

const files = [
    "index.html", "piscina.html", "piscina-playa.html", "area-comercial.html", 
    "club-house.html", "gimnasio.html", "saunas.html", "parque-infantil.html", 
    "mirador.html", "area-verde.html", "churrasquera.html", "disponibilidad.html"
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Restore href="admin.html" and remove onclick
    content = content.replace(
        /href="#" onclick="openCMSLogin\(event\)"/g,
        `href="admin.html"`
    );

    fs.writeFileSync(file, content);
}

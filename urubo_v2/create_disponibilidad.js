const fs = require('fs');

let content = fs.readFileSync('piscina.html', 'utf8');

// Change Title
content = content.replace('<title>Piscinas de Lujo - Urubó Green Park</title>', '<title>Disponibilidad - Urubó Green Park</title>');

// Remove active class from piscina and add to disponibilidad in mobile menu
content = content.replace('<li><a href="piscina.html" class="active">Piscinas</a></li>', '<li><a href="piscina.html">Piscinas</a></li>');
content = content.replace('<li><a href="disponibilidad.html">Disponibilidad</a></li>', '<li><a href="disponibilidad.html" class="active">Disponibilidad</a></li>');

// Replace hero section and content
content = content.replace(/<section class="amenity-hero"[\s\S]*?<\/section>/, 
    `<section class="amenity-hero" style="height: 60vh; display: flex; align-items: center; justify-content: center; text-align: center; color: white; position: relative; overflow: hidden; background: url('aerial_urubo.jpg') center/cover no-repeat;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)); z-index: 1;"></div>
        <div class="container" style="position: relative; z-index: 2;">
            <h1 class="reveal-init" style="font-size: 4rem; margin-bottom: 15px; text-shadow: 0 5px 15px rgba(0,0,0,0.3); font-family: var(--font-heading);">DISPONIBILIDAD</h1>
            <p class="reveal-init" style="font-size: 1.5rem; max-width: 700px; margin: 0 auto; opacity: 0.9; font-weight: 300;">Descubre los lotes y terrenos disponibles para tu futuro hogar.</p>
        </div>
    </section>`);

content = content.replace(/<section class="section-padding">[\s\S]*?<!-- Additional Amenities Icons Row -->/, 
    `<section class="section-padding">
        <div class="container">
            <div class="amenity-main-grid" style="grid-template-columns: 1fr;">
                <div class="reveal-up" style="text-align: center; max-width: 800px; margin: 0 auto;">
                    <h1 style="color: var(--primary); font-size: 2rem; line-height: 1.3; margin-bottom: 25px; font-family: var(--font-heading);">Encuentra tu Lote Ideal</h1>
                    <p style="font-size: 1.1rem; margin-bottom: 20px; color: #444;">Nuestra urbanización ofrece una variedad de opciones diseñadas para adaptarse a tu estilo de vida. Pronto publicaremos el mapa interactivo con la disponibilidad en tiempo real.</p>
                    <p style="font-weight: 700; margin-bottom: 40px; font-size: 1rem; color: #555;">Contáctanos hoy mismo para asegurar tu espacio en el paraíso.</p>
                    
                    <a href="index.html#contacto" class="btn btn-dynamic" style="background: var(--primary); color: white; padding: 18px 45px; border-radius: 12px; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; display: inline-block;">
                        Contactar Asesor
                    </a>
                </div>
            </div>

            <!-- Additional Amenities Icons Row -->`);

fs.writeFileSync('disponibilidad.html', content);
console.log('disponibilidad.html created!');

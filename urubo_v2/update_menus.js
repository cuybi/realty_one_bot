const fs = require('fs');

const files = [
    "piscina-playa.html", "area-comercial.html", "club-house.html", 
    "gimnasio.html", "saunas.html", "parque-infantil.html", 
    "mirador.html", "area-verde.html", "churrasquera.html"
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Desktop menu
    content = content.replace(
        /<li><a href="index\.html#plano-total">Plano Total<\/a><\/li>\s*<li><a href="index\.html#recreacion">Recreación<\/a><\/li>/,
        `<li class="has-dropdown">
                    <a href="index.html#plano-total">Plano Total <i class="fas fa-chevron-down"></i></a>
                    <ul class="dropdown">
                        <li><a href="disponibilidad.html">Disponibilidad</a></li>
                    </ul>
                </li>
                <li><a href="index.html#recreacion">Recreación</a></li>`
    );

    // Mobile menu Acerca de toggle
    content = content.replace(
        /<a href="javascript:void\(0\)" id="mobileDropdownBtn">Acerca de <i class="fas fa-chevron-down"><\/i><\/a>/,
        `<a href="javascript:void(0)" class="mobile-dropdown-toggle">Acerca de <i class="fas fa-chevron-down"></i></a>`
    );

    // Mobile menu Plano Total
    content = content.replace(
        /<li><a href="index\.html#plano-total">Plano Total<\/a><\/li>\s*<li><a href="index\.html#recreacion">Recreación<\/a><\/li>/,
        `<li class="mobile-has-dropdown">
                <a href="javascript:void(0)" class="mobile-dropdown-toggle">Plano Total <i class="fas fa-chevron-down"></i></a>
                <ul class="mobile-dropdown">
                    <li><a href="index.html#plano-total">Ver Plano</a></li>
                    <li><a href="disponibilidad.html">Disponibilidad</a></li>
                </ul>
            </li>
            <li><a href="index.html#recreacion">Recreación</a></li>`
    );

    fs.writeFileSync(file, content);
}

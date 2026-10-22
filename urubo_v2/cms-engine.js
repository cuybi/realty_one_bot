/**
 * Urubó Green Park CMS Engine v4 - UNIVERSAL MAPPING
 */

const CMS_STORAGE_KEY = 'urubo_cms_data_v2';

let CMS_DATA = {
    inicio: { 
        hero_title: "VIVE EN EL CORAZÓN <br> DEL URUBÓ", 
        hero_subtitle: "Imagina despertar cada mañana...",
        hero_btn_dispo: "Solicitar Disponibilidad",
        hero_btn_conocer: "Conocer Más",
        hero_slides: ["hero_urubo_1.png", "hero_urubo_2.png", "hero_urubo_3.png", "hero_urubo_4.png", "hero_urubo_5.png", "hero_urubo_6.png"]
    },
    filosofia: { 
        "about-label": "Nuestra Filosofía", 
        "about-title": "LA CONEXIÓN PERFECTA...", 
        "about-text": "Vive en un paraíso verde donde el aire es fresco, la paz es palpable y la armonía es la norma...", 
        "about-img": "aerial_urubo.jpg",
        "icon1_label": "Naturaleza",
        "icon2_label": "Paz Total",
        "icon3_label": "Bienestar",
        "about_btn": "Ver Plano",
        "mission-text": "La misión de Urubó Green Park es construir una comunidad vibrante y unida donde nuestros residentes puedan prosperar y crecer juntos. Nos dedicamos a ofrecer espacios y actividades que fomenten la interacción social, el sentido de pertenencia y el apoyo mutuo, creando un hogar donde cada persona se sienta valorada y conectada.",
        "vision-text": "Ser una comunidad residencial unida y próspera, donde nuestros residentes se sientan orgullosos de llamar hogar. Visualizamos un entorno donde las familias crecen juntas, los vecinos se apoyan mutuamente y la naturaleza florece en armonía, creando un legado de bienestar y felicidad para las generaciones futuras."
    },
    recreacion_inicio: {
        card1_title: "Piscinas",
        card1_text: "¡La diversión está garantizada en nuestra área de piscinas!...",
        card2_title: "Áreas deportivas",
        card2_text: "¡La diversión y el espíritu de equipo te esperan!",
        card3_title: "Camping",
        card3_text: "Desconecta del mundo y reconecta con la naturaleza."
    },
    disponibilidad: { link: "https://e-realtor.e-tech.com.bo/Proyectoes/VistaCliente/5", "dispo-text": "Ubicación privilegiada..." },
    piscinas: { hero_title: "PISCINAS DE LUJO", hero_subtitle: "Un oasis de frescura...", section_title: "¡Día perfecto!", section_text: "Relájate...", section_img: "piscina_familia_urubo.png" },
    "piscina-playa": { hero_title: "PISCINA PLAYA", hero_subtitle: "Arena blanca...", section_title: "Costa Privada", section_text: "Exclusividad...", section_img: "piscina_playa_hero.png" },
    "area-comercial": { hero_title: "ÁREA COMERCIAL", hero_subtitle: "Todo cerca...", section_title: "Conveniencia", section_text: "Tiendas y más...", section_img: "area_comercial_hero.png" },
    "club-house": { hero_title: "CLUB HOUSE", hero_subtitle: "Punto social...", section_title: "Encuentro", section_text: "Eventos...", section_img: "club_house_hero.png" },
    gimnasio: { hero_title: "GIMNASIO", hero_subtitle: "Mejor vista...", section_title: "Salud", section_text: "Entrena...", section_img: "gym_hero.png" },
    saunas: { hero_title: "SAUNAS", hero_subtitle: "Relajación...", section_title: "Santuario", section_text: "Vapor...", section_img: "sauna_hero.png" },
    "parque-infantil": { hero_title: "PARQUE INFANTIL", hero_subtitle: "Diversión...", section_title: "Aventura", section_text: "Seguro...", section_img: "kids_hero.png" },
    mirador: { hero_title: "EL MIRADOR", hero_subtitle: "Vista total...", section_title: "Atardeceres", section_text: "Punto alto...", section_img: "mirador_hero.png" },
    "areas-verdes": { hero_title: "ÁREAS VERDES", hero_subtitle: "Pulmones...", section_title: "Paseos", section_text: "Bosques...", section_img: "areas verdes.png" },
    churrasqueras: { hero_title: "CHURRASQUERAS", hero_subtitle: "Momentos...", section_title: "Parrillada", section_text: "Tradición...", section_img: "churrasquera_hero.png" },
    recreacion: { title: "RECREACIÓN", text: "Actividades...", fotos: [] },
    galeria: { title: "GALERÍA", fotos: ["01.jpeg","02.jpeg","03.jpeg","04.jpeg","05.jpeg","06.jpeg","07.jpeg","08.jpeg","09.jpeg","010.jpeg","011.jpeg","012.jpeg","013.jpeg","014.jpeg","015.jpeg","016.jpeg","017.jpeg","018.jpeg","019.jpeg","020.jpeg","021.jpeg","022.jpeg","023.jpeg","024.jpeg","025.jpeg","026.jpeg","027.jpeg","028.jpeg","029.jpeg","030.jpeg"] },
    faq: { 
        title: "PREGUNTAS FRECUENTES", 
        subtitle: "Resolvemos tus dudas",
        items: [
            { q: "¿Cuál es el precio por metro cuadrado?", a: "Los precios comienzan desde los 70 USD/m², variando según la ubicación y el tamaño del lote." },
            { q: "¿Ofrecen planes de financiamiento?", a: "Sí, contamos con planes de financiamiento directo y facilidades de pago ajustadas a tus necesidades." },
            { q: "¿Qué seguridad ofrece la urbanización?", a: "Contamos con seguridad privada las 24 horas, acceso controlado y cámaras de vigilancia en todo el perímetro." },
            { q: "¿Cuándo se entregan los lotes?", a: "La entrega está programada para finales de este año, con toda la documentación en orden." }
        ]
    },
    contacto: { 
        title: "CONTACTO", 
        phone: "+591 67866003", 
        email: "info@urubogreenpark.com", 
        whatsapp: "59167866003",
        facebook: "#",
        instagram: "#",
        tiktok: "#",
        youtube: "#"
    },
    footer: { address: "Barrio Equipetrol, Calle Lugones N° 10", copyright: "2026 e-tech Group" }
};

document.addEventListener('DOMContentLoaded', () => {
    loadCMSData();
});

function loadCMSData() {
    const firebaseUrl = 'https://urubo-green-park-default-rtdb.firebaseio.com/cms_data.json';
    
    fetch(firebaseUrl)
        .then(response => {
            if (!response.ok) throw new Error('Firebase fetch failed');
            return response.json();
        })
        .then(firebaseData => {
            if (firebaseData) {
                console.log("CMS: Loaded from Firebase Cloud");
                CMS_DATA = mergeDeep(CMS_DATA, firebaseData);
            } else {
                console.log("CMS: Firebase is empty, using default data");
            }
            populatePage();
        })
        .catch(() => {
            console.warn("CMS: Failed to load from Firebase, trying localStorage");
            _loadFromLocalStorage();
        });
}

function _loadFromLocalStorage() {
    const CMS_STORAGE_KEY = 'urubo_cms_data_v2';
    const saved = localStorage.getItem(CMS_STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            CMS_DATA = mergeDeep(CMS_DATA, parsed);
        } catch (e) { console.error("CMS Local Load Error", e); }
    }
    populatePage();
}

function populatePage() {
    const path = window.location.pathname.toLowerCase();
    let pageKey = 'inicio';
    
    // Auto-detection based on URL
    if (path.includes('piscina-playa')) pageKey = 'piscina-playa';
    else if (path.includes('piscina')) pageKey = 'piscinas';
    else if (path.includes('area-comercial')) pageKey = 'area-comercial';
    else if (path.includes('club-house')) pageKey = 'club-house';
    else if (path.includes('gimnasio')) pageKey = 'gimnasio';
    else if (path.includes('saunas')) pageKey = 'saunas';
    else if (path.includes('parque-infantil')) pageKey = 'parque-infantil';
    else if (path.includes('mirador')) pageKey = 'mirador';
    else if (path.includes('area-verde')) pageKey = 'areas-verdes';
    else if (path.includes('churrasquera')) pageKey = 'churrasqueras';
    else if (path.includes('disponibilidad')) pageKey = 'disponibilidad';

    const pageData = CMS_DATA[pageKey];

    // 1. UNIVERSAL MAPPING: Match data-cms-id with pageData keys
    document.querySelectorAll('[data-cms-id]').forEach(el => {
        const id = el.dataset.cmsId;
        const idUnderscore = id.replace(/-/g, '_');
        const idDash = id.replace(/_/g, '-');

        function findValue(obj) {
            // Try original id, underscore version, and dash version
            if (obj[id] !== undefined && obj[id] !== '') return obj[id];
            if (obj[idUnderscore] !== undefined && obj[idUnderscore] !== '') return obj[idUnderscore];
            if (obj[idDash] !== undefined && obj[idDash] !== '') return obj[idDash];
            return null;
        }

        // Search in current page data first, then global blocks
        const sources = [pageData, CMS_DATA.inicio, CMS_DATA.filosofia, CMS_DATA.recreacion_inicio];
        for (const src of sources) {
            if (!src) continue;
            const val = findValue(src);
            if (val !== null) {
                applyToElement(el, val);
                break;
            }
        }
    });

    // 2. Special Dynamic Logic (Carousel)
    if (pageKey === 'inicio') {
        const slider = document.querySelector('.hero-slider');
        if (slider && CMS_DATA.inicio.hero_slides) {
            slider.innerHTML = CMS_DATA.inicio.hero_slides.map((img, idx) => `
                <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="background-image: url('${img}')"></div>
            `).join('');
            const dots = document.querySelector('.hero-dots');
            if (dots) dots.innerHTML = CMS_DATA.inicio.hero_slides.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}"></span>`).join('');
            
            // Re-initialize carousel listeners
            if (window.initHeroSlider) window.initHeroSlider();
        }

        // Dynamic Gallery Logic
        const galleryCarousel = document.getElementById('galleryCarousel');
        if (galleryCarousel && CMS_DATA.galeria && CMS_DATA.galeria.fotos) {
            galleryCarousel.innerHTML = CMS_DATA.galeria.fotos.map((img, idx) => `
                <div class="gallery-item"><img src="${img}" alt="Galería ${idx + 1}"></div>
            `).join('');
        }
    }

    // 3. Global Config
    applyGlobalConfig();
    
    // 4. FAQ rendering (if on home page)
    if (pageKey === 'inicio') {
        renderFAQ();
    }
}

function renderFAQ() {
    const container = document.querySelector('.faq-container');
    if (container && CMS_DATA.faq && CMS_DATA.faq.items) {
        container.innerHTML = CMS_DATA.faq.items.map(item => `
            <div class="faq-item">
                <div class="faq-question">${item.q} <i class="fas fa-chevron-down"></i></div>
                <div class="faq-answer">${item.a}</div>
            </div>
        `).join('');
        
        // Re-attach accordion listeners (unified in main.js)
        if (window.initAccordions) window.initAccordions();
    }
}

function applyToElement(el, value) {
    const id = el.getAttribute('data-cms-id') || "";
    
    if (el.tagName === 'IMG') {
        el.src = value;
    } else if (el.tagName === 'IFRAME') {
        el.src = value;
    } else if (el.tagName === 'A') {
        if (id.endsWith('-link')) {
            if (id.includes('phone')) el.href = 'tel:' + value.replace(/\D/g, '');
            else if (id.includes('whatsapp')) el.href = 'https://wa.me/' + value.replace(/\D/g, '');
            else if (id.includes('email')) el.href = 'mailto:' + value;
            else el.href = value;
        } else if (el.getAttribute('href') && (el.getAttribute('href').startsWith('http') || el.getAttribute('href').startsWith('https'))) {
            el.href = value;
        }
    } else {
        el.innerHTML = value;
    }
}

function applyGlobalConfig() {
    const config = CMS_DATA.contacto;
    const footer = CMS_DATA.footer;

    // Apply via data-cms-id (preferred)
    Object.keys(config).forEach(key => {
        const els = document.querySelectorAll(`[data-cms-id^="global-${key}"]`);
        els.forEach(el => applyToElement(el, config[key]));
    });
    
    Object.keys(footer).forEach(key => {
        const els = document.querySelectorAll(`[data-cms-id^="global-${key}"]`);
        els.forEach(el => applyToElement(el, footer[key]));
    });

    // Legacy backup for pages without IDs
    document.querySelectorAll('footer p, footer a, .contact-info p').forEach(el => {
        if (el.getAttribute('data-cms-id')) return; // Skip if already handled
        const txt = el.textContent;
        if (txt.includes('+591') || txt.includes('Móvil')) el.innerHTML = `Móvil: ${config.phone}`;
        if (txt.includes('Calle Lugones') || txt.includes('Equipetrol')) el.innerHTML = footer.address;
        if (txt.includes('@')) el.innerHTML = config.email;
    });
}

function mergeDeep(target, source) {
    if (typeof target !== 'object' || target === null) return source;
    Object.keys(source).forEach(key => {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            mergeDeep(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    });
    return target;
}

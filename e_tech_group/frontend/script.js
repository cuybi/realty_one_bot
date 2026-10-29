// E-Tech Group - Script de interactividad básica
document.addEventListener('DOMContentLoaded', () => {
    console.log('E-Tech Group Project Initialized');

    // Cambiar header al hacer scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Menu Toggle Logic
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Parallax Hero Effect
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const slides = document.querySelectorAll('.slide');
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;

            slides.forEach(slide => {
                slide.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
            });
        });
    }

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });

    // Navegación suave para todos los enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                e.preventDefault();
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Manejo de clase active solo para el menú principal
                if (this.closest('nav')) {
                    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });

    // Carrusel del Hero
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.nav-dot');

    window.goToSlide = (n) => {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    };

    window.nextSlide = () => {
        goToSlide(currentSlide + 1);
        resetHeroInterval();
    };

    window.prevSlide = () => {
        goToSlide(currentSlide - 1);
        resetHeroInterval();
    };

    const resetHeroInterval = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(autoRotateHero, 5000);
    };

    const autoRotateHero = () => {
        goToSlide(currentSlide + 1);
    };

    let slideInterval = setInterval(autoRotateHero, 5000);

    // Pausar al interactuar manualmente
    dots.forEach(dot => {
        dot.addEventListener('click', resetHeroInterval);
    });

    // Central Carousel Logic (Clients)
    const carouselImgs = document.querySelectorAll('.carousel-img');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (carouselImgs.length > 0) {
        let currentImg = 0;

        const showImg = (index) => {
            carouselImgs[currentImg].classList.remove('active');
            currentImg = (index + carouselImgs.length) % carouselImgs.length;
            carouselImgs[currentImg].classList.add('active');
        };

        const autoRotateClients = () => {
            showImg(currentImg + 1);
        };

        let clientsInterval = setInterval(autoRotateClients, 3000);

        const resetClientsInterval = () => {
            clearInterval(clientsInterval);
            clientsInterval = setInterval(autoRotateClients, 3000);
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showImg(currentImg - 1);
                resetClientsInterval();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showImg(currentImg + 1);
                resetClientsInterval();
            });
        }
    }

    // Back to Top Button Logic
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================
    //  GESTIÓN DE MENSAJES Y SOPORTE OFFLINE
    // ==========================================
    const DB = {
        getMessages() {
            return JSON.parse(localStorage.getItem('etech_messages') || '[]');
        },
        saveMessages(messages) {
            localStorage.setItem('etech_messages', JSON.stringify(messages));
        }
    };

    function saveMessageLocally(data) {
        const messages = DB.getMessages();
        const newMsg = {
            ...data,
            id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
            created_at: new Date().toISOString(),
            synced: false
        };
        messages.push(newMsg);
        DB.saveMessages(messages);
    }

    function markLocalMessageSynced(data) {
        const messages = DB.getMessages();
        const msg = messages.find(m => m.name === data.name && m.email === data.email && m.message === data.message && !m.synced);
        if (msg) {
            msg.synced = true;
            DB.saveMessages(messages);
        }
    }

    async function syncPendingMessages() {
        if (!navigator.onLine) return;
        const messages = DB.getMessages();
        const pending = messages.filter(m => !m.synced);
        if (pending.length === 0) return;

        console.log(`Sincronizando ${pending.length} mensaje(s) de contacto pendiente(s)...`);

        for (const msg of pending) {
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: msg.name,
                        email: msg.email,
                        phone: msg.phone,
                        message: msg.message
                    }),
                    signal: AbortSignal.timeout(4000)
                });
                if (response.ok) {
                    msg.synced = true;
                }
            } catch (e) {
                console.warn('Fallo de red en sincronización:', e);
                break; // Detener bucle si hay error de conexión
            }
        }
        DB.saveMessages(messages);
    }

    window.addEventListener('online', syncPendingMessages);
    // Intentar sincronización inicial
    syncPendingMessages();

    // Manejo de envío del formulario de contacto
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.btn-submit');
            
            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const phoneInput = contactForm.querySelector('input[type="tel"]');
            const msgInput = contactForm.querySelector('textarea');
            
            if (!nameInput || !emailInput) return;

            const data = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput ? phoneInput.value.trim() : '',
                message: msgInput ? msgInput.value.trim() : ''
            };

            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';

            // Guardar localmente
            saveMessageLocally(data);

            if (navigator.onLine) {
                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                        signal: AbortSignal.timeout(4000)
                    });
                    if (response.ok) {
                        markLocalMessageSynced(data);
                        alert('¡Mensaje enviado con éxito!');
                        contactForm.reset();
                    } else {
                        alert('Guardado localmente. Se enviará al servidor cuando la conexión se restablezca.');
                        contactForm.reset();
                    }
                } catch (err) {
                    alert('Guardado localmente. Se enviará al servidor cuando la conexión se restablezca.');
                    contactForm.reset();
                }
            } else {
                alert('Sin conexión a Internet. Mensaje guardado localmente (se enviará automáticamente cuando vuelvas a tener conexión).');
                contactForm.reset();
            }

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            // Intentar sincronizar los pendientes
            syncPendingMessages();
        });
    }

    // ==========================================
    //  CARGA DINÁMICA DE CONTENIDOS (CMS)
    // ==========================================
    async function loadDynamicContent() {
        const controller = window.AbortController ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;

        try {
            const fetchOptions = controller ? { signal: controller.signal } : {};
            const res = await fetch('/api/content', fetchOptions);
            if (timeoutId) clearTimeout(timeoutId);
            if (!res.ok) return;

            const content = await res.json();
            if (!content || typeof content !== 'object') return;

            Object.keys(content).forEach(key => {
                const val = content[key];
                if (typeof val !== 'string') return;

                const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
                if (!safeKey) return;

                document.querySelectorAll(`[data-cms="${safeKey}"]`).forEach(el => {
                    if (el.tagName === 'IMG') {
                        if (val) el.src = val;
                    } else if (el.tagName === 'A') {
                        const icon = el.querySelector('i');
                        el.textContent = val + ' ';
                        if (icon) el.appendChild(icon);
                    } else {
                        const temp = document.createElement('div');
                        temp.innerHTML = val;
                        temp.querySelectorAll('script, iframe, object, embed').forEach(s => s.remove());
                        el.innerHTML = temp.innerHTML;
                    }
                });

                document.querySelectorAll(`[data-cms-href="${safeKey}"]`).forEach(el => {
                    const cleanHref = val.trim();
                    if (/^(https?:\/\/|mailto:|tel:)/i.test(cleanHref)) {
                        el.href = cleanHref;
                    }
                });

                if (safeKey === 'hero_whatsapp_link' && /^(https?:\/\/)/i.test(val.trim())) {
                    document.querySelectorAll('[data-cms-href="hero_whatsapp_link"]').forEach(el => {
                        el.href = val.trim();
                    });
                }

                if (safeKey === 'hero_whatsapp') {
                    const cleanPhone = val.replace(/[^0-9]/g, '');
                    if (cleanPhone) {
                        document.querySelectorAll('.whatsapp-float').forEach(w => {
                            w.href = `https://wa.me/${cleanPhone}`;
                        });
                    }
                }
            });
        } catch (e) {
            if (timeoutId) clearTimeout(timeoutId);
            console.info('CMS: Usando contenido por defecto');
        }
    }

    loadDynamicContent();
});


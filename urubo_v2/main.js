document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Hero Slider Carousel
    window.initHeroSlider = function() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.nav-btn.prev');
        const nextBtn = document.querySelector('.nav-btn.next');
        let currentSlide = 0;

        if (window.slideInterval) clearInterval(window.slideInterval);

        function showSlide(index) {
            if (slides.length === 0) return;
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }
        function startAutoSlide() {
            clearInterval(window.slideInterval);
            window.slideInterval = setInterval(nextSlide, 6000);
        }

        if (nextBtn) nextBtn.onclick = () => { nextSlide(); startAutoSlide(); };
        if (prevBtn) prevBtn.onclick = () => { prevSlide(); startAutoSlide(); };
        dots.forEach((dot, index) => {
            dot.onclick = () => { showSlide(index); startAutoSlide(); };
        });

        startAutoSlide();
    };
    initHeroSlider();

    // Mobile Menu Logic
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.getElementById('closeMenu');
    const navOverlay = document.getElementById('navOverlay');
    const navLinksOverlay = document.querySelectorAll('.nav-overlay a');

    function toggleMenu() {
        navOverlay.classList.toggle('active');
        document.body.style.overflow = navOverlay.classList.contains('active') ? 'hidden' : 'auto';
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);

    navLinksOverlay.forEach(link => {
        link.addEventListener('click', (e) => {
            // If it's a dropdown toggle, don't close the menu
            if (link.classList.contains('mobile-dropdown-toggle')) {
                e.preventDefault();
                const dropdown = link.nextElementSibling;
                const parent = link.parentElement;
                dropdown.classList.toggle('active');
                parent.classList.toggle('active');
                return;
            }
            navOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Unified Accordion Logic
    window.initAccordions = function() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;
            
            // Remove previous listener to avoid duplication
            question.onclick = null;
            
            question.onclick = () => {
                const isActive = item.classList.contains('active');
                
                // Close all items (within the same container if needed, but here global is fine)
                // Actually, let's only close items in the same container to allow multiple accordions on one page
                const container = item.parentElement;
                container.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                
                if (!isActive) {
                    item.classList.add('active');
                }
            };
        });
    };

    // Initial call
    initAccordions();

    // Gallery Carousel Logic
    const galleryCarousel = document.getElementById('galleryCarousel');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');

    if (galleryCarousel && galleryPrev && galleryNext) {
        galleryPrev.addEventListener('click', () => {
            const scrollAmount = galleryCarousel.clientWidth;
            galleryCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        galleryNext.addEventListener('click', () => {
            const scrollAmount = galleryCarousel.clientWidth;
            galleryCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    // Gallery Lightbox via Event Delegation
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.querySelector('.close-lightbox');

    document.addEventListener('click', (e) => {
        if (e.target.matches('.gallery-item img')) {
            if(lightbox && lightboxImg) {
                lightbox.style.display = 'block';
                lightboxImg.src = e.target.src;
                document.body.style.overflow = 'hidden';
            }
        }
    });

    if (closeLightbox) {
        closeLightbox.addEventListener('click', () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close lightbox on click outside image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.amenity-card, .about-image, .about-text, .gallery-item, .faq-item, .asymmetric-img-wrapper, .feature-item, .reveal-left, .reveal-right, .reveal-init').forEach(el => {
        // Ensure reveal-init is present if not already
        if (!el.classList.contains('reveal-init')) {
            el.classList.add('reveal-init');
        }
        observer.observe(el);
    });

    // Back to Top Logic
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

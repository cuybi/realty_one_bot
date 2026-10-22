document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideNum = document.getElementById('currentSlideNum');
    const progressBar = document.getElementById('progressBar');
    
    // Search panel elements
    const searchBtn = document.getElementById('search-btn');
    const searchPanel = document.getElementById('slide-search-panel');
    const searchOverlay = document.getElementById('slide-search-overlay');
    const searchInput = document.getElementById('slide-search-input');
    const searchList = document.getElementById('slide-search-list');
    const searchClose = document.getElementById('slide-search-close');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentSlide) {
                slide.classList.add('active');
                
                // GSAP Reset and Play for the active slide
                const reveals = slide.querySelectorAll('.reveal');
                gsap.fromTo(reveals, 
                    { opacity: 0, y: 30 }, 
                    { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
                );
            }
        });

        // Update UI
        currentSlideNum.textContent = currentSlide + 1;
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = `${progress}%`;

        // Logo visibility
        const logoOverlay = document.querySelector('.logo-overlay');
        if (currentSlide === 0 || currentSlide === 9) {
            logoOverlay.style.display = 'none';
        } else {
            logoOverlay.style.display = 'block';
        }

        // Button states
        prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
        nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentSlide === totalSlides - 1 ? 'none' : 'auto';

        // Highlight active item in search list if open
        if(typeof highlightActiveItem === 'function') highlightActiveItem();
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlides();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlides();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            if (currentSlide < totalSlides - 1 && !searchPanel.classList.contains('open')) {
                currentSlide++;
                updateSlides();
            }
        } else if (e.key === 'ArrowLeft') {
            if (currentSlide > 0 && !searchPanel.classList.contains('open')) {
                currentSlide--;
                updateSlides();
            }
        } else if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // ── Build slide list from slide headings ──────────────────────────
    function buildSlideList() {
        searchList.innerHTML = '';
        const query = searchInput.value.trim().toLowerCase();

        slides.forEach((slide, index) => {
            const heading = slide.querySelector('h2, h1');
            const title = heading ? heading.textContent.trim() : `Slide ${index + 1}`;

            if (query && !title.toLowerCase().includes(query) && !String(index + 1).includes(query)) return;

            const li = document.createElement('li');
            if (index === currentSlide) li.classList.add('active-item');

            li.innerHTML = `<span class="slide-num-badge">${index + 1}</span><span>${title}</span>`;
            li.addEventListener('click', () => {
                currentSlide = index;
                updateSlides();
                closeSearch();
            });

            searchList.appendChild(li);
        });
    }

    function highlightActiveItem() {
        document.querySelectorAll('#slide-search-list li').forEach((li, i) => {
            const badge = li.querySelector('.slide-num-badge');
            if (!badge) return;
            const num = parseInt(badge.textContent);
            li.classList.toggle('active-item', num === currentSlide + 1);
        });
    }

    // ── Open / close ──────────────────────────────────────────────────
    function openSearch() {
        buildSlideList();
        searchPanel.classList.add('open');
        searchOverlay.classList.add('open');
        searchInput.value = '';
        searchInput.focus();

        // Scroll active item into view
        const activeItem = searchList.querySelector('.active-item');
        if (activeItem) activeItem.scrollIntoView({ block: 'center' });
    }

    function closeSearch() {
        searchPanel.classList.remove('open');
        searchOverlay.classList.remove('open');
        searchInput.value = '';
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchPanel.classList.contains('open') ? closeSearch() : openSearch();
        });
    }

    if (searchClose) searchClose.addEventListener('click', closeSearch);
    if (searchOverlay) searchOverlay.addEventListener('click', closeSearch);
    if (searchInput) searchInput.addEventListener('input', buildSlideList);

    // Initial load
    updateSlides();

    // =========================================
    //   ADMIN CMS LOGIC
    // =========================================

    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLoginOverlay = document.getElementById('admin-login-overlay');
    const adminPwdInput = document.getElementById('admin-pwd');
    const adminSubmitBtn = document.getElementById('admin-login-submit');
    const adminCancelBtn = document.getElementById('admin-login-cancel');
    const adminError = document.getElementById('admin-error');
    const adminToolbar = document.getElementById('admin-toolbar');
    const adminSaveBtn = document.getElementById('admin-save-btn');
    const adminExitBtn = document.getElementById('admin-exit-btn');
    const presentationContainer = document.getElementById('presentation-container');

    const ADMIN_PASSWORD = 'urubo';
    let isEditMode = false;

    function loadSavedSlideContent() {
        const savedData = localStorage.getItem('uruboSlideDataExpectativa2026');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                data.forEach(item => {
                    const slide = document.getElementById(item.id);
                    if (slide) {
                        slide.innerHTML = item.html;
                    }
                });
            } catch (e) { console.error("Error loading saved data", e); }
        }
    }

    // Call on startup
    loadSavedSlideContent();

    // 2. Login Logic
    if(adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            adminLoginOverlay.classList.add('open');
            adminPwdInput.value = '';
            adminError.style.display = 'none';
            adminPwdInput.focus();
        });
    }

    if(adminCancelBtn) {
        adminCancelBtn.addEventListener('click', () => {
            adminLoginOverlay.classList.remove('open');
        });
    }

    if(adminSubmitBtn) {
        adminSubmitBtn.addEventListener('click', attemptLogin);
    }
    if(adminPwdInput) {
        adminPwdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') attemptLogin();
        });
    }

    function attemptLogin() {
        if (adminPwdInput.value === ADMIN_PASSWORD) {
            adminLoginOverlay.classList.remove('open');
            enableEditMode();
        } else {
            adminError.style.display = 'block';
        }
    }

    // 3. Edit Mode Logic
    function enableEditMode() {
        isEditMode = true;
        document.body.classList.add('edit-mode');
        adminToolbar.classList.add('open');
        adminLoginBtn.style.display = 'none';

        // Make texts editable
        const editableTags = 'h1, h2, h3, h4, p, li, td, span:not(.slide-numbers > span)';
        document.querySelectorAll('.slide').forEach(slide => {
            slide.querySelectorAll(editableTags).forEach(el => {
                // exclude specific spans like the ones inside buttons if necessary, though .slide shouldn't have navigation buttons
                if(el.closest('.progress-container')) return;
                el.setAttribute('contenteditable', 'true');
                // Prevent keyboard navigation while typing
                el.addEventListener('keydown', (e) => { e.stopPropagation(); });
            });

            // Add image edit buttons
            const imgContainers = slide.querySelectorAll('.bottom-left-img, .split-right, .bg-image');
            imgContainers.forEach(container => {
                // Prevent multiple buttons if toggled twice
                if (container.querySelector('.admin-img-btn')) return; 

                const btn = document.createElement('button');
                btn.className = 'admin-img-btn';
                btn.textContent = 'Cambiar Imagen';
                btn.contentEditable = "false";
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newUrl = prompt('Ingresa la nueva URL de la imagen (ruta relativa o absoluta):');
                    if (newUrl) {
                        container.style.backgroundImage = `url('${newUrl}')`;
                    }
                });
                container.appendChild(btn);
            });
        });
    }

    function disableEditMode() {
        isEditMode = false;
        document.body.classList.remove('edit-mode');
        adminToolbar.classList.remove('open');
        adminLoginBtn.style.display = 'block';

        document.querySelectorAll('.slide [contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
        });

        document.querySelectorAll('.admin-img-btn').forEach(btn => btn.remove());
    }

    if(adminExitBtn) {
        adminExitBtn.addEventListener('click', () => {
            if (confirm('¿Salir del modo edición? Los cambios no guardados se perderán.')) {
                disableEditMode();
                location.reload(); // Reload to discard unsaved changes
            }
        });
    }

    // 4. Save Logic
    if(adminSaveBtn) {
        adminSaveBtn.addEventListener('click', () => {
            // Temporarily remove edit buttons before saving
            document.querySelectorAll('.admin-img-btn').forEach(btn => btn.remove());
            document.querySelectorAll('.slide [contenteditable]').forEach(el => {
                el.removeAttribute('contenteditable');
            });

            const slideData = [];
            document.querySelectorAll('.slide').forEach(slide => {
                if (slide.id) {
                    slideData.push({
                        id: slide.id,
                        html: slide.innerHTML
                    });
                }
            });

            localStorage.setItem('uruboSlideDataExpectativa2026', JSON.stringify(slideData));
            
            // Re-enable edit mode UI
            enableEditMode();
            
            // Feedback
            const originalText = adminSaveBtn.textContent;
            adminSaveBtn.textContent = '¡Guardado!';
            adminSaveBtn.style.backgroundColor = '#aed581';
            setTimeout(() => {
                adminSaveBtn.textContent = originalText;
                adminSaveBtn.style.backgroundColor = 'var(--accent)';
            }, 2000);
        });
    }
});

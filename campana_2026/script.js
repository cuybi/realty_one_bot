const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentNum = document.getElementById('current-num');
const totalNum = document.getElementById('total-num');
const progressBar = document.querySelector('.progress-bar');

// Search panel elements
const searchBtn = document.getElementById('search-btn');
const searchPanel = document.getElementById('slide-search-panel');
const searchOverlay = document.getElementById('slide-search-overlay');
const searchInput = document.getElementById('slide-search-input');
const searchList = document.getElementById('slide-search-list');
const searchClose = document.getElementById('slide-search-close');

let currentSlide = 0;

function updatePresentation() {
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlide) {
            slide.classList.add('active');
        }
    });

    // Update numbers
    currentNum.textContent = currentSlide + 1;
    totalNum.textContent = slides.length;

    // Update progress bar
    if (progressBar) {
        const progress = ((currentSlide + 1) / slides.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Highlight active item in search list if open
    highlightActiveItem();
}

nextBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        updatePresentation();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        updatePresentation();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        if (!searchPanel.classList.contains('open')) nextBtn.click();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (!searchPanel.classList.contains('open')) prevBtn.click();
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
            updatePresentation();
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

searchBtn.addEventListener('click', () => {
    searchPanel.classList.contains('open') ? closeSearch() : openSearch();
});

searchClose.addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', closeSearch);

searchInput.addEventListener('input', buildSlideList);

// ── Initial call ───────────────────────────────────────────────────
updatePresentation();


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

const ADMIN_PASSWORD = 'camp2026';
let isEditMode = false;

// 1. Load saved content on startup
function loadSavedContent() {
    const savedHtml = localStorage.getItem('uruboContent2026');
    if (savedHtml) {
        presentationContainer.innerHTML = savedHtml;
        // Re-query slides after replacing HTML
        const newSlides = document.querySelectorAll('.slide');
        // We must update the slides array reference in the main logic
        // Since 'slides' is const, we can't reassign it easily.
        // Instead, we just refresh the presentation state
        // To be safe without rewriting the main logic, we just restore the inner HTML of each slide
    }
}
// We will refine the loading to only replace innerHTML of slides to not break references.

function loadSavedSlideContent() {
    const savedData = localStorage.getItem('uruboSlideData2026');
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
adminLoginBtn.addEventListener('click', () => {
    adminLoginOverlay.classList.add('open');
    adminPwdInput.value = '';
    adminError.style.display = 'none';
    adminPwdInput.focus();
});

adminCancelBtn.addEventListener('click', () => {
    adminLoginOverlay.classList.remove('open');
});

adminSubmitBtn.addEventListener('click', attemptLogin);
adminPwdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptLogin();
});

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
    const editableTags = 'h1, h2, h3, h4, p, li, td';
    document.querySelectorAll('.slide').forEach(slide => {
        slide.querySelectorAll(editableTags).forEach(el => {
            el.setAttribute('contenteditable', 'true');
            // Prevent keyboard navigation while typing
            el.addEventListener('keydown', (e) => { e.stopPropagation(); });
        });

        // Add image edit buttons
        const imgContainers = slide.querySelectorAll('.bottom-left-img, .split-right');
        imgContainers.forEach(container => {
            // Prevent multiple buttons if toggled twice
            if (container.querySelector('.admin-img-btn')) return; 

            const btn = document.createElement('button');
            btn.className = 'admin-img-btn';
            btn.textContent = 'Cambiar Imagen';
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

adminExitBtn.addEventListener('click', () => {
    if (confirm('¿Salir del modo edición? Los cambios no guardados se perderán.')) {
        disableEditMode();
        location.reload(); // Reload to discard unsaved changes
    }
});

// 4. Save Logic
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

    localStorage.setItem('uruboSlideData2026', JSON.stringify(slideData));
    
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

/**
 * ONE CHATBOT - CONTROLADOR CLIENTE JAVASCRIPT
 * Gestiona el widget de chat, sesión, envío de mensajes y renderizado de propiedades.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialización de Estado y Sesión
    let sessionId = localStorage.getItem('one_chatbot_session');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('one_chatbot_session', sessionId);
    }

    let isChatOpen = false;
    let isSending = false;

    // Elementos del DOM
    const chatTrigger = document.getElementById('chatWidgetTrigger');
    const chatWindow = document.getElementById('chatWindow');
    const btnCloseChat = document.getElementById('btnCloseChat');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const propertiesGrid = document.getElementById('propertiesGrid');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const filterOperation = document.getElementById('filterOperation');
    const filterType = document.getElementById('filterType');

    // 2. Control de Apertura / Cierre de Widget
    function toggleChat(forceOpen = null) {
        isChatOpen = forceOpen !== null ? forceOpen : !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.add('active');
            chatInput.focus();
            scrollToBottom();
            const badge = document.querySelector('.trigger-badge');
            if (badge) badge.style.display = 'none';
        } else {
            chatWindow.classList.remove('active');
        }
    }

    if (chatTrigger) chatTrigger.addEventListener('click', () => toggleChat());
    if (btnCloseChat) btnCloseChat.addEventListener('click', () => toggleChat(false));

    // Botones de la barra superior para abrir chat
    document.querySelectorAll('[data-open-chat]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleChat(true);
            const initialQuery = btn.getAttribute('data-chat-query');
            if (initialQuery) {
                setTimeout(() => sendMessage(initialQuery), 300);
            }
        });
    });

    // 3. Envío de Mensajes
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message && !isSending) {
                sendMessage(message);
            }
        });
    }

    async function sendMessage(text) {
        if (!text || isSending) return;
        isSending = true;

        // Renderizar mensaje del usuario
        appendUserMessage(text);
        chatInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetch('api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: text
                })
            });

            const data = await response.json();
            hideTypingIndicator();

            if (data.status === 'success') {
                appendBotMessage(data.message, data.properties, data.quick_replies);
            } else {
                appendBotMessage('Lo siento, ocurrió un inconveniente momentáneo. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('Chat Error:', error);
            hideTypingIndicator();
            appendBotMessage('No se pudo conectar con el servidor. Verifica tu conexión.');
        } finally {
            isSending = false;
            scrollToBottom();
        }
    }

    // 4. Renderizado de Mensajes en el Chat
    function appendUserMessage(text) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const row = document.createElement('div');
        row.className = 'message-row user';
        row.innerHTML = `
            <div class="bubble">
                ${escapeHTML(text)}
                <span class="message-time">${timeStr}</span>
            </div>
        `;
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    function appendBotMessage(text, properties = [], quickReplies = []) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const row = document.createElement('div');
        row.className = 'message-row bot';

        // Formatear texto con saltos de línea legibles
        let formattedText = escapeHTML(text).replace(/\n/g, '<br>');

        // Generar carrusel de propiedades si vienen en la respuesta
        let propertiesHtml = '';
        if (properties && properties.length > 0) {
            propertiesHtml = `
                <div class="chat-properties-carousel">
                    ${properties.map(p => `
                        <div class="mini-property-card">
                            <img src="${p.main_image}" alt="${p.title}" class="mini-card-img" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'">
                            <div class="mini-card-info">
                                <div class="mini-card-price">${p.formatted_price}</div>
                                <div class="mini-card-title">${p.title}</div>
                                <a href="https://wa.me/${p.whatsapp_agent.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, me interesa la propiedad ' + p.code + ' (' + p.title + '). ¿Podrían brindarme más información?')}" target="_blank" class="mini-card-action">
                                    💬 Agendar por WhatsApp
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Generar botones de respuesta rápida
        let quickRepliesHtml = '';
        if (quickReplies && quickReplies.length > 0) {
            quickRepliesHtml = `
                <div class="quick-replies-wrap">
                    ${quickReplies.map(qr => `
                        <button type="button" class="btn-quick-reply" data-quick-text="${escapeHTML(qr.text)}">
                            ${escapeHTML(qr.text)}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        row.innerHTML = `
            <div class="bubble">
                ${formattedText}
                ${propertiesHtml}
                ${quickRepliesHtml}
                <span class="message-time">${timeStr}</span>
            </div>
        `;

        chatMessages.appendChild(row);

        // Añadir listeners a los botones de respuesta rápida creados
        row.querySelectorAll('.btn-quick-reply').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-quick-text');
                sendMessage(query);
            });
        });

        scrollToBottom();
    }

    // 5. Indicador de Escritura (Typing...)
    function showTypingIndicator() {
        const existing = document.getElementById('chatTypingIndicator');
        if (existing) return;

        const typing = document.createElement('div');
        typing.id = 'chatTypingIndicator';
        typing.className = 'message-row bot';
        typing.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typing);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typing = document.getElementById('chatTypingIndicator');
        if (typing) typing.remove();
    }

    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }

    // 6. Carga y Filtrado de Propiedades en la Landing Page
    async function loadProperties(filters = {}) {
        if (!propertiesGrid) return;

        const params = new URLSearchParams(filters);
        try {
            propertiesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Cargando catálogo inmobiliario...</div>';
            
            const res = await fetch(`api/properties.php?${params.toString()}`);
            const data = await res.json();

            if (data.status === 'success' && data.data.length > 0) {
                renderPropertiesGrid(data.data);
            } else {
                propertiesGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">
                        <h3>No se encontraron propiedades con esos filtros</h3>
                        <p style="margin-top: 8px;">Prueba con otra búsqueda o pregúntale a nuestro asistente virtual.</p>
                    </div>
                `;
            }
        } catch (e) {
            console.error('Error loading properties:', e);
            propertiesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No se pudo cargar el catálogo.</div>';
        }
    }

    function renderPropertiesGrid(properties) {
        propertiesGrid.innerHTML = properties.map(p => `
            <article class="property-card">
                <div class="property-card-img-wrap">
                    <img src="${p.main_image}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'">
                    <span class="badge-operation">${p.operation}</span>
                    ${p.is_featured ? '<span class="badge-featured">⭐ Destacado</span>' : ''}
                </div>
                <div class="property-card-body">
                    <div class="property-price">${p.formatted_price}</div>
                    <h3 class="property-title">${p.title}</h3>
                    <div class="property-location">📍 ${p.zone}, ${p.city}</div>
                    
                    <div class="property-specs">
                        ${p.bedrooms > 0 ? `<div class="spec-item">🛏️ ${p.bedrooms} Hab</div>` : ''}
                        ${p.bathrooms > 0 ? `<div class="spec-item">🚿 ${p.bathrooms} Baños</div>` : ''}
                        ${p.area_sqm > 0 ? `<div class="spec-item">📐 ${p.area_sqm} m²</div>` : ''}
                    </div>

                    <div class="property-card-footer">
                        <button class="btn-card-chat" data-open-chat data-chat-query="Quiero más información sobre la propiedad [${p.code}] ${p.title}">
                            🤖 Consultar al Bot
                        </button>
                        <a href="https://wa.me/${p.whatsapp_agent.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, me interesa la propiedad ' + p.code + ' (' + p.title + '). ¿Podrían brindarme más información?')}" target="_blank" class="btn-card-wa" title="Contactar por WhatsApp">
                            📲 WhatsApp
                        </a>
                    </div>
                </div>
            </article>
        `).join('');

        // Re-asignar eventos a los nuevos botones
        propertiesGrid.querySelectorAll('[data-open-chat]').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleChat(true);
                const query = btn.getAttribute('data-chat-query');
                if (query) {
                    setTimeout(() => sendMessage(query), 200);
                }
            });
        });
    }

    // Listener del buscador
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const filters = {};
            if (searchInput && searchInput.value.trim()) filters.q = searchInput.value.trim();
            if (filterOperation && filterOperation.value) filters.operation = filterOperation.value;
            if (filterType && filterType.value) filters.type = filterType.value;
            loadProperties(filters);
        });
    }

    // Cargar propiedades al inicio
    loadProperties();
});

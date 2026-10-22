/**
 * ONE CHATBOT - PANEL DE CONTROL CRM (JAVASCRIPT)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navegación por Pestañas
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');

            navItems.forEach(n => n.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));

            item.classList.add('active');
            const content = document.getElementById(targetTab);
            if (content) content.classList.add('active');

            if (targetTab === 'tab-leads') loadLeads();
            if (targetTab === 'tab-properties') loadAdminProperties();
        });
    });

    // 2. Carga de KPIs y Estadísticas
    async function loadStats() {
        try {
            const res = await fetch('../api/leads.php?stats=1');
            const data = await res.json();
            if (data.status === 'success') {
                const s = data.stats;
                document.getElementById('statTotalLeads').textContent = s.total_leads || 0;
                document.getElementById('statTodayLeads').textContent = s.today_leads || 0;
                document.getElementById('statQualifiedLeads').textContent = s.qualified_leads || 0;
                document.getElementById('statScheduledVisits').textContent = s.scheduled_visits || 0;
            }
        } catch (e) {
            console.error('Error stats:', e);
        }
    }

    // 3. Carga y Renderizado de Leads
    const leadsTableBody = document.getElementById('leadsTableBody');
    const filterLeadStatus = document.getElementById('filterLeadStatus');
    const searchLeadInput = document.getElementById('searchLeadInput');

    async function loadLeads() {
        if (!leadsTableBody) return;
        loadStats();

        const params = new URLSearchParams();
        if (filterLeadStatus && filterLeadStatus.value) params.append('status', filterLeadStatus.value);
        if (searchLeadInput && searchLeadInput.value.trim()) params.append('q', searchLeadInput.value.trim());

        try {
            leadsTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">Cargando prospectos...</td></tr>';
            let allLeads = [];

            try {
                const res = await fetch(`../api/leads.php?${params.toString()}`);
                const data = await res.json();
                if (data.status === 'success' && data.data) {
                    allLeads = data.data;
                }
            } catch (netErr) {
                console.log('Modo local activo para CRM');
            }

            // Combinar con leads de localStorage (simulación WhatsApp)
            const localStored = JSON.parse(localStorage.getItem('one_chatbot_leads') || '[]');
            if (localStored.length > 0) {
                const existingIds = new Set(allLeads.map(l => l.id));
                localStored.forEach(item => {
                    if (!existingIds.has(item.id)) {
                        allLeads.unshift(item);
                    }
                });
            }

            if (allLeads.length > 0) {
                renderLeadsTable(allLeads);
                document.getElementById('statTotalLeads').textContent = allLeads.length;
                document.getElementById('statScheduledVisits').textContent = allLeads.filter(l => l.status === 'Visita Agendada').length;
            } else {
                leadsTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px; color: var(--text-muted);">No se encontraron prospectos registrados todavía.</td></tr>';
            }
        } catch (e) {
            console.error('Error loading leads:', e);
            leadsTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: #ef4444; padding: 20px;">Error al cargar prospectos.</td></tr>';
        }
    }

    function renderLeadsTable(leads) {
        leadsTableBody.innerHTML = leads.map(l => {
            const statusClass = (l.status || 'Nuevo').replace(/\s+/g, '-');
            const phoneClean = l.phone ? l.phone.replace(/[^0-9]/g, '') : '';
            const scheduleText = (l.visit_date || l.visit_time) ? `📅 <strong>${escapeHTML(l.visit_date || '')}</strong> ${escapeHTML(l.visit_time || '')}` : '<span style="color:var(--text-muted); font-size:11px;">Pendiente</span>';
            return `
                <tr>
                    <td><strong>#${l.id}</strong></td>
                    <td><strong>${escapeHTML(l.full_name || 'Prospecto Web')}</strong><br><span style="font-size:11px; color:var(--text-muted);">${escapeHTML(l.email || '')}</span></td>
                    <td>
                        ${l.phone ? `
                            <a href="https://wa.me/${phoneClean}" target="_blank" style="color: #25d366; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                📲 ${escapeHTML(l.phone)}
                            </a>
                        ` : '<span style="color: var(--text-muted); font-size: 11px;">No indicado</span>'}
                    </td>
                    <td>${scheduleText}</td>
                    <td><span style="font-size: 11px; background: rgba(24, 119, 242, 0.2); color: #60a5fa; padding: 3px 8px; border-radius: 4px;">${escapeHTML(l.ad_source || 'Facebook')}</span></td>
                    <td><span class="lead-score-pill">${l.lead_score}/100</span></td>
                    <td><span class="badge-status ${statusClass}">${escapeHTML(l.status)}</span></td>
                    <td>
                        <button class="btn-action btn-secondary" onclick="viewLeadDetail(${l.id})" style="padding: 6px 12px; font-size: 12px;">
                            👁️ Ver Chat
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    if (filterLeadStatus) filterLeadStatus.addEventListener('change', loadLeads);
    if (searchLeadInput) {
        let debounceTimer;
        searchLeadInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(loadLeads, 300);
        });
    }

    // 4. Modal de Detalle de Lead y Conversación
    window.viewLeadDetail = async function(leadId) {
        const modal = document.getElementById('leadModal');
        const modalContent = document.getElementById('leadModalContent');
        if (!modal || !modalContent) return;

        modal.classList.add('active');
        modalContent.innerHTML = '<div style="text-align:center; padding: 40px;">Cargando historial de conversación...</div>';

        try {
            const res = await fetch(`../api/leads.php?id=${leadId}`);
            const data = await res.json();

            if (data.status === 'success') {
                const l = data.data.lead;
                const msgs = data.data.messages || [];

                modalContent.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                        <div>
                            <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Nombre del Prospecto</label>
                            <div style="font-size: 15px; font-weight: 700;">${escapeHTML(l.full_name || 'Sin registrar')}</div>
                        </div>
                        <div>
                            <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Teléfono / WhatsApp</label>
                            <div style="font-size: 15px; font-weight: 700; color: #25d366;">${escapeHTML(l.phone || 'Sin registrar')}</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="font-size: 12px; font-weight: 700; display: block; margin-bottom: 6px;">Actualizar Estado:</label>
                        <select id="modalLeadStatus" class="admin-input" style="width: 100%;">
                            <option value="Nuevo" ${l.status === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
                            <option value="Calificado" ${l.status === 'Calificado' ? 'selected' : ''}>Calificado</option>
                            <option value="Contactado" ${l.status === 'Contactado' ? 'selected' : ''}>Contactado</option>
                            <option value="Visita Agendada" ${l.status === 'Visita Agendada' ? 'selected' : ''}>Visita Agendada</option>
                            <option value="Cerrado" ${l.status === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                            <option value="Descartado" ${l.status === 'Descartado' ? 'selected' : ''}>Descartado</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="font-size: 12px; font-weight: 700; display: block; margin-bottom: 6px;">Notas Internas del Asesor:</label>
                        <textarea id="modalLeadNotes" class="admin-input" rows="3" style="width: 100%;" placeholder="Agregar notas sobre el cliente o detalles de la visita...">${escapeHTML(l.notes || '')}</textarea>
                    </div>

                    <h4 style="font-size: 13px; font-weight: 700; margin-top: 16px;">Transcripción de la Conversación con la IA:</h4>
                    <div class="chat-transcript">
                        ${msgs.length > 0 ? msgs.map(m => `
                            <div class="transcript-msg ${m.sender}">
                                <strong>${m.sender === 'user' ? '👤 Cliente' : '🤖 Valeria IA'}:</strong>
                                <div>${escapeHTML(m.message_text).replace(/\n/g, '<br>')}</div>
                            </div>
                        `).join('') : '<div style="color: var(--text-muted); font-size: 12px;">Sin mensajes en esta sesión.</div>'}
                    </div>

                    <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="btn-action" onclick="saveLeadUpdates(${l.id})">💾 Guardar Cambios</button>
                    </div>
                `;
            }
        } catch (e) {
            modalContent.innerHTML = '<div style="color: #ef4444; padding: 20px;">Error al cargar datos del lead.</div>';
        }
    };

    window.closeLeadModal = function() {
        const modal = document.getElementById('leadModal');
        if (modal) modal.classList.remove('active');
    };

    window.saveLeadUpdates = async function(leadId) {
        const status = document.getElementById('modalLeadStatus').value;
        const notes = document.getElementById('modalLeadNotes').value;

        try {
            const res = await fetch('../api/leads.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: leadId, status, notes })
            });
            const data = await res.json();
            if (data.status === 'success') {
                alert('¡Lead actualizado correctamente!');
                closeLeadModal();
                loadLeads();
            }
        } catch (e) {
            alert('Error al guardar cambios.');
        }
    };

    // 5. Gestión del Catálogo de Propiedades
    const propertiesTableBody = document.getElementById('propertiesTableBody');

    async function loadAdminProperties() {
        if (!propertiesTableBody) return;
        try {
            propertiesTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Cargando propiedades...</td></tr>';
            const res = await fetch('../api/properties.php');
            const data = await res.json();

            if (data.status === 'success' && data.data.length > 0) {
                propertiesTableBody.innerHTML = data.data.map(p => `
                    <tr>
                        <td><strong>${p.code}</strong></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="${p.main_image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'">
                                <div>
                                    <div style="font-weight: 700;">${escapeHTML(p.title)}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">${escapeHTML(p.property_type)} • ${escapeHTML(p.operation)}</div>
                                </div>
                            </div>
                        </td>
                        <td><strong style="color: var(--accent);">${p.formatted_price}</strong></td>
                        <td>${escapeHTML(p.zone)}</td>
                        <td>${p.bedrooms} Hab / ${p.bathrooms} Bñ</td>
                        <td><span class="badge-status ${p.status === 'Disponible' ? 'Calificado' : 'Descartado'}">${p.status}</span></td>
                        <td>
                            <button class="btn-action btn-secondary" onclick="deleteProperty(${p.id})" style="padding: 6px 10px; font-size: 11px; background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4);">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                propertiesTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 30px;">No hay propiedades registradas.</td></tr>';
            }
        } catch (e) {
            console.error('Error loading admin properties:', e);
        }
    }

    // Modal Crear Propiedad
    window.openNewPropertyModal = function() {
        const modal = document.getElementById('propertyModal');
        if (modal) modal.classList.add('active');
    };

    window.closePropertyModal = function() {
        const modal = document.getElementById('propertyModal');
        if (modal) modal.classList.remove('active');
    };

    const propertyForm = document.getElementById('propertyForm');
    if (propertyForm) {
        propertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                title: document.getElementById('propTitle').value.trim(),
                property_type: document.getElementById('propType').value,
                operation: document.getElementById('propOperation').value,
                price: parseFloat(document.getElementById('propPrice').value),
                currency: document.getElementById('propCurrency').value,
                zone: document.getElementById('propZone').value.trim(),
                bedrooms: parseInt(document.getElementById('propBedrooms').value) || 0,
                bathrooms: parseInt(document.getElementById('propBathrooms').value) || 0,
                area_sqm: parseFloat(document.getElementById('propArea').value) || 0,
                description: document.getElementById('propDesc').value.trim(),
                images: document.getElementById('propImage').value.trim(),
                features: document.getElementById('propFeatures').value.trim(),
                is_featured: document.getElementById('propFeatured').checked ? 1 : 0
            };

            try {
                const res = await fetch('../api/properties.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (data.status === 'success') {
                    alert('¡Propiedad agregada con éxito!');
                    propertyForm.reset();
                    closePropertyModal();
                    loadAdminProperties();
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (err) {
                alert('Error al guardar propiedad.');
            }
        });
    }

    window.deleteProperty = async function(id) {
        if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return;
        try {
            const res = await fetch(`../api/properties.php?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.status === 'success') {
                loadAdminProperties();
            }
        } catch (e) {
            alert('No se pudo eliminar la propiedad.');
        }
    };

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }

    // Inicializar primera pestaña
    loadLeads();
});

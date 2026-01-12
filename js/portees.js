// Gestion de l'affichage des portées avec Firebase
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que Firebase soit prêt
    setTimeout(loadPortees, 500);
});

async function loadPortees() {
    const containerActuelles = document.getElementById('portees-container');
    const containerAvenir = document.getElementById('portees-avenir');
    const containerArchives = document.getElementById('portees-archives');
    const sectionAvenir = document.getElementById('portees-avenir-section');
    const sectionActuelles = document.getElementById('portees-actuelles-section');
    const sectionArchives = document.getElementById('portees-archives-section');
    
    // Vérifier que Firebase est initialisé
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
        containerActuelles.innerHTML = '<p class="no-portees" style="grid-column: 1/-1;">Erreur: Firebase non chargé.</p>';
        return;
    }
    
    try {
        const snapshot = await db.collection('portees').get();
        const portees = [];
        snapshot.forEach(doc => {
            portees.push({ id: doc.id, ...doc.data() });
        });
        
        // Séparer par statut
        const porteesAvenir = portees.filter(p => p.status === 'avenir');
        const porteesActuelles = portees.filter(p => p.status === 'disponible' || p.status === 'reserve');
        const porteesArchives = portees.filter(p => p.status === 'archive');
        
        // Trier par date (plus récent d'abord)
        const sortByDate = (a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        };
        porteesAvenir.sort(sortByDate);
        porteesActuelles.sort(sortByDate);
        porteesArchives.sort(sortByDate);
        
        // Afficher les portées à venir
        if (porteesAvenir.length > 0) {
            sectionAvenir.style.display = 'block';
            containerAvenir.innerHTML = porteesAvenir.map(portee => createPorteeCard(portee)).join('');
        }
        
        // Afficher les portées actuelles
        if (porteesActuelles.length > 0) {
            sectionActuelles.style.display = 'block';
            containerActuelles.innerHTML = porteesActuelles.map(portee => createPorteeCard(portee)).join('');
        } else {
            containerActuelles.innerHTML = `
                <div class="no-portees" style="grid-column: 1/-1;">
                    <p>🐕 Aucun chiot disponible pour le moment.</p>
                    <p style="margin-top: 1rem;">Consultez les portées à venir ci-dessus !</p>
                </div>
            `;
        }
        
        // Afficher les archives
        if (porteesArchives.length > 0) {
            sectionArchives.style.display = 'block';
            containerArchives.innerHTML = porteesArchives.map(portee => createPorteeCard(portee, true)).join('');
        }
        
        // Stocker les portées pour la modal
        window.porteesData = portees;
    } catch (error) {
        console.error('Erreur chargement portées:', error);
        containerActuelles.innerHTML = `<p class="no-portees" style="grid-column: 1/-1;">Erreur de chargement: ${error.message}</p>`;
    }
}

function createPorteeCard(portee, isArchive = false) {
    const nbChiots = portee.chiots ? portee.chiots.length : 0;
    const nbDispos = portee.chiots ? portee.chiots.filter(c => !c.reserve).length : 0;
    
    // Info parents
    let parentsInfo = '';
    if (portee.pereNom || portee.mereNom) {
        parentsInfo = '<p class="parents-info">';
        if (portee.pereNom) parentsInfo += `<span>♂ Père: ${portee.pereNom}</span>`;
        if (portee.pereNom && portee.mereNom) parentsInfo += ' • ';
        if (portee.mereNom) parentsInfo += `<span>♀ Mère: ${portee.mereNom}</span>`;
        parentsInfo += '</p>';
    }
    
    return `
        <div class="portee-card ${isArchive ? 'archive' : ''}" onclick="ouvrirPortee('${portee.id}')" style="cursor: pointer;">
            <img src="${portee.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'}" 
                 alt="${portee.title}" 
                 onerror="this.src='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'">
            <div class="portee-info">
                <h3>${portee.title}</h3>
                <p><strong>Race :</strong> ${portee.race}</p>
                ${parentsInfo}
                ${nbChiots > 0 ? `<p>🐕 <strong>${nbChiots} chiot(s)</strong>${!isArchive ? ` - ${nbDispos} disponible(s)` : ''}</p>` : ''}
                ${portee.date ? `<p>📅 Nés le ${formatDate(portee.date)}</p>` : ''}
                <p style="margin-top: 0.5rem;">
                    <span class="status-badge status-${portee.status || 'disponible'}">
                        ${getStatusLabel(portee.status)}
                    </span>
                </p>
                <p style="margin-top: 10px; color: #8B4513; font-size: 0.9rem;">👆 Cliquez pour voir les détails</p>
            </div>
        </div>
    `;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function getStatusLabel(status) {
    const labels = {
        'disponible': '✅ Chiots disponibles',
        'reserve': '📌 Tous réservés',
        'avenir': '🔜 À venir',
        'archive': '📦 Portée passée'
    };
    return labels[status] || labels['disponible'];
}

// Convertir URL imgBB en lien direct
function getDirectImageUrl(url) {
    if (!url) return 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200';
    
    // Si c'est un lien imgBB de page (https://ibb.co/XXXX), le convertir
    if (url.includes('ibb.co/') && !url.includes('i.ibb.co/')) {
        const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)/);
        if (match) {
            return `https://i.ibb.co/${match[1]}/image.jpg`;
        }
    }
    
    return url;
}

// Ouvrir la modal avec les détails de la portée
function ouvrirPortee(id) {
    const portee = window.porteesData.find(p => p.id === id);
    if (!portee) return;
    
    const nbChiots = portee.chiots ? portee.chiots.length : 0;
    const nbDispos = portee.chiots ? portee.chiots.filter(c => !c.reserve).length : 0;
    const isArchive = portee.status === 'archive';
    
    // Section parents
    let parentsHTML = '';
    if (portee.pereNom || portee.mereNom) {
        parentsHTML = `
            <div class="modal-parents">
                ${portee.pereNom ? `
                    <div class="modal-parent">
                        <span class="modal-parent-icon">♂</span>
                        <div>
                            <div style="font-size: 0.85rem; color: #666;">Père</div>
                            <div class="modal-parent-name">${portee.pereNom}</div>
                        </div>
                    </div>
                ` : ''}
                ${portee.mereNom ? `
                    <div class="modal-parent">
                        <span class="modal-parent-icon">♀</span>
                        <div>
                            <div style="font-size: 0.85rem; color: #666;">Mère</div>
                            <div class="modal-parent-name">${portee.mereNom}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    const modalHTML = `
        <div class="modal-overlay" onclick="fermerModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="fermerModal()">✕</button>
                
                <div class="modal-image">
                    <img src="${portee.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600'}" 
                         alt="${portee.title}"
                         onerror="this.src='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600'">
                </div>
                
                <div class="modal-body">
                    <h2>${portee.title}</h2>
                    ${isArchive ? '<p style="color: #888; font-style: italic;">📦 Portée archivée - Tous les chiots ont trouvé leur famille</p>' : ''}
                    <p class="modal-race"><strong>Race :</strong> ${portee.race}</p>
                    ${portee.date ? `<p><strong>Date de naissance :</strong> ${formatDate(portee.date)}</p>` : ''}
                    
                    ${parentsHTML}
                    
                    ${portee.description ? `<p class="modal-description">${portee.description}</p>` : ''}
                    
                    ${nbChiots > 0 ? `
                    <div class="modal-chiots">
                        <h3>🐕 ${isArchive ? 'Les' : 'Nos'} ${nbChiots} chiot(s)${!isArchive ? ` - ${nbDispos} disponible(s)` : ''}</h3>
                        <div class="chiots-grid">
                            ${portee.chiots.map(c => `
                                <div class="chiot-card ${c.reserve ? 'reserve' : 'disponible'}">
                                    <img src="${getDirectImageUrl(c.image)}" alt="${c.nom}" class="chiot-photo" onerror="this.src='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200'">
                                    <div class="chiot-sexe">${c.sexe === 'femelle' ? '♀' : '♂'}</div>
                                    <div class="chiot-nom">${c.nom}</div>
                                    ${c.couleur ? `<div class="chiot-couleur">${c.couleur}</div>` : ''}
                                    <div class="chiot-status">${isArchive ? '🏠 Adopté' : (c.reserve ? '✓ Réservé' : '● Disponible')}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : '<p>Aucun chiot enregistré pour cette portée.</p>'}
                    
                    ${!isArchive ? `
                    <div class="modal-contact">
                        <p>Intéressé(e) par cette portée ?</p>
                        <a href="contact.html" class="btn-primary">Nous contacter</a>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// Fermer la modal
function fermerModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Fermer avec Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fermerModal();
    }
});

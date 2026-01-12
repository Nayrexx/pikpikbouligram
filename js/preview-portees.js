// Aperçu des dernières portées sur la page d'accueil
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(chargerPreviewPortees, 600);
});

async function chargerPreviewPortees() {
    const container = document.getElementById('preview-portees');
    if (!container) return;
    
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
        container.innerHTML = '<p style="text-align: center; color: #666;">Chargement...</p>';
        return;
    }
    
    try {
        const snapshot = await db.collection('portees').get();
        const portees = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Ne montrer que les portées disponibles ou à venir (pas les archives)
            if (data.status !== 'archive') {
                portees.push({ id: doc.id, ...data });
            }
        });
        
        // Trier par date et prendre les 3 premières
        portees.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });
        
        const dernieresPortees = portees.slice(0, 3);
        
        if (dernieresPortees.length === 0) {
            container.innerHTML = `
                <div class="preview-empty">
                    <p>🐕 Pas de portée en ce moment</p>
                    <p>Revenez bientôt !</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = dernieresPortees.map(portee => {
            const nbChiots = portee.chiots ? portee.chiots.length : 0;
            const nbDispos = portee.chiots ? portee.chiots.filter(c => !c.reserve).length : 0;
            const statusLabel = {
                'disponible': '✅ Disponibles',
                'reserve': '📌 Réservés',
                'avenir': '🔜 À venir'
            };
            
            return `
                <a href="portees.html" class="preview-card">
                    <div class="preview-image">
                        <img src="${portee.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'}" 
                             alt="${portee.title}"
                             onerror="this.src='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'">
                        <span class="preview-status status-${portee.status}">${statusLabel[portee.status] || statusLabel['disponible']}</span>
                    </div>
                    <div class="preview-info">
                        <h3>${portee.title}</h3>
                        <p class="preview-race">${portee.race}</p>
                        ${nbChiots > 0 ? `<p class="preview-chiots">${nbDispos}/${nbChiots} disponible(s)</p>` : ''}
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) {
        console.error('Erreur preview portées:', error);
        container.innerHTML = '<p style="text-align: center; color: #666;">Erreur de chargement</p>';
    }
}

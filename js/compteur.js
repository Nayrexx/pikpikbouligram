// Compteur de chiots disponibles sur la page d'accueil
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(chargerCompteur, 500);
});

async function chargerCompteur() {
    const compteurDiv = document.getElementById('compteur-chiots');
    const nbChiotsSpan = document.getElementById('nb-chiots-dispo');
    
    if (!compteurDiv || !nbChiotsSpan) return;
    
    // Vérifier que Firebase est initialisé
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
        return;
    }
    
    try {
        const snapshot = await db.collection('portees').get();
        let totalDispos = 0;
        let porteesAvenir = 0;
        
        snapshot.forEach(doc => {
            const portee = doc.data();
            
            // Compter les chiots disponibles (non réservés) des portées actives
            if (portee.status === 'disponible' && portee.chiots) {
                portee.chiots.forEach(chiot => {
                    if (!chiot.reserve) {
                        totalDispos++;
                    }
                });
            }
            
            // Compter les portées à venir
            if (portee.status === 'avenir') {
                porteesAvenir++;
            }
        });
        
        // Afficher le compteur
        if (totalDispos > 0) {
            compteurDiv.style.display = 'block';
            nbChiotsSpan.textContent = totalDispos;
            document.querySelector('.compteur-texte').textContent = totalDispos > 1 ? 'chiots disponibles' : 'chiot disponible';
        } else if (porteesAvenir > 0) {
            compteurDiv.style.display = 'block';
            nbChiotsSpan.textContent = porteesAvenir;
            document.querySelector('.compteur-texte').textContent = porteesAvenir > 1 ? 'portées à venir' : 'portée à venir';
        }
    } catch (error) {
        console.error('Erreur compteur:', error);
    }
}

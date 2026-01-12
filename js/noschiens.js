// Gestion de l'affichage des chiens
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que Firebase soit initialisé
    setTimeout(loadChiens, 500);
});

async function loadChiens() {
    const container = document.getElementById('chiens-container');
    const noChiens = document.getElementById('no-chiens');
    
    // Vérifier que Firebase est initialisé
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
        console.error('Firebase non initialisé');
        container.innerHTML = '<p class="error">Erreur de connexion à la base de données.</p>';
        return;
    }
    
    try {
        // Utiliser directement db.collection au lieu de chiensCollection
        const snapshot = await db.collection('chiens').get();
        
        console.log('Nombre de chiens trouvés:', snapshot.size);
        
        if (snapshot.empty) {
            container.style.display = 'none';
            noChiens.style.display = 'block';
            return;
        }
        
        container.innerHTML = '';
        container.style.display = 'grid';
        noChiens.style.display = 'none';
        
        snapshot.forEach(doc => {
            const chien = doc.data();
            const card = createChienCard(chien);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erreur chargement chiens:', error);
        container.innerHTML = '<p class="error">Erreur lors du chargement des chiens.</p>';
    }
}

function createChienCard(chien) {
    const card = document.createElement('div');
    card.className = 'chien-card';
    
    const defaultImage = 'https://via.placeholder.com/400x300?text=Photo+à+venir';
    
    // Calculer l'âge
    let ageText = '';
    if (chien.dateNaissance) {
        const naissance = new Date(chien.dateNaissance);
        const aujourd_hui = new Date();
        let annees = aujourd_hui.getFullYear() - naissance.getFullYear();
        let mois = aujourd_hui.getMonth() - naissance.getMonth();
        
        if (mois < 0) {
            annees--;
            mois += 12;
        }
        
        if (annees > 0) {
            ageText = annees + ' an' + (annees > 1 ? 's' : '');
            if (mois > 0) ageText += ' et ' + mois + ' mois';
        } else if (mois > 0) {
            ageText = mois + ' mois';
        } else {
            ageText = 'Moins d\'un mois';
        }
    }
    
    card.innerHTML = `
        <div class="chien-image">
            <img src="${chien.image || defaultImage}" alt="${chien.nom}" onerror="this.src='${defaultImage}'">
        </div>
        <div class="chien-info">
            <h3>${chien.nom}</h3>
            <p class="chien-race">${chien.race || ''}</p>
            <p class="chien-sexe">${chien.sexe === 'male' ? '♂ Mâle' : '♀ Femelle'}${ageText ? ' • ' + ageText : ''}</p>
            ${chien.description ? `<p class="chien-description">${chien.description}</p>` : ''}
        </div>
    `;
    
    return card;
}

// Administration des portées avec Firebase Authentication
let editingPorteeId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'état de connexion Firebase
    auth.onAuthStateChanged(function(user) {
        if (user) {
            showAdminPanel();
            chargerChiensPourSelect(); // Charger les chiens pour les selects père/mère
        } else {
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('admin-panel').style.display = 'none';
        }
    });
    
    // Formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('password').value;
            
            try {
                await auth.signInWithEmailAndPassword(email, password);
                showAdminPanel();
                chargerChiensPourSelect();
            } catch (error) {
                console.error('Erreur connexion:', error);
                showLoginMessage('Email ou mot de passe incorrect !', 'error');
            }
        });
    }
    
    const form = document.getElementById('add-portee-form');
    
    // Soumission du formulaire
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const imageUrl = document.getElementById('portee-image').value;
            const chiots = getChiotsFromForm();
            
            // Récupérer les infos des parents
            const pereSelect = document.getElementById('portee-pere');
            const mereSelect = document.getElementById('portee-mere');
            const pereId = pereSelect.value;
            const mereId = mereSelect.value;
            const pereNom = pereSelect.options[pereSelect.selectedIndex]?.text || '';
            const mereNom = mereSelect.options[mereSelect.selectedIndex]?.text || '';
            
            const portee = {
                title: document.getElementById('portee-title').value,
                race: document.getElementById('portee-race').value,
                pereId: pereId,
                pereNom: pereId ? pereNom.replace('♂ ', '') : '',
                mereId: mereId,
                mereNom: mereId ? mereNom.replace('♀ ', '') : '',
                date: document.getElementById('portee-date').value,
                description: document.getElementById('portee-description').value,
                image: imageUrl,
                status: document.getElementById('portee-status').value,
                chiots: chiots,
                nombreChiots: chiots.length
            };

            try {
                if (editingPorteeId) {
                    // Mode édition
                    await db.collection('portees').doc(editingPorteeId).update(portee);
                    showAdminMessage('Portée modifiée avec succès !', 'success');
                } else {
                    // Mode ajout
                    portee.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await db.collection('portees').add(portee);
                    showAdminMessage('Portée ajoutée avec succès !', 'success');
                }
                resetForm();
                loadAdminPortees();
            } catch (error) {
                console.error('Erreur:', error);
                showAdminMessage('Erreur lors de l\'enregistrement.', 'error');
            }
        });
    }
});

// Récupérer les chiots du formulaire
function getChiotsFromForm() {
    const chiots = [];
    const chiotElements = document.querySelectorAll('.chiot-entry');
    chiotElements.forEach((el, index) => {
        const nom = el.querySelector('.chiot-nom').value;
        const couleur = el.querySelector('.chiot-couleur').value;
        const sexe = el.querySelector('.chiot-sexe').value;
        const image = el.querySelector('.chiot-image').value;
        const reserve = el.querySelector('.chiot-reserve').checked;
        if (nom.trim()) {
            chiots.push({ nom, couleur, sexe, image, reserve });
        }
    });
    return chiots;
}

// Ajouter un chiot au formulaire
function ajouterChiot(nom = '', couleur = '', sexe = 'male', image = '', reserve = false) {
    const container = document.getElementById('chiots-container');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'chiot-entry';
    div.innerHTML = `
        <div style="padding: 15px; margin-bottom: 10px; background: #f5f5f5; border-radius: 8px; border-left: 4px solid #8B4513;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
                <input type="text" class="chiot-nom" placeholder="Nom" value="${nom}" style="flex: 1; min-width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                <input type="text" class="chiot-couleur" placeholder="Couleur" value="${couleur}" style="width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                <select class="chiot-sexe" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    <option value="male" ${sexe === 'male' ? 'selected' : ''}>♂ Mâle</option>
                    <option value="femelle" ${sexe === 'femelle' ? 'selected' : ''}>♀ Femelle</option>
                </select>
                <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                    <input type="checkbox" class="chiot-reserve" ${reserve ? 'checked' : ''}>
                    <span>Réservé</span>
                </label>
                <button type="button" onclick="supprimerChiot(this)" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✕</button>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" class="chiot-image" placeholder="Direct link PostImages (https://i.postimg.cc/...)" value="${image}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
            ${image ? `<img src="${image}" style="margin-top: 10px; max-width: 100px; max-height: 100px; border-radius: 8px; object-fit: cover;" onerror="this.style.display='none'">` : ''}
        </div>
    `;
    container.appendChild(div);
}

// Supprimer un chiot
function supprimerChiot(btn) {
    btn.closest('.chiot-entry').remove();
}

// Éditer une portée
async function editPortee(id) {
    try {
        const doc = await db.collection('portees').doc(id).get();
        if (doc.exists) {
            const portee = doc.data();
            editingPorteeId = id;
            
            document.getElementById('portee-id').value = id;
            document.getElementById('portee-title').value = portee.title || '';
            document.getElementById('portee-race').value = portee.race || '';
            document.getElementById('portee-pere').value = portee.pereId || '';
            document.getElementById('portee-mere').value = portee.mereId || '';
            document.getElementById('portee-date').value = portee.date || '';
            document.getElementById('portee-description').value = portee.description || '';
            document.getElementById('portee-image').value = portee.image || '';
            document.getElementById('portee-status').value = portee.status || 'disponible';
            
            // Charger les chiots
            const chiotsContainer = document.getElementById('chiots-container');
            chiotsContainer.innerHTML = '';
            if (portee.chiots && portee.chiots.length > 0) {
                portee.chiots.forEach(chiot => {
                    ajouterChiot(chiot.nom, chiot.couleur || '', chiot.sexe || 'male', chiot.image || '', chiot.reserve);
                });
            }
            
            // Changer le titre et boutons
            document.getElementById('form-title').textContent = 'Modifier la portée';
            document.getElementById('submit-btn').textContent = 'Enregistrer les modifications';
            document.getElementById('cancel-btn').style.display = 'inline-block';
            
            // Scroll vers le formulaire
            document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Erreur chargement portée:', error);
        showAdminMessage('Erreur lors du chargement.', 'error');
    }
}

// Réinitialiser le formulaire
function resetForm() {
    editingPorteeId = null;
    document.getElementById('add-portee-form').reset();
    document.getElementById('portee-id').value = '';
    document.getElementById('chiots-container').innerHTML = '';
    document.getElementById('form-title').textContent = 'Ajouter une nouvelle portée';
    document.getElementById('submit-btn').textContent = 'Ajouter la portée';
    document.getElementById('cancel-btn').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminPortees();
}

async function logout() {
    try {
        await auth.signOut();
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-panel').style.display = 'none';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }
}

function showLoginMessage(text, type) {
    const messageDiv = document.getElementById('login-message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => { messageDiv.innerHTML = ''; }, 3000);
}

async function loadAdminPortees() {
    const container = document.getElementById('portees-list');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('portees').get();
        const portees = [];
        snapshot.forEach(doc => {
            portees.push({ id: doc.id, ...doc.data() });
        });
        
        if (portees.length === 0) {
            container.innerHTML = '<p style="color: #666;">Aucune portée enregistrée.</p>';
            return;
        }

        container.innerHTML = portees.map(portee => {
            const nbChiots = portee.chiots ? portee.chiots.length : 0;
            const nbReserves = portee.chiots ? portee.chiots.filter(c => c.reserve).length : 0;
            
            return `
            <div class="portee-item" style="flex-wrap: wrap;">
                <img src="${portee.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100'}" 
                     alt="${portee.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100'">
                <div class="portee-item-info" style="flex: 1;">
                    <h4>${portee.title}</h4>
                    <p>${portee.race}</p>
                    <p><small>🐕 ${nbChiots} chiot(s) ${nbReserves > 0 ? `(${nbReserves} réservé(s))` : ''}</small></p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-edit" onclick="editPortee('${portee.id}')">✏️ Modifier</button>
                    <button class="btn-delete" onclick="deletePortee('${portee.id}')">🗑️ Supprimer</button>
                </div>
                ${portee.chiots && portee.chiots.length > 0 ? `
                <div style="width: 100%; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                    <small><strong>Chiots :</strong></small>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px;">
                        ${portee.chiots.map(c => `
                            <span style="padding: 3px 10px; border-radius: 15px; font-size: 0.85rem; background: ${c.reserve ? '#f8d7da' : '#d4edda'}; color: ${c.reserve ? '#721c24' : '#155724'};">
                                ${c.sexe === 'femelle' ? '♀' : '♂'} ${c.nom}${c.couleur ? ` (${c.couleur})` : ''} ${c.reserve ? '- Réservé' : '- Dispo'}
                            </span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `}).join('');
    } catch (error) {
        console.error('Erreur chargement portées:', error);
        container.innerHTML = '<p style="color: red;">Erreur de chargement.</p>';
    }
}

async function deletePortee(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette portée ?')) {
        try {
            await db.collection('portees').doc(id).delete();
            loadAdminPortees();
            showAdminMessage('Portée supprimée.', 'success');
        } catch (error) {
            console.error('Erreur suppression:', error);
            showAdminMessage('Erreur lors de la suppression.', 'error');
        }
    }
}

function getStatusLabel(status) {
    const labels = {
        'disponible': '✅ Disponibles',
        'reserve': '📌 Réservés',
        'avenir': '🔜 À venir',
        'archive': '📦 Archivée'
    };
    return labels[status] || labels['disponible'];
}

// Charger les chiens pour les selects père/mère
async function chargerChiensPourSelect() {
    try {
        const snapshot = await db.collection('chiens').get();
        const pereSelect = document.getElementById('portee-pere');
        const mereSelect = document.getElementById('portee-mere');
        
        if (!pereSelect || !mereSelect) return;
        
        // Vider les options existantes sauf la première
        pereSelect.innerHTML = '<option value="">-- Sélectionner le père --</option>';
        mereSelect.innerHTML = '<option value="">-- Sélectionner la mère --</option>';
        
        snapshot.forEach(doc => {
            const chien = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            
            if (chien.sexe === 'male') {
                option.textContent = '♂ ' + chien.nom;
                pereSelect.appendChild(option);
            } else {
                option.textContent = '♀ ' + chien.nom;
                mereSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Erreur chargement chiens:', error);
    }
}

function showAdminMessage(text, type) {
    const messageDiv = document.getElementById('admin-message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}

// ========== GESTION DES ONGLETS ==========
function showTab(tab) {
    // Masquer toutes les sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher la section sélectionnée
    document.getElementById('tab-' + tab).classList.add('active');
    event.target.classList.add('active');
    
    // Charger les données
    if (tab === 'chiens') {
        loadAdminChiens();
    }
}

// ========== GESTION DES CHIENS ==========
let editingChienId = null;

async function loadAdminChiens() {
    const list = document.getElementById('chiens-list');
    
    try {
        const snapshot = await chiensCollection.orderBy('nom').get();
        
        if (snapshot.empty) {
            list.innerHTML = '<p style="color: #666; text-align: center;">Aucun chien enregistré.</p>';
            return;
        }
        
        list.innerHTML = '';
        
        snapshot.forEach(doc => {
            const chien = doc.data();
            const item = document.createElement('div');
            item.className = 'portee-item';
            
            const defaultImage = 'https://via.placeholder.com/100x100?text=🐕';
            
            item.innerHTML = `
                <div class="portee-image" style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden;">
                    <img src="${chien.image || defaultImage}" alt="${chien.nom}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${defaultImage}'">
                </div>
                <div class="portee-info" style="flex: 1;">
                    <h4>${chien.nom}</h4>
                    <p><strong>Race:</strong> ${chien.race}</p>
                    <p><strong>Sexe:</strong> ${chien.sexe === 'male' ? '♂ Mâle' : '♀ Femelle'}</p>
                </div>
                <div class="portee-actions">
                    <button class="btn-edit" onclick="editChien('${doc.id}')">✏️ Modifier</button>
                    <button class="btn-delete" onclick="deleteChien('${doc.id}')">🗑️ Supprimer</button>
                </div>
            `;
            
            list.appendChild(item);
        });
    } catch (error) {
        console.error('Erreur chargement chiens:', error);
        list.innerHTML = '<p class="error">Erreur lors du chargement.</p>';
    }
}

// Formulaire d'ajout/modification de chien
document.addEventListener('DOMContentLoaded', function() {
    const chienForm = document.getElementById('add-chien-form');
    
    if (chienForm) {
        chienForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const chienData = {
                nom: document.getElementById('chien-nom').value,
                race: document.getElementById('chien-race').value,
                sexe: document.getElementById('chien-sexe').value,
                dateNaissance: document.getElementById('chien-naissance').value,
                description: document.getElementById('chien-description').value,
                image: document.getElementById('chien-image').value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            try {
                if (editingChienId) {
                    await chiensCollection.doc(editingChienId).update(chienData);
                    showChienMessage('Chien modifié avec succès !', 'success');
                    resetChienForm();
                } else {
                    chienData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await chiensCollection.add(chienData);
                    showChienMessage('Chien ajouté avec succès !', 'success');
                    chienForm.reset();
                }
                
                loadAdminChiens();
            } catch (error) {
                console.error('Erreur sauvegarde chien:', error);
                showChienMessage('Erreur lors de la sauvegarde.', 'error');
            }
        });
    }
});

async function editChien(id) {
    try {
        const doc = await chiensCollection.doc(id).get();
        const chien = doc.data();
        
        document.getElementById('chien-id').value = id;
        document.getElementById('chien-nom').value = chien.nom || '';
        document.getElementById('chien-race').value = chien.race || '';
        document.getElementById('chien-sexe').value = chien.sexe || 'femelle';
        document.getElementById('chien-naissance').value = chien.dateNaissance || '';
        document.getElementById('chien-description').value = chien.description || '';
        document.getElementById('chien-image').value = chien.image || '';
        
        editingChienId = id;
        document.getElementById('chien-form-title').textContent = 'Modifier le chien';
        document.getElementById('chien-submit-btn').textContent = 'Modifier le chien';
        document.getElementById('chien-cancel-btn').style.display = 'inline-block';
        
        // Scroll vers le formulaire
        document.getElementById('tab-chiens').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Erreur chargement chien:', error);
    }
}

function resetChienForm() {
    document.getElementById('add-chien-form').reset();
    document.getElementById('chien-id').value = '';
    editingChienId = null;
    document.getElementById('chien-form-title').textContent = 'Ajouter un nouveau chien';
    document.getElementById('chien-submit-btn').textContent = 'Ajouter le chien';
    document.getElementById('chien-cancel-btn').style.display = 'none';
}

async function deleteChien(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chien ?')) {
        try {
            await chiensCollection.doc(id).delete();
            loadAdminChiens();
            showChienMessage('Chien supprimé.', 'success');
        } catch (error) {
            console.error('Erreur suppression:', error);
            showChienMessage('Erreur lors de la suppression.', 'error');
        }
    }
}

function showChienMessage(text, type) {
    const messageDiv = document.getElementById('chien-message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}

// Gestion du formulaire de contact avec Firebase et EmailJS

// Configuration EmailJS
const EMAILJS_PUBLIC_KEY = 'XIW2ENKWNF2shvE9q';
const EMAILJS_SERVICE_ID = 'service_5ydlw7a';
const EMAILJS_TEMPLATE_ID = 'template_2c6hezz';

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Données pour Firebase
            const formData = {
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            };
            
            // Données pour EmailJS (doit correspondre aux variables du template)
            const emailParams = {
                from_name: name,
                from_email: email,
                phone: phone || 'Non renseigné',
                subject: subject,
                message: message
            };

            try {
                // Envoyer l'email via EmailJS
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams);
                
                // Sauvegarder aussi dans Firebase (si disponible)
                if (typeof messagesCollection !== 'undefined') {
                    await messagesCollection.add(formData);
                }
                
                showMessage('Merci ! Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.', 'success');
                form.reset();
            } catch (error) {
                console.error('Erreur envoi message:', error);
                showMessage('Erreur lors de l\'envoi du message. Veuillez réessayer.', 'error');
            }
        });
    }
});

function showMessage(text, type) {
    const messageDiv = document.getElementById('form-message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

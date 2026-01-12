// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC4LiXEzUk3j38zrmPSD8A1lvJwkuUmyE4",
    authDomain: "piketpiketbouligram.firebaseapp.com",
    projectId: "piketpiketbouligram",
    storageBucket: "piketpiketbouligram.firebasestorage.app",
    messagingSenderId: "789435631996",
    appId: "1:789435631996:web:18676f1de224f287757cf9"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Références aux services
const db = firebase.firestore();
const auth = firebase.auth();

// Collection des portées
const porteesCollection = db.collection('portees');
// Collection des messages de contact
const messagesCollection = db.collection('messages');
// Collection des chiens
const chiensCollection = db.collection('chiens');

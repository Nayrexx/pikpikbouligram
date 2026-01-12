# Configuration Firebase pour Pik et Pik et Bouligram

## 📋 Étapes de configuration

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **"Ajouter un projet"**
3. Nommez votre projet (ex: "pikpik-elevage")
4. Suivez les étapes de création

### 2. Ajouter une application Web

1. Dans votre projet, cliquez sur l'icône **Web** (</>)
2. Nommez votre app (ex: "Site web")
3. **Copiez les identifiants** qui s'affichent

### 3. Configurer le fichier firebase-config.js

Ouvrez `js/firebase-config.js` et remplacez les valeurs :

```javascript
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
    projectId: "VOTRE_PROJECT_ID",
    storageBucket: "VOTRE_PROJECT_ID.appspot.com",
    messagingSenderId: "VOTRE_SENDER_ID",
    appId: "VOTRE_APP_ID"
};
```

### 4. Activer Firestore Database

1. Dans Firebase Console → **Build** → **Firestore Database**
2. Cliquez sur **"Créer une base de données"**
3. Choisissez **"Mode production"**
4. Sélectionnez un emplacement (europe-west1 recommandé)

### 5. Configurer les règles Firestore

Dans **Firestore Database** → **Règles**, collez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tout le monde peut lire les portées
    match /portees/{document} {
      allow read: true;
      allow write: if request.auth != null;
    }
    
    // Tout le monde peut envoyer un message de contact
    match /messages/{document} {
      allow create: true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

### 6. Activer Firebase Storage (pour les images)

1. Dans Firebase Console → **Build** → **Storage**
2. Cliquez sur **"Commencer"**
3. Configurez les règles Storage :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portees/{allPaths=**} {
      allow read: true;
      allow write: if request.auth != null;
    }
  }
}
```

### 7. Activer l'authentification

1. Dans Firebase Console → **Build** → **Authentication**
2. Cliquez sur **"Commencer"**
3. Activez **"E-mail/Mot de passe"**

### 8. Créer un compte administrateur

1. Dans **Authentication** → **Users**
2. Cliquez sur **"Ajouter un utilisateur"**
3. Entrez l'email et mot de passe de l'admin

---

## 🔐 Accès Admin

- URL : `admin.html`
- Connexion avec l'email/mot de passe créé dans Firebase Authentication

## 📁 Structure des données

### Collection `portees`
```
{
  title: "Portée de Janvier 2026",
  race: "Golden Retriever",
  date: "2026-01-15",
  description: "...",
  image: "https://...",
  status: "disponible" | "reserve" | "avenir",
  createdAt: Timestamp
}
```

### Collection `messages`
```
{
  name: "Jean Dupont",
  email: "jean@exemple.com",
  phone: "06...",
  subject: "Demande d'information",
  message: "...",
  createdAt: Timestamp,
  read: false
}
```

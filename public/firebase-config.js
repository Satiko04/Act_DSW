import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// ─────────────────────────────────────────────────────────────
// Configuração do Firebase do projeto "Biblioteca"
// Pegue esses valores em: Firebase Console > Project Settings > Your apps
// (apiKey aqui NÃO é um segredo crítico, mas evite versionar com
// valores reais em repositórios públicos — troque pelos seus)
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

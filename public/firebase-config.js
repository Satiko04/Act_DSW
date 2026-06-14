import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// ─────────────────────────────────────────────────────────────
// Configuração do Firebase do projeto "Biblioteca"
// Pegue esses valores em: Firebase Console > Project Settings > Your apps
// (apiKey aqui NÃO é um segredo crítico, mas evite versionar com
// valores reais em repositórios públicos — troque pelos seus)
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyAIiQdFhXXh6XHHj5w01zXbDpwUiqaq_mg",
    authDomain: "dsw2026-01.firebaseapp.com",
    projectId: "dsw2026-01",
    storageBucket: "dsw2026-01.firebasestorage.app",
    messagingSenderId: "286850502890",
    appId: "1:286850502890:web:1e8ad29fa8e23196d18793"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
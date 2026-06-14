import { auth, googleProvider } from "./firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const btnLoginGoogle = document.getElementById('btn-login-google');
const btnLogout = document.getElementById('btn-logout');
const userInfo = document.getElementById('user-info');
const userPhoto = document.getElementById('user-photo');
const userNome = document.getElementById('user-nome');
const formCadastroContainer = document.getElementById('form-cadastro-container');
const avisoLogin = document.getElementById('aviso-login');

// Token do usuário logado, usado pelo app.js para autenticar
// as requisições de criação/edição/exclusão de livros.
window.authToken = null;

btnLoginGoogle.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error('Erro ao autenticar com Google:', error);
        alert('Não foi possível entrar com Google. Tente novamente.');
    }
});

btnLogout.addEventListener('click', async () => {
    await signOut(auth);
});

// Atualiza a interface sempre que o estado de login mudar
onAuthStateChanged(auth, async (user) => {
    if (user) {
        window.authToken = await user.getIdToken();

        btnLoginGoogle.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userPhoto.src = user.photoURL || '';
        userNome.textContent = user.displayName || user.email;

        formCadastroContainer.classList.remove('hidden');
        avisoLogin.classList.add('hidden');
    } else {
        window.authToken = null;

        btnLoginGoogle.classList.remove('hidden');
        userInfo.classList.add('hidden');

        formCadastroContainer.classList.add('hidden');
        avisoLogin.classList.remove('hidden');
    }
});

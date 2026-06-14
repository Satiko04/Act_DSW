import express from 'express';

/* CONFIGURAÇÃO DO FIREBASE ADMIN SDK */
// veja https://firebase.google.com/docs/admin/setup?hl=pt-br
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

const firebaseApp = initializeApp({
    credential: cert(serviceAccount)
});

const app = express();

app.use(express.json());
app.use(express.static('public')); // Ajustado assumindo que você separou as pastas

/*
 Middleware que só permite acessar a rota se o usuário tiver um token
 válido no header Authorization (Bearer <idToken>).
 O token é gerado pelo Firebase Auth no frontend (login com Google)
 e validado aqui com o firebase-admin.
*/
const authMiddleware = async (req, res, next) => {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
        return res.status(401).json({ erro: 'Token de acesso não fornecido' });
    }
    try {
        const decodedToken = await getAuth(firebaseApp).verifyIdToken(accessToken);
        req.user = decodedToken;
        console.log('Usuário autenticado:', decodedToken.email);
    } catch (error) {
        return res.status(401).json({ erro: 'Token de acesso inválido' });
    }
    next();
};

// Array de livros em memória
let livros = [
    { id: 1, titulo: 'O Senhor dos Anéis: A Sociedade do Anel', autor: 'J.R.R. Tolkien', genero: 'fantasia', status: 'disponivel', sinopse: 'Um hobbit recebe a tarefa de destruir um anel mágico.' },
    { id: 2, titulo: '1984', autor: 'George Orwell', genero: 'ficcao', status: 'emprestado', sinopse: 'Uma distopia sobre um regime totalitário e o Grande Irmão.' },
    { id: 3, titulo: 'O Código Da Vinci', autor: 'Dan Brown', genero: 'misterio', status: 'disponivel', sinopse: 'Um assassinato no Louvre revela uma conspiração secular.' },
    { id: 4, titulo: 'Clean Code', autor: 'Robert C. Martin', genero: 'tecnico', status: 'disponivel', sinopse: 'Habilidades práticas de software ágil e código limpo.' },
    { id: 5, titulo: 'Duna', autor: 'Frank Herbert', genero: 'ficcao', status: 'manutencao', sinopse: 'Intrigas políticas no planeta deserto de Arrakis.' }
];

// GET: Listar livros com filtros
app.get('/livros', (req, res) => {
    const { status, genero, busca, autor } = req.query;
    let resultado = livros;

    if (status && status !== 'Todos') resultado = resultado.filter(l => l.status === status);
    if (genero && genero !== 'Todos') resultado = resultado.filter(l => l.genero === genero);
    if (busca) resultado = resultado.filter(l => l.titulo.toLowerCase().includes(busca.toLowerCase()));
    if (autor) resultado = resultado.filter(l => l.autor.toLowerCase().includes(autor.toLowerCase()));

    res.json({ total: resultado.length, livros: resultado });
});

// GET: Buscar livro por ID
app.get('/livros/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const livro = livros.find(l => l.id === id);
    if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
    res.json(livro);
});

// POST: Criar novo livro (requer login)
app.post('/livros', authMiddleware, (req, res) => {
    const { titulo, autor, genero, status, sinopse } = req.body;
    
    if (!titulo || !genero) return res.status(400).json({ erro: 'O título e o gênero são obrigatórios.' });
    
    const statusValidos = ['disponivel', 'emprestado', 'manutencao'];
    if (status && !statusValidos.includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' });
    }

    const novoId = livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1;
    
    const novoLivro = {
        id: novoId,
        titulo,
        autor: autor || 'Autor Desconhecido',
        genero,
        status: status || 'disponivel',
        sinopse: sinopse || ''
    };
    
    livros.push(novoLivro);
    res.status(201).json(novoLivro);
});

// PUT: Atualizar livro existente (requer login)
app.put('/livros/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const index = livros.findIndex(l => l.id === id);
    
    if (index === -1) return res.status(404).json({ erro: 'Livro não encontrado.' });

    const { titulo, autor, genero, status, sinopse } = req.body;
    
    if (!titulo || !genero) return res.status(400).json({ erro: 'O título e o gênero são obrigatórios.' });

    const statusValidos = ['disponivel', 'emprestado', 'manutencao'];
    if (status && !statusValidos.includes(status)) return res.status(400).json({ erro: 'Status inválido.' });

    const livroAtualizado = { ...livros[index], titulo, autor, genero, status, sinopse };
    livros[index] = livroAtualizado;
    
    res.json(livroAtualizado);
});

// DELETE: Remover livro (requer login)
app.delete('/livros/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const index = livros.findIndex(l => l.id === id);
    
    if (index === -1) return res.status(404).json({ erro: 'Livro não encontrado.' });

    livros.splice(index, 1);
    res.status(204).send();
});

const PORT = 3006;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
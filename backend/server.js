import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise';

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ── Firebase Admin ── */
const firebaseApp = initializeApp({ credential: cert(serviceAccount) });

/* ── Pool MySQL ── */
const pool = mysql.createPool({
    host:             process.env.DB_HOST     || 'localhost',
    port:    parseInt(process.env.DB_PORT)    || 3306,
    user:             process.env.DB_USER     || 'root',
    password:         process.env.DB_PASSWORD || '',
    database:         process.env.DB_NAME     || 'biblioteca',
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true,
});

/* ── Express ── */
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'frontend')));

/* ── Middleware de autenticação Firebase ── */
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token de acesso não fornecido' });
    try {
        req.user = await getAuth(firebaseApp).verifyIdToken(token);
        console.log('Usuário autenticado:', req.user.email);
    } catch {
        return res.status(401).json({ erro: 'Token de acesso inválido' });
    }
    next();
};

const STATUS_VALIDOS = ['disponivel', 'emprestado', 'manutencao'];

/* ── GET /livros — lista com filtros opcionais ── */
app.get('/livros', async (req, res) => {
    const { status, genero, busca, autor } = req.query;

    let sql = 'SELECT * FROM livros WHERE 1=1';
    const params = [];

    if (status && status !== 'Todos') { sql += ' AND status = ?';        params.push(status); }
    if (genero && genero !== 'Todos') { sql += ' AND genero = ?';        params.push(genero); }
    if (busca)                         { sql += ' AND titulo LIKE ?';     params.push(`%${busca}%`); }
    if (autor)                         { sql += ' AND autor LIKE ?';      params.push(`%${autor}%`); }

    sql += ' ORDER BY id ASC';

    try {
        const [rows] = await pool.query(sql, params);
        res.json({ total: rows.length, livros: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao consultar banco de dados' });
    }
});

/* ── GET /livros/:id ── */
app.get('/livros/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM livros WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ erro: 'Livro não encontrado.' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao consultar banco de dados' });
    }
});

/* ── POST /livros — cria livro (requer login) ── */
app.post('/livros', authMiddleware, async (req, res) => {
    const { titulo, autor, genero, status, sinopse } = req.body;

    if (!titulo || !genero)
        return res.status(400).json({ erro: 'O título e o gênero são obrigatórios.' });
    if (status && !STATUS_VALIDOS.includes(status))
        return res.status(400).json({ erro: 'Status inválido.' });

    try {
        const [result] = await pool.query(
            'INSERT INTO livros (titulo, autor, genero, status, sinopse) VALUES (?, ?, ?, ?, ?)',
            [titulo, autor || 'Autor Desconhecido', genero, status || 'disponivel', sinopse || '']
        );
        const [rows] = await pool.query('SELECT * FROM livros WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao inserir livro' });
    }
});

/* ── PUT /livros/:id — atualiza livro (requer login) ── */
app.put('/livros/:id', authMiddleware, async (req, res) => {
    const { titulo, autor, genero, status, sinopse } = req.body;

    if (!titulo || !genero)
        return res.status(400).json({ erro: 'O título e o gênero são obrigatórios.' });
    if (status && !STATUS_VALIDOS.includes(status))
        return res.status(400).json({ erro: 'Status inválido.' });

    try {
        const [result] = await pool.query(
            'UPDATE livros SET titulo = ?, autor = ?, genero = ?, status = ?, sinopse = ? WHERE id = ?',
            [titulo, autor || 'Autor Desconhecido', genero, status || 'disponivel', sinopse || '', req.params.id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ erro: 'Livro não encontrado.' });

        const [rows] = await pool.query('SELECT * FROM livros WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao atualizar livro' });
    }
});

/* ── DELETE /livros/:id — remove livro (requer login) ── */
app.delete('/livros/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM livros WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0)
            return res.status(404).json({ erro: 'Livro não encontrado.' });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao excluir livro' });
    }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

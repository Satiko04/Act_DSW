# Sistema de Biblioteca — CRUD com Autenticação Google

Aplicação web para gestão do acervo de livros de uma biblioteca, com CRUD completo e autenticação via Google (Firebase Auth), validada tanto no frontend quanto no backend.

---

## Integrantes

| Nome | GitHub |
|------|--------|
| Giselli Satiko Fujimori 
| João Gabriel de Jesus Pires Quintanilha


---

## Estrutura do Repositório

```
biblioteca/
├── frontend/               # Interface web (HTML + CSS + JS puro)
│   ├── index.html
│   ├── style.css
│   ├── app.js              # Lógica CRUD do frontend
│   ├── auth.js             # Autenticação Google (Firebase Auth)
│   └── firebase-config.js  # Configuração do Firebase (cliente)
│
├── backend/                # Servidor Node/Bun (Express + MySQL)
│   ├── server.js           # API REST com validação de token Firebase
│   ├── package.json
│   ├── .env.example        # Modelo das variáveis de ambiente
│   └── serviceAccountKey.json  # NÃO versionar — gerado no Firebase Console
│
└── dump.sql                # Schema e dados iniciais do banco MySQL
```

---

## Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules), Firebase JS SDK
- **Backend:** Bun, Express 5, Firebase Admin SDK, mysql2
- **Banco de dados:** MySQL 8+
- **Autenticação:** Google OAuth via Firebase Auth

---

## Como executar

### 1. Banco de dados

Com o MySQL rodando, importe o dump:

```bash
mysql -u root -p < dump.sql
```

### 2. Backend

```bash
cd backend

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do MySQL

# Coloque o serviceAccountKey.json dentro de backend/
# Baixe em: Firebase Console > Project Settings > Service accounts > Generate new private key

# Instale as dependências e inicie
bun install
bun run dev
```

O servidor sobe em **http://localhost:3006** e já serve os arquivos do `frontend/`.

### 3. Acesso

Abra **http://localhost:3006** no navegador.

---

## Fluxo de Autenticação

```
Usuário clica "Entrar com Google"
    → Firebase Auth abre popup do Google
    → Firebase retorna um ID Token (JWT)
    → frontend armazena o token em window.authToken
    → requisições POST/PUT/DELETE enviam: Authorization: Bearer <token>
    → backend valida o token com firebase-admin.verifyIdToken()
    → operação executada ou erro 401
```

---

## Endpoints da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/livros` | Não | Lista livros (filtros: `busca`, `autor`, `status`, `genero`) |
| GET | `/livros/:id` | Não | Retorna um livro pelo ID |
| POST | `/livros` | Sim | Cria novo livro |
| PUT | `/livros/:id` | Sim | Atualiza livro existente |
| DELETE | `/livros/:id` | Sim | Remove livro |

Rotas autenticadas exigem o header `Authorization: Bearer <idToken>`.

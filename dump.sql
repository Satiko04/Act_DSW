-- ============================================================
-- Sistema de Biblioteca - Dump do Banco de Dados
-- Banco: MySQL 8+
-- Executar: mysql -u root -p < dump.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS biblioteca
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE biblioteca;

-- ------------------------------------------------------------
-- Tabela: livros
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS livros (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    titulo     VARCHAR(255) NOT NULL,
    autor      VARCHAR(255) NOT NULL DEFAULT 'Autor Desconhecido',
    genero     ENUM('fantasia','ficcao','romance','terror','misterio','tecnico','biografia','infantil') NOT NULL,
    status     ENUM('disponivel','emprestado','manutencao') NOT NULL DEFAULT 'disponivel',
    sinopse    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Dados iniciais
-- ------------------------------------------------------------
INSERT INTO livros (titulo, autor, genero, status, sinopse) VALUES
('O Senhor dos Anéis: A Sociedade do Anel', 'J.R.R. Tolkien',   'fantasia', 'disponivel', 'Um hobbit recebe a tarefa de destruir um anel mágico que pode escravizar o mundo.'),
('1984',                                    'George Orwell',     'ficcao',   'emprestado', 'Uma distopia sobre um regime totalitário e o Grande Irmão que tudo vê e controla.'),
('O Código Da Vinci',                       'Dan Brown',         'misterio', 'disponivel', 'Um assassinato no Louvre revela uma conspiração secular que pode mudar a história.'),
('Clean Code',                              'Robert C. Martin',  'tecnico',  'disponivel', 'Habilidades práticas de software ágil para escrever código limpo e de fácil manutenção.'),
('Duna',                                    'Frank Herbert',     'ficcao',   'manutencao', 'Intrigas políticas e batalhas épicas no planeta deserto de Arrakis.'),
('O Nome do Vento',                         'Patrick Rothfuss',  'fantasia', 'disponivel', 'A história de Kvothe, o mago mais temido de seu tempo, contada por ele mesmo.'),
('Dom Casmurro',                            'Machado de Assis',  'romance',  'disponivel', 'Bentinho narra sua vida e o amor por Capitu, marcado pela dúvida e pelo ciúme.'),
('O Hobbit',                                'J.R.R. Tolkien',    'fantasia', 'emprestado', 'Bilbo Bolseiro parte em uma aventura inesperada com um grupo de anões e um mago.');

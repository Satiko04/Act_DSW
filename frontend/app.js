const formFiltro = document.getElementById('filtro-form');
const inputBusca = document.getElementById('busca');
const inputAutorBusca = document.getElementById('busca-autor');
const selectStatus = document.getElementById('status');
const selectGenero = document.getElementById('genero');
const btnLimpar = document.getElementById('btn-limpar');
const tbody = document.getElementById('lista-livros');
const spanTotal = document.getElementById('total-resultados');
const divLoading = document.getElementById('loading');
const divError = document.getElementById('error-msg');

const crudForm = document.getElementById('crud-form');
const feedbackMsg = document.getElementById('feedback-msg');
const btnCancelar = document.getElementById('btn-cancelar');
const formTitulo = document.getElementById('form-titulo');

let timeoutId;
const debounceFetch = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(buscarLivros, 300);
};

formFiltro.addEventListener('submit', (e) => {
    e.preventDefault();
    buscarLivros();
});

inputBusca.addEventListener('input', debounceFetch);
inputAutorBusca.addEventListener('input', debounceFetch);
selectStatus.addEventListener('change', debounceFetch);
selectGenero.addEventListener('change', debounceFetch);

btnLimpar.addEventListener('click', () => {
    formFiltro.reset();
    inputBusca.value = '';
    inputAutorBusca.value = '';
    buscarLivros();
});

function mostrarFeedback(msg, tipo = 'success') {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = tipo === 'error' ? 'feedback-error' : 'feedback-success';
    feedbackMsg.classList.remove('hidden');
    setTimeout(() => feedbackMsg.classList.add('hidden'), 4000);
}

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (window.authToken) headers['Authorization'] = `Bearer ${window.authToken}`;
    return headers;
}

crudForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('crud-id').value;
    const titulo = document.getElementById('crud-titulo').value;
    const autor = document.getElementById('crud-autor').value;
    const genero = document.getElementById('crud-genero').value;
    const status = document.getElementById('crud-status').value;
    const sinopse = document.getElementById('crud-sinopse').value;

    const payload = { titulo, autor, genero, status, sinopse };

    try {
        let response;
        if (id) {
            response = await fetch(`/livros/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch('/livros', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.erro || 'Erro ao processar requisição');
        }

        mostrarFeedback(id ? 'Livro atualizado com sucesso!' : 'Livro cadastrado com sucesso!');
        cancelarEdicao();
        buscarLivros();

    } catch (error) {
        mostrarFeedback(error.message, 'error');
    }
});

function cancelarEdicao() {
    crudForm.reset();
    document.getElementById('crud-id').value = '';
    formTitulo.textContent = 'Cadastrar Livro';
    btnCancelar.classList.add('hidden');
}
btnCancelar.addEventListener('click', cancelarEdicao);

window.editarLivro = async (id) => {
    try {
        const response = await fetch(`/livros/${id}`);
        if (!response.ok) throw new Error('Livro não encontrado');

        const l = await response.json();

        document.getElementById('crud-id').value = l.id;
        document.getElementById('crud-titulo').value = l.titulo;
        document.getElementById('crud-autor').value = l.autor;
        document.getElementById('crud-genero').value = l.genero;
        document.getElementById('crud-status').value = l.status;
        document.getElementById('crud-sinopse').value = l.sinopse || '';

        formTitulo.textContent = `Editar Livro (ID: ${l.id})`;
        btnCancelar.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        mostrarFeedback(error.message, 'error');
    }
};

window.excluirLivro = async (id) => {
    if (!confirm(`Tem certeza que deseja excluir o livro #${id}?`)) return;

    try {
        const headers = {};
        if (window.authToken) headers['Authorization'] = `Bearer ${window.authToken}`;

        const response = await fetch(`/livros/${id}`, { method: 'DELETE', headers });
        if (!response.ok) throw new Error('Erro ao excluir livro');

        mostrarFeedback('Livro excluído com sucesso!');
        buscarLivros();
    } catch (error) {
        mostrarFeedback(error.message, 'error');
    }
};

async function buscarLivros() {
    const parametros = new URLSearchParams();

    const busca = inputBusca.value.trim();
    const autor = inputAutorBusca.value.trim();
    const status = selectStatus.value;
    const genero = selectGenero.value;

    if (busca) parametros.append('busca', busca);
    if (autor) parametros.append('autor', autor);
    if (status !== 'Todos') parametros.append('status', status);
    if (genero !== 'Todos') parametros.append('genero', genero);

    const queryString = parametros.toString();
    const url = `/livros${queryString ? '?' + queryString : ''}`;

    divLoading.classList.remove('hidden');
    divError.classList.add('hidden');
    tbody.innerHTML = '';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Servidor retornou erro');

        const data = await response.json();
        spanTotal.textContent = data.total;

        if (data.total === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum livro encontrado.</td></tr>';
            return;
        }

        data.livros.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${l.id}</td>
                <td><strong>${l.titulo}</strong></td>
                <td>${l.autor}</td>
                <td style="text-transform: capitalize;">${l.genero}</td>
                <td><span class="badge ${l.status}">${l.status}</span></td>
                <td><small>${l.sinopse || ''}</small></td>
                <td class="td-acoes">
                    <button onclick="editarLivro(${l.id})" class="btn-editar">Editar</button>
                    <button onclick="excluirLivro(${l.id})" class="btn-excluir">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro na requisição:', error);
        divError.classList.remove('hidden');
        spanTotal.textContent = '0';
    } finally {
        divLoading.classList.add('hidden');
    }
}

buscarLivros();

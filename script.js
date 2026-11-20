let todasNoticias = [];

function classificarNoticia(titulo) {
    const t = titulo.toLowerCase();
    if (t.includes('renova') || t.includes('estende') || t.includes('amplia contrato')) {
        return { tipo: 'renovacao', label: '✍️ Renovação' };
    }
    if (t.includes('saída') || t.includes('sai') || t.includes('empresta') || t.includes('empréstimo') || t.includes('rescinde') || t.includes('vende') || t.includes('deixa o bahia')) {
        return { tipo: 'saida', label: '📤 Saída / Empréstimo' };
    }
    return { tipo: 'chegada', label: '📥 Chegada / Rumor' };
}

function formatarItemNoticia(tituloOriginal, link, pubDate) {
    const cat = classificarNoticia(tituloOriginal);
    const dataObj = new Date(pubDate);
    const dataFormatada = isNaN(dataObj) ? 'Recente' : dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const partesTitulo = tituloOriginal.split(' - ');
    const fonte = partesTitulo.length > 1 ? partesTitulo.pop() : 'Portal Esportivo';
    const tituloLimpo = partesTitulo.join(' - ');

    return {
        titulo: tituloLimpo,
        link: link,
        data: dataFormatada,
        fonte: fonte,
        tipo: cat.tipo,
        label: cat.label
    };
}

async function carregarNoticias() {
    const statusEl = document.getElementById('status');

    try {
        const resposta = await fetch('/noticias');
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const listaBruta = await resposta.json();

        if (Array.isArray(listaBruta) && listaBruta.length > 0) {
            todasNoticias = listaBruta.map(item => {
                const cat = classificarNoticia(item.titulo);
                return {
                    titulo: item.titulo,
                    link: item.link,
                    data: item.data,
                    fonte: item.fonte,
                    tipo: cat.tipo,
                    label: cat.label
                };
            });

            statusEl.style.display = 'none';
            renderizarNoticias(todasNoticias);
        } else {
            statusEl.innerText = '⚠️ Nenhuma notícia encontrada na página do GE no momento.';
        }
    } catch (erro) {
        statusEl.innerText = `⚠️ Não foi possível carregar as notícias (${erro.message}).`;
    }
}


function renderizarNoticias(lista) {
    const grid = document.getElementById('grid-noticias');
    grid.innerHTML = '';

    if (lista.length === 0) {
        grid.innerHTML = '<p style="color: #adb5bd;">Nenhuma notícia encontrada nesta categoria.</p>';
        return;
    }

    lista.forEach(n => {
        const card = document.createElement('div');
        card.className = `card ${n.tipo}`;
        card.innerHTML = `
            <div>
                <span class="badge">${n.label}</span>
                <h3>${n.titulo}</h3>
            </div>
            <div class="card-footer">
                <span>📰 ${n.fonte} • ${n.data}</span>
                <a href="${n.link}" target="_blank" rel="noopener noreferrer">Ler matéria ↗</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filtrar(categoria, botao) {
    document.querySelectorAll('.filtros button').forEach(b => b.classList.remove('ativo'));
    botao.classList.add('ativo');

    if (categoria === 'todas') {
        renderizarNoticias(todasNoticias);
    } else {
        renderizarNoticias(todasNoticias.filter(n => n.tipo === categoria));
    }
}

function carregarComentarios() {
    const salvos = JSON.parse(localStorage.getItem('radar_bahia_comentarios')) || [
        { nome: 'Bora Bahêa', texto: 'Bora Esquadrão! Acompanhando todas as movimentações da janela.', data: 'Hoje' }
    ];
    const lista = document.getElementById('lista-comentarios');
    lista.innerHTML = '';

    salvos.forEach(c => {
        const item = document.createElement('div');
        item.className = 'comentario-item';
        item.innerHTML = `
            <div class="comentario-topo">
                <strong>${c.nome}</strong>
                <span>${c.data}</span>
            </div>
            <p>${c.texto}</p>
        `;
        lista.appendChild(item);
    });
}

function adicionarComentario() {
    const nomeInput = document.getElementById('nome-usuario');
    const textoInput = document.getElementById('texto-comentario');
    const nome = nomeInput.value.trim() || 'Torcedor Tricolor';
    const texto = textoInput.value.trim();

    if (!texto) return alert('Escreva um comentário antes de publicar!');

    const salvos = JSON.parse(localStorage.getItem('radar_bahia_comentarios')) || [];
    const agora = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

    salvos.unshift({ nome, texto, data: agora });
    localStorage.setItem('radar_bahia_comentarios', JSON.stringify(salvos));

    nomeInput.value = '';
    textoInput.value = '';
    carregarComentarios();
}

carregarNoticias();
carregarComentarios();

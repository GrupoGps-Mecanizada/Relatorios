// Monta a lista: filtros por setor e tema, busca e grupos por mês.
window.Lista = (() => {
    const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const estado = { todos: [], setor: '', tema: '', busca: '' };
    let aoAbrir = () => {};

    function semAcento(texto) {
        return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    function valoresUnicos(campo) {
        return [...new Set(estado.todos.map((r) => r[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }

    function filtrar() {
        const termo = semAcento(estado.busca.trim());
        return estado.todos.filter((r) =>
            (!estado.setor || r.setor === estado.setor)
            && (!estado.tema || r.tema === estado.tema)
            && (!termo || semAcento([r.titulo, r.tema, r.setor, r.resumo, r.para_quem].join(' ')).includes(termo)));
    }

    function criarChip(texto, ativo, aoClicar) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'rel-chip';
        chip.textContent = texto;
        chip.setAttribute('aria-pressed', String(ativo));
        chip.addEventListener('click', aoClicar);
        return chip;
    }

    function montarFiltro(caixa, rotulo, campo) {
        caixa.replaceChildren();
        const valores = valoresUnicos(campo);
        if (valores.length < 2) return;
        const nome = document.createElement('span');
        nome.className = 'rel-rotulo';
        nome.textContent = rotulo;
        caixa.append(nome, criarChip('Todos', !estado[campo], () => escolher(campo, '')));
        valores.forEach((v) => caixa.append(criarChip(v, estado[campo] === v, () => escolher(campo, v))));
    }

    function escolher(campo, valor) {
        estado[campo] = estado[campo] === valor ? '' : valor;
        desenhar();
    }

    function criarItem(r) {
        const [ano, mes, dia] = r.data.split('-');
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'rel-item';
        item.innerHTML = '<span class="rel-dia"></span><span><span class="rel-titulo"></span><span class="rel-detalhe"></span></span><span class="rel-seta" aria-hidden="true">→</span>';
        item.querySelector('.rel-dia').textContent = `${dia}/${mes}/${ano}`;
        item.querySelector('.rel-titulo').textContent = r.titulo;
        item.querySelector('.rel-detalhe').textContent = [r.setor, r.tema, r.para_quem].filter(Boolean).join(' · ');
        item.addEventListener('click', () => aoAbrir(r));
        return item;
    }

    function desenhar() {
        montarFiltro(document.getElementById('filtro-setor'), 'Setor', 'setor');
        montarFiltro(document.getElementById('filtro-tema'), 'Tema', 'tema');

        const lista = document.getElementById('lista');
        const achados = filtrar();
        document.getElementById('contagem').textContent =
            achados.length === 1 ? '1 relatório' : `${achados.length} relatórios`;
        lista.replaceChildren();
        lista.setAttribute('aria-busy', 'false');

        if (!achados.length) {
            const vazio = document.createElement('p');
            vazio.className = 'rel-vazio';
            vazio.textContent = estado.todos.length ? 'Nenhum relatório com esses filtros.' : 'Ainda não há relatórios publicados.';
            lista.append(vazio);
            return;
        }

        let mesAtual = '';
        achados.forEach((r) => {
            const [ano, mes] = r.data.split('-');
            const chave = `${ano}-${mes}`;
            if (chave !== mesAtual) {
                mesAtual = chave;
                const titulo = document.createElement('h2');
                titulo.className = 'rel-mes';
                titulo.textContent = `${MESES[Number(mes) - 1]} de ${ano}`;
                lista.append(titulo);
            }
            lista.append(criarItem(r));
        });
    }

    function iniciar(relatorios, abrir) {
        estado.todos = relatorios;
        aoAbrir = abrir;
        document.getElementById('busca').addEventListener('input', (e) => {
            estado.busca = e.target.value;
            desenhar();
        });
        desenhar();
    }

    return { iniciar, _filtrar: filtrar, _estado: estado };
})();

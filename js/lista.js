// Tela da lista: abas em cascata (setor → tema), números em linha, filtros em pílula, tabela e detalhe ao lado.
window.Lista = (() => {
    const SETORES = ['Segurança', 'Manutenção', 'Operação', 'Gestão'];
    const DIMENSOES = [
        { campo: 'ano', titulo: 'Ano', valor: (r) => r.data.slice(0, 4) },
        { campo: 'para_quem', titulo: 'Para quem', valor: (r) => r.para_quem || '' },
    ];
    const estado = { todos: [], setor: '', tema: '', periodo: 'tudo', ano: '', para_quem: '', busca: '', aberto: null };
    let aoAbrir = () => {};
    const $ = (id) => document.getElementById(id);

    function semAcento(texto) {
        return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    function dataBR(iso) {
        const [ano, mes, dia] = iso.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function inicioDoPeriodo(periodo, hoje = new Date()) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        if (periodo === 'mes') return d;
        if (periodo === '3m') return new Date(d.getFullYear(), d.getMonth() - 2, 1);
        if (periodo === 'ano') return new Date(hoje.getFullYear(), 0, 1);
        return null;
    }

    // Cada filtro pode ser ignorado, para contar as opções "com os outros filtros" (como na Gestão de alertas).
    function passa(r, ignorar = []) {
        const inicio = inicioDoPeriodo(estado.periodo);
        const termo = semAcento(estado.busca.trim());
        return (ignorar.includes('setor') || !estado.setor || r.setor === estado.setor)
            && (ignorar.includes('tema') || !estado.tema || r.tema === estado.tema)
            && (!inicio || new Date(r.data + 'T12:00') >= inicio)
            && DIMENSOES.every((d) => ignorar.includes(d.campo) || !estado[d.campo] || d.valor(r) === estado[d.campo])
            && (!termo || semAcento([r.titulo, r.tema, r.setor, r.resumo, r.para_quem].join(' ')).includes(termo));
    }

    function contar(lista, valorDe) {
        const contas = new Map();
        lista.forEach((r) => { const v = valorDe(r); if (v) contas.set(v, (contas.get(v) || 0) + 1); });
        return contas;
    }

    function criarAba(rotulo, n, ativa, aoClicar) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'rel-aba';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(ativa));
        b.textContent = rotulo;
        const contagem = document.createElement('span');
        contagem.className = 'n';
        contagem.textContent = n;
        b.append(contagem);
        b.addEventListener('click', aoClicar);
        return b;
    }

    function desenharAbas() {
        const base = estado.todos.filter((r) => passa(r, ['setor', 'tema']));
        const porSetor = contar(base, (r) => r.setor);
        const extras = [...porSetor.keys()].filter((s) => !SETORES.includes(s));
        $('abas-setor').replaceChildren(
            criarAba('Todos', base.length, !estado.setor, () => mudar({ setor: '', tema: '' })),
            ...[...SETORES, ...extras].map((s) => criarAba(s, porSetor.get(s) || 0, estado.setor === s, () => mudar({ setor: s, tema: '' }))));

        // Cascata: os temas só do setor escolhido.
        const doSetor = estado.todos.filter((r) => passa(r, ['tema']));
        const porTema = contar(doSetor, (r) => r.tema);
        const temas = [...porTema.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        $('abas-tema').replaceChildren(...(temas.length ? [
            criarAba('Todos os temas', doSetor.length, !estado.tema, () => mudar({ tema: '' })),
            ...temas.map((t) => criarAba(t, porTema.get(t), estado.tema === t, () => mudar({ tema: t }))),
        ] : []));
    }

    function desenharNumeros(achados) {
        const agora = new Date();
        const mes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
        const doMes = achados.filter((r) => r.data.startsWith(mes)).length;
        const itens = [
            [achados.length, achados.length === 1 ? 'relatório' : 'relatórios'],
            [doMes, 'neste mês'],
            [new Set(achados.map((r) => r.tema)).size, 'temas'],
        ];
        if (achados[0]) itens.push([dataBR(achados[0].data), 'o mais recente']);
        $('numeros').replaceChildren(...itens.flatMap(([n, t], i) => {
            const b = document.createElement('b');
            b.textContent = n;
            const partes = [b, document.createTextNode(` ${t}`)];
            if (i) {
                const p = document.createElement('span');
                p.className = 'ponto';
                p.textContent = '·';
                partes.unshift(p);
            }
            return partes;
        }));
    }

    function desenharPilulas() {
        const ativos = DIMENSOES.filter((d) => estado[d.campo]);
        if (estado.busca.trim()) ativos.push({ campo: 'busca', titulo: 'Busca' });
        $('pilulas').replaceChildren(...ativos.map((d) => {
            const p = document.createElement('span');
            p.className = 'rel-pilula rel-ativa';
            p.innerHTML = '<span class="rel-suave"></span><span></span><button type="button" class="rel-tirar">×</button>';
            p.children[0].textContent = d.titulo;
            p.children[1].textContent = estado[d.campo];
            p.children[2].setAttribute('aria-label', `Tirar filtro: ${estado[d.campo]}`);
            p.children[2].addEventListener('click', () => {
                if (d.campo === 'busca') $('busca').value = '';
                mudar({ [d.campo]: '' });
            });
            return p;
        }));
    }

    function desenharMenu() {
        const menu = $('mais-filtro-menu');
        menu.replaceChildren();
        DIMENSOES.forEach((d) => {
            const opcoes = contar(estado.todos.filter((r) => passa(r, [d.campo])), d.valor);
            if (!opcoes.size) return;
            const grupo = document.createElement('div');
            grupo.className = 'rel-menu-grupo';
            const titulo = document.createElement('p');
            titulo.className = 'rel-menu-titulo';
            titulo.textContent = d.titulo;
            grupo.append(titulo);
            [...opcoes.keys()].sort((a, b) => b.localeCompare(a, 'pt-BR')).forEach((v) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'rel-menu-item';
                item.setAttribute('role', 'menuitemradio');
                item.setAttribute('aria-checked', String(estado[d.campo] === v));
                item.innerHTML = '<span></span><span class="n"></span>';
                item.children[0].textContent = v;
                item.children[1].textContent = opcoes.get(v);
                item.addEventListener('click', () => { abrirMenu(false); mudar({ [d.campo]: estado[d.campo] === v ? '' : v }); });
                grupo.append(item);
            });
            menu.append(grupo);
        });
        if (!menu.children.length) menu.innerHTML = '<p class="rel-menu-titulo">Nada com os filtros atuais</p>';
    }

    function abrirMenu(abrir) {
        $('mais-filtro-menu').hidden = !abrir;
        $('mais-filtro-botao').setAttribute('aria-expanded', String(abrir));
        if (abrir) desenharMenu();
    }

    function criarLinha(r) {
        const tr = document.createElement('tr');
        if (estado.aberto === r.arquivo) tr.className = 'ativo';
        tr.innerHTML = '<td class="col-data"></td><td><button type="button" class="rel-titulo"></button><span class="rel-resumo"></span></td>'
            + '<td class="col-tema"></td><td class="col-setor"></td><td class="col-para rel-suave"></td>';
        const c = tr.children;
        c[0].textContent = dataBR(r.data);
        c[1].children[0].textContent = r.titulo;
        c[1].children[1].textContent = r.resumo || '';
        c[2].textContent = r.tema;
        c[3].textContent = r.setor;
        c[4].textContent = r.para_quem || '—';
        tr.addEventListener('click', () => mudar({ aberto: r.arquivo }));
        return tr;
    }

    function desenharDetalhe() {
        const r = estado.todos.find((x) => x.arquivo === estado.aberto);
        const caixa = $('detalhe');
        $('corpo').classList.toggle('aberto', Boolean(r));
        caixa.hidden = !r;
        if (!r) return;
        caixa.innerHTML = '<div class="rel-detalhe-topo"><h2></h2><button type="button" class="rel-fechar" aria-label="Fechar detalhe">×</button></div>'
            + '<p></p><dl class="rel-dados"></dl><div class="rel-acoes">'
            + '<button type="button" class="rel-btn rel-btn-primario">Abrir relatório</button></div>';
        caixa.querySelector('h2').textContent = r.titulo;
        const resumo = caixa.querySelector('p');
        resumo.textContent = r.resumo || '';
        resumo.hidden = !r.resumo;
        const dados = [['Data', dataBR(r.data)], ['Setor', r.setor], ['Tema', r.tema], ['Para quem', r.para_quem || '—']];
        if (r.tamanho) dados.push(['Tamanho', `${(r.tamanho / 1024 / 1024).toFixed(1).replace('.', ',')} MB`]);
        caixa.querySelector('dl').append(...dados.flatMap(([t, v]) => {
            const dt = document.createElement('dt'); dt.textContent = t;
            const dd = document.createElement('dd'); dd.textContent = v;
            return [dt, dd];
        }));
        caixa.querySelector('.rel-fechar').addEventListener('click', () => mudar({ aberto: null }));
        caixa.querySelector('.rel-btn-primario').addEventListener('click', () => aoAbrir(r));
    }

    function desenhar() {
        const achados = estado.todos.filter((r) => passa(r));
        if (estado.aberto && !achados.some((r) => r.arquivo === estado.aberto)) estado.aberto = null;
        desenharAbas();
        desenharNumeros(achados);
        desenharPilulas();
        $('linhas').replaceChildren(...achados.map(criarLinha));
        const vazio = $('vazio');
        vazio.hidden = achados.length > 0;
        vazio.textContent = estado.todos.length ? 'Nenhum relatório com esses filtros.' : 'Ainda não há relatórios publicados.';
        desenharDetalhe();
    }

    function mudar(parte) {
        Object.assign(estado, parte);
        desenhar();
    }

    function iniciar(relatorios, abrir) {
        estado.todos = relatorios;
        aoAbrir = abrir;
        $('busca').addEventListener('input', (e) => mudar({ busca: e.target.value }));
        $('periodo').addEventListener('change', (e) => mudar({ periodo: e.target.value }));
        $('mais-filtro-botao').addEventListener('click', () => abrirMenu($('mais-filtro-menu').hidden));
        document.addEventListener('mousedown', (e) => { if (!$('mais-filtro').contains(e.target)) abrirMenu(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirMenu(false); });
        desenhar();
    }

    return { iniciar, _estado: estado, _passa: passa };
})();

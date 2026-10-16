// Abre o relatório por cima da lista. O quadro é isolado (sandbox): o relatório não mexe no login.
window.Visor = (() => {
    let enderecoAtual = '';

    function nomeDoArquivo(r) {
        return `${r.data} ${r.titulo}.html`.replace(/[\\/:*?"<>|]/g, '-');
    }

    function fechar() {
        document.getElementById('visor').hidden = true;
        document.getElementById('visor-quadro').src = 'about:blank';
        if (enderecoAtual) URL.revokeObjectURL(enderecoAtual);
        enderecoAtual = '';
        document.body.style.overflow = '';
    }

    async function abrir(r) {
        const visor = document.getElementById('visor');
        const baixar = document.getElementById('visor-baixar');
        document.getElementById('visor-titulo').textContent = r.titulo;
        baixar.setAttribute('aria-disabled', 'true');
        visor.hidden = false;
        document.body.style.overflow = 'hidden';
        // seguro() mostra o carregando e o erro em linguagem simples; devolve null se falhar.
        enderecoAtual = await SGE.seguro(() => Dados.abrirArquivo(r.arquivo),
            { contexto: 'abrir o relatório', texto: 'Abrindo relatório…' }) || '';
        if (!enderecoAtual || visor.hidden) return fechar();
        document.getElementById('visor-quadro').src = enderecoAtual;
        baixar.href = enderecoAtual;
        baixar.download = nomeDoArquivo(r);
        baixar.removeAttribute('aria-disabled');
    }

    function iniciar() {
        document.getElementById('visor-fechar').addEventListener('click', fechar);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('visor').hidden) fechar();
        });
    }

    return { iniciar, abrir };
})();

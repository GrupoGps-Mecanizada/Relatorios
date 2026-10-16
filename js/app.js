// Início: confere o login pela Central e só então carrega a lista.
(async () => {
    const SLUG = 'relatorios';
    await SGE.acesso.entrar(SLUG);
    Visor.iniciar();
    const relatorios = await SGE.seguro(() => Dados.listarRelatorios(),
        { contexto: 'carregar os relatórios', texto: 'Carregando relatórios…' });
    if (relatorios === null) {
        document.getElementById('lista').innerHTML =
            '<p class="rel-vazio">Não consegui carregar os relatórios. Confira a internet e recarregue a página.</p>';
        return;
    }
    Lista.iniciar(relatorios, Visor.abrir);
})();

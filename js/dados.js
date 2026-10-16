// Conversa com o banco: lista de relatórios e o arquivo de cada um.
// Quem pode ver é decidido pelo banco (RLS), não por esta página.
window.Dados = (() => {
    const BALDE = 'relatorios';
    const COLUNAS = 'id, data, titulo, tema, setor, para_quem, resumo, arquivo';

    async function listarRelatorios() {
        const { data, error } = await SGE.cliente()
            .from('relatorios')
            .select(COLUNAS)
            .order('data', { ascending: false })
            .order('titulo');
        if (error) throw error;
        return data || [];
    }

    // Baixa o arquivo e devolve um endereço local (o Storage não mostra HTML direto).
    async function abrirArquivo(caminho) {
        const { data, error } = await SGE.cliente().storage.from(BALDE).download(caminho);
        if (error) throw error;
        const html = new Blob([await data.arrayBuffer()], { type: 'text/html;charset=utf-8' });
        return URL.createObjectURL(html);
    }

    return { listarRelatorios, abrirArquivo };
})();

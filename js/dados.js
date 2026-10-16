// Conversa com o portal: lista de relatórios e o arquivo de cada um (guardados no Cloudflare R2).
// Quem pode ver é decidido pelo portal, que confere o login na Central (não esta página).
window.Dados = (() => {
    // Dentro do portal o endereço é o mesmo; aberto direto no github.io, fala com o portal.
    const API = (location.hostname === 'sge-portal.pages.dev' ? '' : 'https://sge-portal.pages.dev') + '/api/relatorios';

    async function pedir(caminho) {
        const { data } = await SGE.cliente().auth.getSession();
        const token = data && data.session && data.session.access_token;
        const r = await fetch(`${API}/${caminho}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
        if (r.status === 401) throw new Error('Sem acesso aos relatórios. Entre de novo no SGE.');
        if (!r.ok) throw new Error(`Não consegui falar com o portal (erro ${r.status}).`);
        return r;
    }

    async function listarRelatorios() {
        const lista = await (await pedir('lista')).json();
        return lista.sort((a, b) => b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo, 'pt-BR'));
    }

    // Baixa o arquivo e devolve um endereço local para o quadro isolado.
    async function abrirArquivo(caminho) {
        const html = await (await pedir(`arquivo/${caminho}`)).blob();
        return URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    }

    return { listarRelatorios, abrirArquivo };
})();

# Relatórios

Lugar único dos relatórios do departamento de Apresentações do SGE, organizados por data, tema e setor.

- **Quem vê:** qualquer pessoa com login do SGE (acesso de leitura dado pela Central).
- **Quem envia:** ninguém pela tela. Só a ferramenta `D:\SEGUNDO CEREBRO - IDE\8 - Ferramentas\publicar_relatorio.py`, depois do OK do Warlison.
- **Onde abre:** dentro do portal, em `https://sge-portal.pages.dev/Relatorios/` (o roteador do portal repassa para o GitHub Pages deste repositório).

## Como funciona
1. Os relatórios (`.html` de arquivo único) e a lista (`indice.json`) ficam no **Cloudflare R2**, balde privado `sge-relatorios`. O Supabase **não** guarda relatório: é só para gestão e controle (login e acesso).
2. A tela pede a lista e os arquivos ao portal (`/api/relatorios/...`), que confere na Central se a pessoa tem acesso ao sistema `relatorios` (Portal v1.4.0).
3. Ao clicar, a página baixa o arquivo e mostra num quadro isolado (sandbox), com botão de baixar.

## Arquivos
| Arquivo | Para quê |
|---|---|
| `index.html` | a tela |
| `css/relatorios.css` | visual (cores e fonte do `sge-core`) |
| `js/dados.js` | conversa com o portal (lista e arquivos) |
| `js/lista.js` | filtros, busca e grupos por mês |
| `js/visor.js` | abre e baixa o relatório |
| `js/app.js` | início: login e carga |
| `sql/` | mudanças do banco, com data |

## Publicar o sistema (grátis)
Repositório `Relatorios` na organização GrupoGps-Mecanizada → Settings → Pages → branch `main`.

## Publicar um relatório
```
python "D:/SEGUNDO CEREBRO - IDE/8 - Ferramentas/publicar_relatorio.py" "<arquivo.html>" --tema "Equipamentos" --setor Manutenção --para-quem "Gestão interna"
```

# Relatórios

Lugar único dos relatórios do departamento de Apresentações do SGE, organizados por data, tema e setor.

- **Quem vê:** qualquer pessoa com login do SGE (acesso de leitura dado pela Central).
- **Quem envia:** ninguém pela tela. Só a ferramenta `D:\SEGUNDO CEREBRO - IDE\8 - Ferramentas\publicar_relatorio.py`, depois do OK do Warlison.
- **Onde abre:** dentro do portal, em `https://sge-portal.pages.dev/Relatorios/` (o roteador do portal repassa para o GitHub Pages deste repositório).

## Como funciona
1. A lista vem da tabela `public.relatorios` (RLS: só lê quem tem acesso ao sistema `relatorios`).
2. Cada relatório é um `.html` de arquivo único, guardado no balde privado `relatorios` do Supabase.
3. Ao clicar, a página baixa o arquivo e mostra num quadro isolado (sandbox), com botão de baixar.

## Arquivos
| Arquivo | Para quê |
|---|---|
| `index.html` | a tela |
| `css/relatorios.css` | visual (cores e fonte do `sge-core`) |
| `js/dados.js` | conversa com o banco |
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

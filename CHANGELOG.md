# Histórico de versões

## v0.1.0 — 2026-10-16
- Primeira versão: lista de relatórios por mês, filtros por setor e tema, busca sem acento, visor isolado com botão de baixar.
- Login pela Central (`SGE.acesso.entrar('relatorios')`).
- Banco: tabela `public.relatorios` com RLS (só leitura pelo site), balde privado `relatorios`, cadastro na Central e acesso de leitura para todos (`sql/2026-10-16_001_relatorios.sql`).

## v0.1.1 — 2026-10-16
- Endereço no portal corrigido para `/Relatorios/` (o GitHub Pages diferencia maiúscula) — `sql/2026-10-16_002_endereco_maiusculo.sql`.

## v0.2.0 — 2026-10-16
- Relatórios saem do Supabase (decisão do Warlison: Supabase só para gestão e controle) e passam a ficar no Cloudflare R2, balde `sge-relatorios`.
- A tela busca a lista e os arquivos no portal (`/api/relatorios/...`, Portal v1.4.0), que confere o login na Central a cada pedido.
- `sql/2026-10-16_003_tirar_arquivos_do_supabase.sql` apaga a tabela e a pasta vazias do Supabase.

# Histórico de versões

## v0.1.0 — 2026-10-16
- Primeira versão: lista de relatórios por mês, filtros por setor e tema, busca sem acento, visor isolado com botão de baixar.
- Login pela Central (`SGE.acesso.entrar('relatorios')`).
- Banco: tabela `public.relatorios` com RLS (só leitura pelo site), balde privado `relatorios`, cadastro na Central e acesso de leitura para todos (`sql/2026-10-16_001_relatorios.sql`).

-- Relatórios v0.1.0 · lugar único dos relatórios do departamento de Apresentações.
-- Rodar no SQL Editor do projeto mgcjidryrjqiceielmzp (o mesmo da Central de Login).
-- Pode rodar de novo sem duplicar nada.
--
-- Regras:
--  * Ver: qualquer pessoa com acesso ao sistema 'relatorios' na Central (todos recebem LEITURA abaixo).
--  * Enviar, mudar ou apagar: ninguém pelo navegador. Só a ferramenta publicar_relatorio.py,
--    depois do OK do Warlison (ela usa a chave secreta, que nunca vai para o site).

begin;

-- 1. Lista de relatórios (fica na área public: a única aberta para o site, ver Lições 2026-10-15).
create table if not exists public.relatorios (
  id          uuid primary key default gen_random_uuid(),
  data        date not null,
  titulo      text not null check (length(titulo) between 3 and 200),
  tema        text not null check (length(tema) between 2 and 80),
  setor       text not null check (setor in ('Segurança', 'Manutenção', 'Operação', 'Gestão')),
  para_quem   text,
  resumo      text check (length(resumo) <= 500),
  arquivo     text not null unique,            -- caminho no balde 'relatorios'
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists relatorios_data_idx on public.relatorios (data desc);
create index if not exists relatorios_setor_idx on public.relatorios (setor);

alter table public.relatorios enable row level security;

drop policy if exists relatorios_ver on public.relatorios;
create policy relatorios_ver on public.relatorios
  for select to authenticated
  using (acesso_priv.papel('relatorios') is not null);
-- Sem política de insert/update/delete: o navegador não consegue gravar nada.

revoke insert, update, delete on public.relatorios from anon, authenticated;
grant select on public.relatorios to authenticated;

-- 2. Balde privado para os arquivos (até 50 MB cada, só HTML).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('relatorios', 'relatorios', false, 52428800, array['text/html'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists relatorios_arquivos_ver on storage.objects;
create policy relatorios_arquivos_ver on storage.objects
  for select to authenticated
  using (bucket_id = 'relatorios' and acesso_priv.papel('relatorios') is not null);

-- 3. Sistema na Central: abre dentro do portal em /relatorios/
--    (o roteador manda para grupogps-mecanizada.github.io/relatorios/, sem mudar o portal).
insert into gps_compartilhado.sge_central_sistemas
  (slug, nome, descricao, url_origem, icone, cor, area_menu, ordem, abre_fora, mostrar_portal, is_active)
values
  ('relatorios', 'Relatórios', 'Relatórios do departamento de Apresentações', '/relatorios/', 'file-text', '#1d4ed8', 'Administração', 2, false, true, true)
on conflict (slug) do update set
  nome = excluded.nome, descricao = excluded.descricao, url_origem = excluded.url_origem,
  icone = excluded.icone, abre_fora = false, mostrar_portal = true, is_active = true;

-- 4. Todo mundo que já tem login ganha acesso de leitura.
insert into gps_compartilhado.acesso_permissoes (usuario_id, sistema_id, papel, ativo)
select u.id, s.id, 'LEITURA'::gps_compartilhado.acesso_papel, true
from gps_compartilhado.sge_central_usuarios u
cross join (select id from gps_compartilhado.sge_central_sistemas where slug = 'relatorios') s
where u.is_active is not false
on conflict (usuario_id, sistema_id) do nothing;

-- 5. Conferência: 1 sistema, a tabela com RLS ligado e quantas pessoas ganharam acesso.
select s.slug, s.url_origem, s.mostrar_portal,
       (select relrowsecurity from pg_class where oid = 'public.relatorios'::regclass) as rls_ligado,
       count(ap.*) as pessoas_com_acesso
from gps_compartilhado.sge_central_sistemas s
left join gps_compartilhado.acesso_permissoes ap on ap.sistema_id = s.id and ap.ativo
where s.slug = 'relatorios'
group by 1, 2, 3;

commit;

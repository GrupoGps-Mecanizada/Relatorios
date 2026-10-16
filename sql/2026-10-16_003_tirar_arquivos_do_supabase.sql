-- Relatórios v0.2.0 · decisão do Warlison (2026-10-16): o Supabase é só para gestão e controle.
-- Os relatórios passam a ficar no Cloudflare R2 (balde sge-relatorios). Aqui sai o que foi criado
-- para arquivos no 001 (estava vazio). Fica só o cadastro do sistema e o acesso na Central.
-- Rodar no SQL Editor do projeto mgcjidryrjqiceielmzp. Pode rodar de novo.
begin;

drop policy if exists relatorios_arquivos_ver on storage.objects;
drop table if exists public.relatorios;

commit;

-- Conferência: deve mostrar "tabela_existe = false" e o sistema com /Relatorios/.
select to_regclass('public.relatorios') is not null as tabela_existe,
       (select url_origem from gps_compartilhado.sge_central_sistemas where slug = 'relatorios') as endereco;

-- Por último: a pasta vazia "relatorios" do Storage. Se esta linha der erro, apague pela tela:
-- Storage → relatorios → Delete bucket.
delete from storage.buckets where id = 'relatorios';

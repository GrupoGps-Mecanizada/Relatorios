-- Relatórios v0.1.1 · o repositório no GitHub se chama "Relatorios" (R maiúsculo)
-- e o GitHub Pages diferencia maiúscula: o portal abre em /Relatorios/.
-- Rodar no SQL Editor do projeto mgcjidryrjqiceielmzp. Pode rodar de novo.
update gps_compartilhado.sge_central_sistemas
set url_origem = '/Relatorios/'
where slug = 'relatorios';

-- Conferência: deve mostrar /Relatorios/ e quantas pessoas têm acesso.
select s.slug, s.url_origem, count(ap.*) filter (where ap.ativo) as pessoas_com_acesso
from gps_compartilhado.sge_central_sistemas s
left join gps_compartilhado.acesso_permissoes ap on ap.sistema_id = s.id
where s.slug = 'relatorios'
group by 1, 2;

Boas, aqui tenho q compilar o estado do projecto as alterações e o Fumo.(11/05/2025)
Nesse momento o projecto no q tange ao Front-End tem dentro da pasta app, tem 3 pastas principais :

1-Cadastro dentro dessa pasta contem a tela de cadastro tanto do arquiteto como do Cliente--Essa pasta vai ter q ser alterada porque as informações do cadastro estão desatualizadas e faltam dados para o usuario poder criar uma conta se ele for um arquiteto faltam as 3 etapas e uma tela com um design em condições.

2-Dashboard--Essa é pasta q contem a maior parte da telas q são usadas no projecto, vou aqui descrever quais são:
2.1-Componentes- Dentro dessa pasta contém 3 arquivos que são componentes q estão a ser usados por outras telas eles são:
2.1.1-Arquitectural-plans-Basicamente é o card da planta q aparece na home do usuario, tudo q estiver relacionado a planta na tela do usuario
2.1.2-Estrutura padrão das telas aonde se encontra a sidebar, todas as outras telas são renderizadas por cima desta.
2.1.3-Plan-upload-dialog--O componente q permite inserir informações para poder adicionar uma planta.


2.2-Compras-É a tela q contém o carrinho de compras, q nesse momento está muito complexo e tem q ser modificado porque não está a cumprir o papel dele para apenas agrupar as plantas e fazer o somatorio do valor q é um botão q será redirecionado para a tela de compra do Délcio. E consequentemente quando essa compra for realizada a planta deve ser transportada para o Historico de compras.
2.3-History-Está relacionado ao Historico de Compras, tudo q foi comprado pelo usuario dps de processado deve ser redirecionado aqui, para ele poder baixar a planta, tem uma aba de pesquisa q deve Funcionar e tem tambem um filtro por ano, ambos nesse momento estão OFF.
2.4-perfil--Aqui temos a tela com as informações básicas do Usuario aqui ele deve conseguir vizualizar as informações q ele inseriu no cadastro e atualizar elas.
2.5-Plantas-Basicamente essa tela é aonde o usuario(arquiteto) deve inserir as plantas no sistema, e poder fazer o crud do nosso sistema, Criar a planta, editar a planta e Deletar a planta

3-Tem tmb a pasta Login q aos meus olhos é a pasta mais simples e a unica alterção q deve ter nela é o Design q não está nada moderno e está datado o bagulho tá feio para caramba


Tasks Pendentes
 A idea é fazer a melhoria das telas consoate ao fluxo dos dados e do usuario porque oq está a contecer é um retrabalho desnecessario de coisas q foram feitas foi dexado inclompleto e nunca mais ninguem voltou lá, as uunicas alterações q não são necessariamente urgente são aquelas q demandam apenas o ramo de UI,UX que podem ser alterados a qualquer momento.
E pq q é interessante analisarmos pela optica do arquiteto pq a plataforma é majoritariamente para eles, sem os arquitetos a platafomra não bumba.


 FLUXO DE DADOS PARA ARQUITETO

 Tela Home-->Cadastro do Usuario-->Tela Login--> Dashboard-->Poder fazer o Crud da planta (Adicionar,editar,deletar)-->Vizualizar as plantas vendidas e quanto já lucrou(Dashboard financeira(Poder sacar o dinheiro))-->Increver-se em Eventos propostas de projectos(Poder vizualizar os datalhes dos eventos e conversar com a pessoa sobre o projecto(implementação do chat em tempo real))-->Editar as informações do perfil-->Comprar Planta...

 FLUXO DE DADOS PARA CLIENTES

 Tela Home-->Cadastro do Usuario-->Tela Login--> Dashboard-->Vizualizar planta em ponto grande(Dentro da vizualização oq deve constar??(As imagens de exibição,Os detalhes Técnicos,Comentarios/Avaliações, adicionar ao carrinho de compras))-->Comprar a Planta(Integração com Stripe//Gateway nacional)-->Fazer Download da planta Comprada-->Criar Evento/Proposta(Oq deve constar??(Crud do evento--Criar evento(nome, data do evento,Incrição, datalhes Técnicos(pergunta como vai funcionar a entrega do projecto e o pagamento ?) ),Editar Evento,Apagar evento.)),Editaro perfil.

 FLUXO DE DADOS PARA ADMINISTRADOR
 Tela Login-->Tabela mostrando acesso a todos usuarios da Plataforma(Poder banir qualquer um desses usuarios)--> Tabela de autorização dos saques-->Tabela para listar as denuncias no sistema.

 Alterções da ia
 tela de cadastro [v]
 tela de login [v]
 context
 Tela do my plantas
 Componente das plantas arquitetonicas
Tela admin

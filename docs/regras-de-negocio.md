# Regras de negócio — HelpDesk PWA

## Cadastro de chamados

Para cadastrar um chamado, é necessário informar título, descrição, categoria e prioridade. Título e descrição não podem estar vazios ou conter apenas espaços.

O sistema gera automaticamente um identificador único, as datas de criação e atualização e o status inicial **Novo**. O chamado começa sem responsável atribuído.

## Categorias e prioridades

Categorias disponíveis:

- Não Conformidade
- Dúvida ou Conceito
- Sugestão de Melhoria

Prioridades disponíveis:

- Baixo
- Normal
- Alto

## Status e Triagem

O chamado pode assumir um dos seis status:

- Novo
- Aguardando Atendimento
- Aguardando Retorno do Cliente
- Encaminhado para o DEV
- Encaminhado para Equipe de Produto
- Fechado

A Triagem permite alterar manualmente o status e atribuir, transferir ou remover o responsável pelo atendimento.

## Edição e fechamento

Podem ser atualizados título, descrição, categoria, prioridade, status e responsável. Os dados enviados devem ser válidos.

O identificador e a data de criação são preservados. Uma alteração efetiva atualiza a data de atualização.

O fechamento define o status como **Fechado**. Na implementação atual, o status pode ser alterado novamente pela Triagem.

## Consultas

A listagem e o Dashboard utilizam os chamados armazenados. Os filtros permitem consultar os registros conforme as opções disponíveis nas telas.

## Armazenamento

Os chamados são armazenados localmente no **IndexedDB**, no navegador utilizado. Os registros devem permanecer após recarregar ou reabrir a aplicação.

Não há sincronização entre dispositivos ou perfis de navegador. Limpar os dados do site pode remover os registros.

## Validação e falhas

Dados inválidos, identificadores duplicados e atualizações de chamados inexistentes são rejeitados. A interface deve informar sucesso somente após a confirmação da gravação.

# Regras de negócio - HelpDesk PWA

Atualizado em 11/10/2026. Registro do comportamento implementado e das decisões pendentes, para alinhamento da equipe.

## 1. Objetivo e responsabilidades

O HelpDesk PWA permite abrir, priorizar, acompanhar e fechar chamados. Usa React/Vite e JavaScript no navegador. A arquitetura inicial não possui API ou servidor próprio:

Frontend → serviços e regras de negócio → persistência local.

- Wesley: telas, formulários, filtros, Kanban, responsividade, acessibilidade e integração das telas com os serviços.
- Marcus: serviços, validações, regras de negócio, integração com o Banco e recursos da PWA.
- Eliezer: modelo de dados, IndexedDB, CRUD, persistência e recuperação dos registros.

O módulo em memória de Marcus é temporário. Ele não substitui a entrega do IndexedDB de Eliezer. Alterações das telas devem ser realizadas ou alinhadas com Wesley; integração entre branches ocorre por Pull Requests revisados.

## 2. Referências e situação

Foram considerados o Plano de Ação - HelpDesk, o texto original das regras (versão 0.1), os PDFs refinados disponíveis, as mensagens de Wesley de 11/10/2026 e o código atual dos serviços e telas trazidas da develop.

O exemplo de card enviado na conversa orienta apenas a organização das tarefas. A captura da listagem mostra dados fictícios e não comprova persistência. O Diagrama de Classes é citado nos textos anteriores, mas seu arquivo original não estava disponível nesta revisão; as referências a ele são indiretas.

Neste documento:

- **Alinhado com o Frontend:** opções informadas por Wesley e confirmadas no código das telas.
- **Implementado:** comportamento presente nos serviços atuais; não significa aprovação formal de todas as propostas anteriores.
- **Pendente:** regra ou recurso que precisa de decisão, implementação ou integração.

As mensagens de Wesley pedem avanço dos serviços e do Banco para substituir os dados fictícios e realizar testes conjuntos. Elas não aprovam uma matriz de transições nem todas as propostas dos PDFs.

## 3. Categorias, prioridades e status

As categorias usadas atualmente são:

- Não Conformidade
- Dúvida ou Conceito
- Sugestão de Melhoria

As prioridades são: **Baixo**, **Normal** e **Alto**.

Os serviços aceitam esses textos exatamente, incluindo maiúsculas e acentos. As listas antigas (`SISTEMA`, `HARDWARE`, `BAIXA`, `MEDIA`, `URGENTE` etc.) não são aceitas pelo contrato atual. Não há SLA ou prazos de atendimento definidos.

O Frontend oferece cinco status: **Novo**, **Aguardando Retorno do Cliente**, **Encaminhado para o DEV**, **Encaminhado para Equipe de Produto** e **Fechado**. O serviço implementa apenas a atribuição inicial de `Novo`; ainda não oferece mudança de status ou fechamento.

## 4. Criação de chamados - implementado

- Exigir um objeto com `titulo`, `descricao`, `categoria` e `prioridade`.
- Título e descrição devem ser strings com conteúdo após remover espaços das extremidades. Salvar os textos tratados.
- Categoria e prioridade devem pertencer às listas atuais.
- O formulário inicia a prioridade como `Normal`, mas o serviço exige que ela seja enviada; ele não aplica prioridade padrão.
- Gerar ID único como string usando `crypto.randomUUID()`. Uma colisão é rejeitada pelo módulo de dados.
- Definir status `Novo`, `dataAbertura` e os instantes de criação e atualização. Campos de sistema enviados pela interface não substituem os valores gerados.
- Retornar o chamado somente após o módulo de dados confirmar a operação. Atualmente essa confirmação é de armazenamento em memória.

O ID é um UUID. A numeração `CH-001` dos dados fictícios não está implementada como código de protocolo separado. A tela limita o título a 120 caracteres; esse limite ainda não é validado no serviço e precisa de alinhamento.

## 5. Consulta e edição - implementado

Listar retorna todos os chamados salvos no módulo atual, ou uma lista vazia. Buscar por ID retorna um chamado ou `null` se não existir. ID vazio, só com espaços ou de tipo diferente de string é inválido.

A edição exige chamado existente e aceita apenas `titulo`, `descricao`, `categoria` e `prioridade`. Campos omitidos preservam o valor atual; campos enviados são validados. Enviar `null` ou `undefined` não equivale a omitir o campo.

ID, status, datas e qualquer campo fora da lista editável são rejeitados nessa operação, mesmo se o valor enviado for igual ao atual. Os textos são tratados como na criação. Se não houver mudança efetiva, não há gravação nem alteração da data; caso contrário, o serviço define `dataAtualizacao` e retorna o registro atualizado.

## 6. Datas e modelo atual

- `dataAbertura`: data local no formato `AAAA-MM-DD`, esperado pelas telas.
- `dataCriacao` e `dataAtualizacao`: strings ISO 8601 em UTC, geradas com `toISOString()`.
- Na criação, os dois instantes são iguais.

O PDF versão 0.2 descreve datas como `Date`. O formato ISO é o comportamento do código atual, não uma decisão formal já aprovada no modelo. Eliezer e Wesley devem confirmar esse contrato ou combinar a conversão. `dataFechamento` ainda não é gerada.

## 7. Persistência, falhas e offline

Os dados atuais ficam em um `Map` em memória e são perdidos ao recarregar a página. As telas consultadas continuam usando dados fictícios; os serviços disponíveis não comprovam integração completa.

IndexedDB deverá manter os registros após recarga. O Service Worker e seu cache deverão permitir abrir a interface sem conexão após preparação do cache. São responsabilidades distintas e ambas precisam de teste integrado. Hospedar a aplicação não sincroniza dados entre dispositivos; limpar os dados do site pode removê-los.

A interface deve tratar erros retornados pelos serviços e mostrar sucesso apenas após a operação terminar. Na futura integração com IndexedDB, o retorno deve aguardar a conclusão da transação.

## 8. Regras ainda pendentes

- Aprovar transições entre os cinco status atuais, fechamento em cada etapa, reabertura e justificativas.
- Definir edição de chamados fechados, significado de `dataFechamento` e eventual cancelamento; não reaplicar automaticamente a antiga matriz ABERTO/RESOLVIDO/CANCELADO.
- Confirmar histórico de status, autor da ação e gravação conjunta de status e histórico. Se adotados, ambos devem ser confirmados na mesma transação, evitando gravação parcial.
- Confirmar escopo de usuários, clientes, responsáveis, comentários, anexos e exclusão. Essas entidades aparecem nas propostas anteriores, mas não são implementadas pelos serviços atuais.
- Definir permissões, identificação do usuário, limites de texto/anexos, formato dos opcionais e eventual protocolo separado do UUID.
- Formalizar datas, retornos e operações do módulo IndexedDB com Eliezer.

## 9. Critérios de integração e entrega

O teste conjunto deve cobrir abertura → listagem/detalhes → priorização → mudança de status → fechamento → recarga offline, incluindo falhas. Criação inválida e edição proibida devem preservar os registros; consultas e filtros devem refletir os mesmos dados.

O Plano de Ação também exige instalação da PWA, manifest, ícones, atalhos, notificações conforme suporte do navegador, Service Worker, cache e funcionamento Offline First. Inclui responsividade Portrait/Landscape, publicação com link público, Lighthouse desktop/mobile (Performance > 95; Accessibility, Best Practices e SEO > 80) e apresentação de 15 minutos com tecnologias, desafios e lições aprendidas. Esses itens são critérios de entrega, não declarações de conclusão.



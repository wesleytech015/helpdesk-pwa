
# HelpDesk PWA

**Sistema web de gestão de chamados de suporte técnico**, desenvolvido como projeto acadêmico.

O HelpDesk PWA permite registrar solicitações de suporte, acompanhar atendimentos, organizar a triagem e consultar indicadores em uma interface responsiva e instalável como Progressive Web App (PWA).

🌐 **[Acessar o sistema](https://helpdesk-pwa-ten.vercel.app/)**

💻 **[Repositório GitHub](https://github.com/wesleytech015/helpdesk-pwa)**

---

## Funcionalidades

O sistema possui quatro telas principais no menu de navegação e uma tela adicional para detalhes dos chamados.

### Dashboard
- Indicadores de chamados por situação.
- Filtros por mês, ano e situação.
- Visualização dos chamados cadastrados.
- Acompanhamento dos chamados novos, aguardando atendimento, encaminhados e fechados.

### Novo Chamado
- Cadastro de solicitações de suporte.
- Campos de título, descrição, categoria e prioridade.
- Validação dos campos obrigatórios.
- Geração automática de números sequenciais, como `CH-0001`.
- Confirmação do cadastro.
- Ativação de notificações locais.

### Chamados
- Listagem dos chamados cadastrados.
- Pesquisa por número ou título.
- Filtros por status, categoria e prioridade.
- Acesso aos detalhes de cada chamado.

### Triagem
- Organização dos chamados em formato Kanban.
- Distribuição por status de atendimento.
- Pesquisa e filtros por responsável.
- Painel lateral para edição de status e responsável.

### Detalhes do Chamado
- Consulta das informações de um chamado.
- Edição de dados e status.
- Identificação por número sequencial e UUID interno.

### Notificações e PWA
- Instalação da aplicação pelo navegador.
- Funcionamento offline básico utilizando cache.
- Notificações locais para operações com chamados.
- Ícones e atalhos configurados no manifesto.
- Interface adaptada para computadores e dispositivos móveis.

---

## Tecnologias utilizadas

| Tecnologia | Aplicação no projeto |
|---|---|
| HTML5 | Estrutura das páginas e formulários |
| CSS3 | Estilização e responsividade |
| JavaScript | Lógica e funcionalidades da aplicação |
| JSX | Construção das interfaces React |
| React 19 | Componentes, estados e eventos |
| React DOM | Renderização da aplicação |
| React Router DOM 7 | Navegação entre páginas |
| Vite 8 | Ambiente de desenvolvimento e build |
| Lucide React | Ícones da interface |
| IndexedDB | Banco de dados local do navegador |
| Web App Manifest | Configuração de instalação e atalhos |
| Service Worker | Cache e recursos offline |
| Workbox | Gerenciamento do cache do PWA |
| Vite Plugin PWA | Integração do PWA ao Vite |
| Notifications API | Permissões e notificações locais |
| ESLint | Análise estática do código |
| Node.js e npm | Dependências e execução do projeto |
| Git e GitHub | Versionamento e colaboração |
| Vercel | Hospedagem e publicação |

---

## Arquitetura do sistema

O HelpDesk PWA utiliza uma arquitetura organizada em três partes principais:

**1. Frontend — React, JSX e CSS**

Responsável pelas telas, formulários, componentes, navegação, filtros e interações com o usuário.

**2. Serviços — JavaScript**

Responsáveis pelas regras de negócio, validações e comunicação entre as telas e a camada de dados.

**3. Banco de dados — IndexedDB**

Responsável pelo armazenamento persistente dos chamados no navegador.

### Fluxo de funcionamento

```text
Usuário
   |
   v
Frontend (React + JSX + CSS)
   |
   v
Serviços JavaScript
   |
   v
Camada de Dados
   |
   v
IndexedDB
   |
   v
Dados retornam aos serviços
   |
   v
Interface React atualizada
```

Os principais arquivos envolvidos nessa comunicação são:

- `chamadosService.js`
- `chamadosDados.js`
- `notificacoesService.js`
- `db.js`

**Observação:** os serviços JavaScript executam no próprio navegador. Nesta versão, o projeto não possui uma API backend independente nem banco de dados centralizado.

---

## Estrutura do projeto

```text
helpdesk-pwa/
│
├── docs/                  # Documentação técnica
├── public/                # Ícones e arquivos públicos do PWA
│
├── src/
│   ├── assets/            # Recursos visuais
│   ├── components/        # Componentes reutilizáveis
│   ├── constants/         # Constantes da aplicação
│   ├── database/          # Banco IndexedDB
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── NovoChamado.jsx
│   │   ├── Chamados.jsx
│   │   ├── Triagem.jsx
│   │   └── DetalhesChamado.jsx
│   │
│   ├── services/          # Serviços JavaScript
│   ├── styles/            # Arquivos CSS
│   ├── App.jsx            # Configuração das rotas
│   └── main.jsx           # Inicialização do React
│
├── tests/                 # Testes automatizados
├── index.html
├── package.json
├── eslint.config.js
└── vite.config.js
```

---

## Banco de dados — IndexedDB

O HelpDesk utiliza o **IndexedDB**, uma API de armazenamento local disponível nos navegadores modernos.

Os chamados permanecem armazenados no dispositivo mesmo após fechar a aplicação, desde que os dados do site não sejam excluídos.

### Identificação dos chamados

Cada chamado possui:

- **UUID:** identificador interno utilizado para localizar o registro.
- **Número sequencial:** identificação amigável apresentada ao usuário, como `CH-0001`.

Exemplo:

```text
Número: CH-0001
Título: Erro ao acessar o sistema
Categoria: Não Conformidade
Prioridade: Alto
Status: Novo
```

### Limitações

- Os dados são armazenados localmente.
- Não existe sincronização automática entre dispositivos.
- Navegadores e perfis diferentes possuem armazenamentos separados.
- A exclusão dos dados do site pode apagar os registros.

Para uma futura utilização empresarial, seria recomendável implementar uma API e um banco de dados centralizado.

---

## Progressive Web App (PWA)

O HelpDesk foi desenvolvido como uma **Progressive Web App**, combinando recursos de aplicações web com funcionalidades semelhantes às de aplicativos instaláveis.

### Recursos implementados

- Web App Manifest.
- Service Worker.
- Cache de arquivos da aplicação.
- Instalação em navegadores compatíveis.
- Ícones personalizados.
- Atalhos configurados para telas do sistema.
- Suporte offline básico.
- Notificações locais mediante autorização.

O funcionamento offline depende dos recursos previamente armazenados no cache e dos registros disponíveis no IndexedDB.

**Importante:** a instalação do PWA não gera um APK Android nem um programa Windows nativo.

---

## Como executar o projeto

### Pré-requisitos

- Node.js compatível com Vite 8.
- npm.
- Git.
- Editor de código, como Visual Studio Code.

### 1. Clonar o repositório

```bash
git clone https://github.com/wesleytech015/helpdesk-pwa.git
```

### 2. Acessar a pasta

```bash
cd helpdesk-pwa
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse o endereço exibido pelo Vite, normalmente:

`http://localhost:5173/`

### Outros comandos

| Comando | Finalidade |
|---|---|
| `npm run dev` | Inicia o ambiente de desenvolvimento |
| `npm run lint` | Verifica o código com ESLint |
| `npm run build` | Gera os arquivos de produção |
| `npm run preview` | Executa uma prévia do build |

### Testar as notificações

```bash
node --test tests/notificacoesService.test.mjs
```

### Testar o build de produção

```bash
npm run build
npm run preview
```

A versão de preview normalmente fica disponível em:

`http://localhost:4173/`

---

## Versionamento com Git e GitHub

O desenvolvimento foi organizado por branches, permitindo que cada integrante trabalhasse em suas funcionalidades.

### Fluxo utilizado

```text
feature/*
    |
    v
  develop
    |
    v
   main
    |
    v
  Vercel
```

- **feature/**: desenvolvimento de funcionalidades.
- **fix/**: correções e ajustes.
- **develop**: integração e testes.
- **main**: versão de produção.

As alterações são integradas por meio de Pull Requests.

---

## Publicação

A aplicação está hospedada na **Vercel**, com publicação vinculada à branch principal do projeto.

**Sistema publicado:**

https://helpdesk-pwa-ten.vercel.app/

**Repositório:**

https://github.com/wesleytech015/helpdesk-pwa

---

## Equipe

Projeto acadêmico desenvolvido por:

| Integrante | Responsabilidade |
|---|---|
| Wesley Souza | Frontend React, componentes, interfaces, navegação e responsividade |
| Marcus Vinicius | Serviços JavaScript, regras de negócio e recursos PWA |
| Eliezer Costa | Banco de dados IndexedDB e persistência |

---

## Melhorias futuras

O projeto atende ao propósito de um **MVP (Produto Mínimo Viável)**, mas ainda pode evoluir com:

- Banco de dados centralizado.
- API para compartilhamento de chamados.
- Autenticação e controle de acesso.
- Histórico e rastreabilidade das alterações.
- Ampliação dos testes automatizados.
- Melhorias no processo de atualização do Service Worker.
- Aperfeiçoamento das notificações.

---

## Referências

- [Documentação React](https://react.dev/)
- [Documentação Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/)
- [IndexedDB — MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Progressive Web Apps — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Vite PWA](https://vite-pwa-org.netlify.app/)

---

**HelpDesk PWA — Projeto acadêmico | 2026**


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  Users,
  UserRound,
  ClipboardList,
  ArrowRightLeft,
  X,
  ExternalLink,
  Check,
  CalendarDays,
  ListChecks
} from "lucide-react";

import { chamadosMock } from "../mocks/chamadosMock";
import "../styles/triagem.css";

// ========================================
// STATUS DISPONÍVEIS NO HELPDESK
// ========================================

// nome: valor oficial do status
// label: texto exibido no cabeçalho do Kanban
// classe: identificação visual no CSS

const statusDisponiveis = [
  {
    nome: "Novo",
    label: "Novo",
    classe: "novo"
  },
  {
    nome: "Aguardando Atendimento",
    label: "Aguardando\nAtendimento",
    classe: "atendimento"
  },
  {
    nome: "Aguardando Retorno do Cliente",
    label: "Aguardando Retorno\ndo Cliente",
    classe: "aguardando"
  },
  {
    nome: "Encaminhado para o DEV",
    label: "Encaminhado para\no DEV",
    classe: "dev"
  },
  {
    nome: "Encaminhado para Equipe de Produto",
    label: "Encaminhado para\nEquipe de Produto",
    classe: "produto"
  },
  {
    nome: "Fechado",
    label: "Fechado",
    classe: "fechado"
  }
];

// ========================================
// RESPONSÁVEIS PELO ATENDIMENTO
// ========================================

const responsaveis = [
  { id: "wesley", nome: "Wesley" },
  { id: "marcus", nome: "Marcus" },
  { id: "eliezer", nome: "Eliezer" }
];

const NAO_ATRIBUIDO = "nao-atribuido";

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function nomeResponsavel(id) {
  const responsavel = responsaveis.find(
    (item) => item.id === id
  );

  return responsavel?.nome || "Não atribuído";
}

function formatarData(data) {
  if (!data) {
    return "Não informada";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return partes.reverse().join("/");
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function Triagem() {
  // ========================================
  // PESQUISA E FILTROS
  // ========================================

  const [pesquisa, setPesquisa] = useState("");

  const [filtroResponsavel, setFiltroResponsavel] =
    useState("todos");

  // ========================================
  // ALTERAÇÕES TEMPORÁRIAS DOS CHAMADOS
  // ========================================

  const [atribuicoes, setAtribuicoes] = useState({});

  const [statusAlterados, setStatusAlterados] =
    useState({});

  // ========================================
  // PAINEL LATERAL
  // ========================================

  const [chamadoSelecionado, setChamadoSelecionado] =
    useState(null);

  const [responsavelPendente, setResponsavelPendente] =
    useState(NAO_ATRIBUIDO);

  const [statusPendente, setStatusPendente] =
    useState("Novo");

  const [mensagem, setMensagem] = useState("");

  // ========================================
  // CONSULTAR RESPONSÁVEL E STATUS
  // ========================================

  function obterResponsavel(chamado) {
    return (
      atribuicoes[chamado.id] ??
      chamado.responsavelId ??
      NAO_ATRIBUIDO
    );
  }

  function obterStatus(chamado) {
    return (
      statusAlterados[chamado.id] ??
      chamado.status
    );
  }

  // ========================================
  // ABRIR PAINEL DE TRIAGEM
  // ========================================

  function abrirTriagem(chamado) {
    setChamadoSelecionado(chamado);

    setResponsavelPendente(
      obterResponsavel(chamado)
    );

    setStatusPendente(
      obterStatus(chamado)
    );

    setMensagem("");
  }

  // ========================================
  // FECHAR PAINEL DE TRIAGEM
  // ========================================

  function fecharTriagem() {
    setChamadoSelecionado(null);
    setMensagem("");
  }

  // Fecha o painel com ESC.

  useEffect(() => {
    if (!chamadoSelecionado) {
      return;
    }

    function aoPressionarTecla(event) {
      if (event.key === "Escape") {
        fecharTriagem();
      }
    }

    document.addEventListener(
      "keydown",
      aoPressionarTecla
    );

    return () => {
      document.removeEventListener(
        "keydown",
        aoPressionarTecla
      );
    };
  }, [chamadoSelecionado]);

  // ========================================
  // SALVAR ALTERAÇÕES DA TRIAGEM
  // ========================================

  function salvarTriagem() {
    if (!chamadoSelecionado) {
      return;
    }

    const chamadoId = chamadoSelecionado.id;

    const responsavelAnterior =
      obterResponsavel(chamadoSelecionado);

    const statusAnterior =
      obterStatus(chamadoSelecionado);

    const alterouResponsavel =
      responsavelAnterior !== responsavelPendente;

    const alterouStatus =
      statusAnterior !== statusPendente;

    if (!alterouResponsavel && !alterouStatus) {
      setMensagem("Nenhuma alteração foi realizada.");
      return;
    }

    // Atualiza o responsável.

    if (alterouResponsavel) {
      setAtribuicoes((anterior) => ({
        ...anterior,
        [chamadoId]: responsavelPendente
      }));
    }

    // Atualiza o status.

    if (alterouStatus) {
      setStatusAlterados((anterior) => ({
        ...anterior,
        [chamadoId]: statusPendente
      }));
    }

    // Mensagem de confirmação.

    if (alterouResponsavel && alterouStatus) {
      setMensagem(
        "Responsável e status atualizados com sucesso."
      );
    } else if (alterouResponsavel) {
      setMensagem(
        responsavelPendente === NAO_ATRIBUIDO
          ? "Responsável removido do chamado."
          : `Chamado atribuído a ${nomeResponsavel(
              responsavelPendente
            )}.`
      );
    } else {
      setMensagem(
        `Status alterado para "${statusPendente}".`
      );
    }
  }

  // ========================================
  // FILTRAGEM DOS CHAMADOS
  // ========================================

  const chamadosFiltrados = chamadosMock.filter(
    (chamado) => {
      const texto =
        `${chamado.id} ${chamado.titulo}`.toLowerCase();

      const correspondePesquisa = texto.includes(
        pesquisa.trim().toLowerCase()
      );

      const responsavelAtual =
        obterResponsavel(chamado);

      const correspondeResponsavel =
        filtroResponsavel === "todos" ||
        responsavelAtual === filtroResponsavel;

      return (
        correspondePesquisa &&
        correspondeResponsavel
      );
    }
  );

  // ========================================
  // INDICADORES DA TRIAGEM
  // ========================================

  const totalChamados = chamadosMock.length;

  const naoAtribuidos = chamadosMock.filter(
    (chamado) =>
      obterResponsavel(chamado) === NAO_ATRIBUIDO
  ).length;

  const totalExibidos = chamadosFiltrados.length;

  // ========================================
  // VALORES ATUAIS DO CHAMADO SELECIONADO
  // ========================================

  const responsavelSelecionado = chamadoSelecionado
    ? obterResponsavel(chamadoSelecionado)
    : NAO_ATRIBUIDO;

  const statusSelecionado = chamadoSelecionado
    ? obterStatus(chamadoSelecionado)
    : "Novo";

  const alterouResponsavel =
    responsavelPendente !== responsavelSelecionado;

  const alterouStatus =
    statusPendente !== statusSelecionado;

  const possuiAlteracao =
    alterouResponsavel || alterouStatus;

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <main className="conteudo kanban-pagina">

      {/* CABEÇALHO DA PÁGINA */}

      <div className="kanban-topo">
        <h1>Central de Triagem</h1>

        <p className="subtitulo">
          Distribua atendimentos, atualize os status e
          acompanhe os chamados em um quadro Kanban.
        </p>
      </div>

      {/* ========================================
          FILTROS DA TRIAGEM
      ======================================== */}

      <section
        className="kanban-triagem"
        aria-label="Filtros da Central de Triagem"
      >
        <div className="kanban-triagem-cabecalho">
          <div>
            <ClipboardList
              size={19}
              aria-hidden="true"
            />

            <strong>Quadro de atendimentos</strong>
          </div>

          <span>
            {totalExibidos} chamado(s) exibido(s)
          </span>
        </div>

        <div className="kanban-triagem-filtros">

          {/* PESQUISA */}

          <div className="kanban-filtro-campo">
            <label htmlFor="kanban-pesquisa">
              Pesquisar chamado
            </label>

            <div className="kanban-pesquisa">
              <Search
                size={18}
                aria-hidden="true"
              />

              <input
                id="kanban-pesquisa"
                type="search"
                placeholder="Número ou título..."
                value={pesquisa}
                onChange={(event) =>
                  setPesquisa(event.target.value)
                }
              />
            </div>
          </div>

          {/* FILTRO POR RESPONSÁVEL */}

          <div className="kanban-filtro-campo">
            <label htmlFor="kanban-responsavel">
              <Users
                size={15}
                aria-hidden="true"
              />

              Responsável
            </label>

            <select
              id="kanban-responsavel"
              className="kanban-select-responsavel"
              value={filtroResponsavel}
              onChange={(event) =>
                setFiltroResponsavel(event.target.value)
              }
            >
              <option value="todos">
                Todos os atendentes
              </option>

              <option value={NAO_ATRIBUIDO}>
                Não atribuídos
              </option>

              {responsaveis.map((responsavel) => (
                <option
                  key={responsavel.id}
                  value={responsavel.id}
                >
                  {responsavel.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RESUMO DA TRIAGEM */}

        <div className="kanban-triagem-resumo">
          <span>
            <Users
              size={15}
              aria-hidden="true"
            />

            Total de chamados:
            <strong>{totalChamados}</strong>
          </span>

          <span>
            <UserRound
              size={15}
              aria-hidden="true"
            />

            Sem responsável:
            <strong>{naoAtribuidos}</strong>
          </span>
        </div>
      </section>

      {/* ========================================
          QUADRO KANBAN
      ======================================== */}

      <section
        className="kanban-container"
        aria-label="Quadro Kanban de chamados"
      >
        {statusDisponiveis.map((coluna) => {
          const chamadosDaColuna =
            chamadosFiltrados.filter(
              (chamado) =>
                obterStatus(chamado) === coluna.nome
            );

          return (
            <section
              key={coluna.nome}
              className={`kanban-coluna ${coluna.classe}`}
              aria-label={coluna.nome}
            >
              {/* CABEÇALHO DA COLUNA */}

              <div className="kanban-cabecalho">

                {/*
                  Exibe o label com quebra de linha.
                  O nome oficial não é modificado.
                */}

                <h2>{coluna.label}</h2>

                <span>
                  {chamadosDaColuna.length}
                </span>
              </div>

              {/* CARDS DOS CHAMADOS */}

              <div className="kanban-lista">
                {chamadosDaColuna.map((chamado) => {
                  const responsavelAtual =
                    obterResponsavel(chamado);

                  return (
                    <button
                      key={chamado.id}
                      type="button"
                      className="kanban-card kanban-card-acionavel"
                      onClick={() =>
                        abrirTriagem(chamado)
                      }
                      aria-label={`Abrir triagem do chamado ${chamado.id}: ${chamado.titulo}`}
                    >
                      {/* PROTOCOLO */}

                      <span className="kanban-protocolo">
                        {chamado.id}
                      </span>

                      {/* TÍTULO */}

                      <strong className="kanban-card-titulo">
                        {chamado.titulo}
                      </strong>

                      {/* CATEGORIA */}

                      <span className="kanban-categoria">
                        {chamado.categoria}
                      </span>

                      {/* PRIORIDADE */}

                      <span
                        className={`kanban-prioridade prioridade-${chamado.prioridade.toLowerCase()}`}
                      >
                        {chamado.prioridade}
                      </span>

                      {/* RESPONSÁVEL */}

                      <span className="kanban-card-resumo-responsavel">
                        <UserRound
                          size={15}
                          aria-hidden="true"
                        />

                        <span>
                          {nomeResponsavel(
                            responsavelAtual
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}

                {/* COLUNA SEM CHAMADOS */}

                {chamadosDaColuna.length === 0 && (
                  <p className="kanban-vazio">
                    Nenhum chamado
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </section>

      {/* ========================================
          PAINEL LATERAL DIREITO
      ======================================== */}

      {chamadoSelecionado && (
        <div className="triagem-overlay">

          {/* FUNDO DO PAINEL */}

          <button
            type="button"
            className="triagem-overlay-fundo"
            aria-label="Fechar painel de triagem"
            onClick={fecharTriagem}
          />

          {/* PAINEL DE TRIAGEM */}

          <aside
            className="triagem-painel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="triagem-painel-titulo"
          >
            {/* CABEÇALHO DO PAINEL */}

            <div className="triagem-painel-topo">
              <div>
                <span className="triagem-painel-protocolo">
                  {chamadoSelecionado.id}
                </span>

                <h2 id="triagem-painel-titulo">
                  Triagem do Chamado
                </h2>
              </div>

              <button
                type="button"
                className="triagem-painel-fechar"
                onClick={fecharTriagem}
                aria-label="Fechar painel"
                autoFocus
              >
                <X
                  size={21}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* CONTEÚDO DO PAINEL */}

            <div className="triagem-painel-conteudo">

              {/* INFORMAÇÕES DO CHAMADO */}

              <div className="triagem-painel-secao">
                <h3>Informações do chamado</h3>

                <strong className="triagem-detalhe-titulo">
                  {chamadoSelecionado.titulo}
                </strong>

                <p className="triagem-detalhe-descricao">
                  {chamadoSelecionado.descricao ||
                    "Descrição não informada."}
                </p>

                <dl className="triagem-detalhes-lista">
                  <div>
                    <dt>Categoria</dt>

                    <dd>
                      {chamadoSelecionado.categoria}
                    </dd>
                  </div>

                  <div>
                    <dt>Prioridade</dt>

                    <dd>
                      {chamadoSelecionado.prioridade}
                    </dd>
                  </div>

                  <div>
                    <dt>Status atual</dt>

                    <dd>
                      {statusSelecionado}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      <CalendarDays
                        size={14}
                        aria-hidden="true"
                      />

                      Abertura
                    </dt>

                    <dd>
                      {formatarData(
                        chamadoSelecionado.dataAbertura
                      )}
                    </dd>
                  </div>
                </dl>

                <Link
                  to={`/chamados/${chamadoSelecionado.id}`}
                  className="triagem-link-detalhes"
                >
                  Ver detalhes completos

                  <ExternalLink
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              </div>

              {/* ========================================
                  ALTERAÇÃO DE STATUS
              ======================================== */}

              <div className="triagem-painel-secao">
                <h3>Status do chamado</h3>

                <label
                  htmlFor="triagem-novo-status"
                  className="triagem-campo-label"
                >
                  <ListChecks
                    size={16}
                    aria-hidden="true"
                  />

                  Alterar status para
                </label>

                <select
                  id="triagem-novo-status"
                  className="triagem-select"
                  value={statusPendente}
                  onChange={(event) => {
                    setStatusPendente(
                      event.target.value
                    );

                    setMensagem("");
                  }}
                >
                  {statusDisponiveis.map((status) => (
                    <option
                      key={status.nome}
                      value={status.nome}
                    >
                      {status.nome}
                    </option>
                  ))}
                </select>

                <p className="triagem-orientacao">
                  Ao salvar, o chamado será movido
                  para a coluna correspondente ao novo
                  status no quadro Kanban.
                </p>
              </div>

              {/* ========================================
                  ATRIBUIÇÃO DE RESPONSÁVEL
              ======================================== */}

              <div className="triagem-painel-secao">
                <h3>Responsável pelo atendimento</h3>

                <div className="triagem-responsavel-atual">
                  <UserRound
                    size={18}
                    aria-hidden="true"
                  />

                  <div>
                    <span>Responsável atual</span>

                    <strong>
                      {nomeResponsavel(
                        responsavelSelecionado
                      )}
                    </strong>
                  </div>
                </div>

                <label
                  htmlFor="triagem-novo-responsavel"
                  className="triagem-campo-label"
                >
                  <ArrowRightLeft
                    size={16}
                    aria-hidden="true"
                  />

                  Atribuir ou transferir para
                </label>

                <select
                  id="triagem-novo-responsavel"
                  className="triagem-select"
                  value={responsavelPendente}
                  onChange={(event) => {
                    setResponsavelPendente(
                      event.target.value
                    );

                    setMensagem("");
                  }}
                >
                  <option value={NAO_ATRIBUIDO}>
                    Não atribuído
                  </option>

                  {responsaveis.map((responsavel) => (
                    <option
                      key={responsavel.id}
                      value={responsavel.id}
                    >
                      {responsavel.nome}
                    </option>
                  ))}
                </select>

                <p className="triagem-orientacao">
                  A atribuição pode ser alterada
                  independentemente do status do chamado.
                </p>

                {/* MENSAGEM DE CONFIRMAÇÃO */}

                {mensagem && (
                  <p
                    className="triagem-mensagem"
                    role="status"
                  >
                    <Check
                      size={16}
                      aria-hidden="true"
                    />

                    {mensagem}
                  </p>
                )}
              </div>
            </div>

            {/* ========================================
                RODAPÉ DO PAINEL
            ======================================== */}

            <div className="triagem-painel-rodape">
              <button
                type="button"
                className="triagem-botao-cancelar"
                onClick={fecharTriagem}
              >
                Fechar
              </button>

              <button
                type="button"
                className="triagem-botao-salvar"
                onClick={salvarTriagem}
                disabled={!possuiAlteracao}
              >
                <Check
                  size={17}
                  aria-hidden="true"
                />

                Salvar alterações
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}


import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import "../styles/detalhesChamado.css";

const categorias = [
  "Não Conformidade",
  "Dúvida ou Conceito",
  "Sugestão de Melhoria"
];

const prioridades = ["Baixo", "Normal", "Alto"];

const statusDisponiveis = [
  "Novo",
  "Aguardando Retorno do Cliente",
  "Encaminhado para o DEV",
  "Encaminhado para Equipe de Produto",
  "Fechado"
];

// Dados simulados. Serão substituídos posteriormente.
const chamadosExemplo = [
  {
    id: "CH-001",
    titulo: "Erro ao acessar sistema",
    descricao: "Ao tentar acessar o sistema, é apresentado um erro de autenticação.",
    categoria: "Não Conformidade",
    prioridade: "Alto",
    status: "Novo",
    dataAbertura: "2026-10-02"
  },
  {
    id: "CH-002",
    titulo: "Dúvida sobre cadastro",
    descricao: "Preciso de orientação para realizar o cadastro.",
    categoria: "Dúvida ou Conceito",
    prioridade: "Normal",
    status: "Aguardando Retorno do Cliente",
    dataAbertura: "2026-10-05"
  },
  {
    id: "CH-003",
    titulo: "Erro na emissão de relatório",
    descricao: "O sistema apresenta um erro ao emitir o relatório.",
    categoria: "Não Conformidade",
    prioridade: "Alto",
    status: "Encaminhado para o DEV",
    dataAbertura: "2026-10-07"
  },
  {
    id: "CH-004",
    titulo: "Melhoria na tela de pesquisa",
    descricao: "Sugestão para melhorar os filtros de pesquisa.",
    categoria: "Sugestão de Melhoria",
    prioridade: "Baixo",
    status: "Encaminhado para Equipe de Produto",
    dataAbertura: "2026-09-15"
  },
  {
    id: "CH-005",
    titulo: "Configuração concluída",
    descricao: "A configuração solicitada foi finalizada.",
    categoria: "Dúvida ou Conceito",
    prioridade: "Normal",
    status: "Fechado",
    dataAbertura: "2026-10-08"
  }
];

export default function DetalhesChamado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const chamadoInicial = chamadosExemplo.find(
    (chamado) => chamado.id === id
  );

  const [chamado, setChamado] = useState(
    chamadoInicial ? { ...chamadoInicial } : null
  );
  const [formulario, setFormulario] = useState(
    chamadoInicial ? { ...chamadoInicial } : null
  );
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  if (!chamado || !formulario) {
    return (
      <main className="conteudo">
        <h1>Chamado não encontrado</h1>
        <p className="subtitulo">
          Não foi encontrado um chamado com esse número.
        </p>
        <button
          className="detalhes-botao"
          onClick={() => navigate("/chamados")}
        >
          Voltar para Chamados
        </button>
      </main>
    );
  }

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  function salvarAlteracoes(evento) {
    evento.preventDefault();

    if (
      !formulario.titulo.trim() ||
      !formulario.descricao.trim()
    ) {
      setMensagem("Preencha os campos obrigatórios.");
      return;
    }

    // Atualização temporária apenas no estado React.
    setChamado({ ...formulario });
    setEditando(false);
    setMensagem(
      "Alterações aplicadas temporariamente. Ainda não foram gravadas no banco."
    );
  }

  function cancelarEdicao() {
    setFormulario({ ...chamado });
    setEditando(false);
    setMensagem("");
  }

  function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  return (
    <main className="conteudo">
      <button
        className="detalhes-voltar"
        onClick={() => navigate("/chamados")}
      >
        <ArrowLeft size={18} />
        Voltar para chamados
      </button>

      <div className="detalhes-titulo">
        <div>
          <h1>{chamado.id} - {chamado.titulo}</h1>
          <p className="subtitulo">
            Informações do chamado
          </p>
        </div>

        {!editando && (
          <button
            className="detalhes-botao"
            onClick={() => {
              setFormulario({ ...chamado });
              setEditando(true);
              setMensagem("");
            }}
          >
            <Pencil size={16} />
            Editar
          </button>
        )}
      </div>

      <section className="detalhes-container">
        <form onSubmit={salvarAlteracoes}>
          <div className="detalhes-campo">
            <label htmlFor="det-titulo">Título *</label>
            {editando ? (
              <input
                id="det-titulo"
                name="titulo"
                value={formulario.titulo}
                onChange={alterarCampo}
                required
              />
            ) : (
              <p>{chamado.titulo}</p>
            )}
          </div>

          <div className="detalhes-campo">
            <label htmlFor="det-descricao">Descrição *</label>
            {editando ? (
              <textarea
                id="det-descricao"
                name="descricao"
                value={formulario.descricao}
                onChange={alterarCampo}
                rows={4}
                required
              />
            ) : (
              <p>{chamado.descricao}</p>
            )}
          </div>

          <div className="detalhes-grade">
            <div className="detalhes-campo">
              <label htmlFor="det-categoria">Categoria</label>
              {editando ? (
                <select
                  id="det-categoria"
                  name="categoria"
                  value={formulario.categoria}
                  onChange={alterarCampo}
                >
                  {categorias.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              ) : (
                <p>{chamado.categoria}</p>
              )}
            </div>

            <div className="detalhes-campo">
              <label htmlFor="det-prioridade">Prioridade</label>
              {editando ? (
                <select
                  id="det-prioridade"
                  name="prioridade"
                  value={formulario.prioridade}
                  onChange={alterarCampo}
                >
                  {prioridades.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              ) : (
                <p>{chamado.prioridade}</p>
              )}
            </div>

            <div className="detalhes-campo">
              <label htmlFor="det-status">Status</label>
              {editando ? (
                <select
                  id="det-status"
                  name="status"
                  value={formulario.status}
                  onChange={alterarCampo}
                >
                  {statusDisponiveis.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              ) : (
                <p>{chamado.status}</p>
              )}
            </div>

            <div className="detalhes-campo">
              <label>Data de abertura</label>
              <p>{formatarData(chamado.dataAbertura)}</p>
            </div>
          </div>

          {mensagem && (
            <p className="detalhes-mensagem" role="status">
              {mensagem}
            </p>
          )}

          {editando && (
            <div className="detalhes-acoes">
              <button
                type="button"
                className="detalhes-cancelar"
                onClick={cancelarEdicao}
              >
                <X size={16} />
                Cancelar
              </button>

              <button type="submit" className="detalhes-botao">
                <Save size={16} />
                Aplicar alterações
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

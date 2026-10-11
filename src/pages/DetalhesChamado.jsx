
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";

import { chamadosMock } from "../mocks/chamadosMock";
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

export default function DetalhesChamado() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Busca o chamado nos dados centralizados.
  const chamadoInicial = chamadosMock.find(
    (item) => item.id === id
  );

  // Mantém uma cópia local para a edição temporária.
  const [chamado, setChamado] = useState(
    chamadoInicial ? { ...chamadoInicial } : null
  );

  const [formulario, setFormulario] = useState(
    chamadoInicial ? { ...chamadoInicial } : null
  );

  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // Caso o protocolo informado não exista.
  if (!chamado || !formulario || chamado.id !== id) {
    return (
      <main className="conteudo">
        <h1>Chamado não encontrado</h1>

        <p className="subtitulo">
          Não foi encontrado um chamado com esse número.
        </p>

        <button
          type="button"
          className="detalhes-botao"
          onClick={() => navigate("/chamados")}
        >
          Voltar para Chamados
        </button>
      </main>
    );
  }

  // Atualiza os campos do formulário.
  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  // Simula o salvamento das alterações.
  function salvarAlteracoes(evento) {
    evento.preventDefault();

    if (
      !formulario.titulo.trim() ||
      !formulario.descricao.trim()
    ) {
      setMensagem("Preencha os campos obrigatórios.");
      return;
    }

    // Atualiza apenas o estado local do React.
    setChamado({ ...formulario });
    setEditando(false);

    setMensagem(
      "Alterações aplicadas temporariamente. Ainda não foram gravadas no banco."
    );
  }

  // Descarta as alterações não aplicadas.
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
      {/* Retornar para a listagem */}
      <button
        type="button"
        className="detalhes-voltar"
        onClick={() => navigate("/chamados")}
      >
        <ArrowLeft size={18} />
        Voltar para chamados
      </button>

      {/* Título e botão de edição */}
      <div className="detalhes-titulo">
        <div>
          <h1>
            {chamado.id} - {chamado.titulo}
          </h1>

          <p className="subtitulo">
            Informações do chamado
          </p>
        </div>

        {!editando && (
          <button
            type="button"
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

      {/* Informações do chamado */}
      <section className="detalhes-container">
        <form onSubmit={salvarAlteracoes}>

          {/* Título */}
          <div className="detalhes-campo">
            <label htmlFor="det-titulo">
              Título *
            </label>

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

          {/* Descrição */}
          <div className="detalhes-campo">
            <label htmlFor="det-descricao">
              Descrição *
            </label>

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

            {/* Categoria */}
            <div className="detalhes-campo">
              <label htmlFor="det-categoria">
                Categoria
              </label>

              {editando ? (
                <select
                  id="det-categoria"
                  name="categoria"
                  value={formulario.categoria}
                  onChange={alterarCampo}
                >
                  {categorias.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <p>{chamado.categoria}</p>
              )}
            </div>

            {/* Prioridade */}
            <div className="detalhes-campo">
              <label htmlFor="det-prioridade">
                Prioridade
              </label>

              {editando ? (
                <select
                  id="det-prioridade"
                  name="prioridade"
                  value={formulario.prioridade}
                  onChange={alterarCampo}
                >
                  {prioridades.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <p>{chamado.prioridade}</p>
              )}
            </div>

            {/* Status */}
            <div className="detalhes-campo">
              <label htmlFor="det-status">
                Status
              </label>

              {editando ? (
                <select
                  id="det-status"
                  name="status"
                  value={formulario.status}
                  onChange={alterarCampo}
                >
                  {statusDisponiveis.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <p>{chamado.status}</p>
              )}
            </div>

            {/* Data de abertura */}
            <div className="detalhes-campo">
              <label>Data de abertura</label>

              <p>
                {formatarData(chamado.dataAbertura)}
              </p>
            </div>
          </div>

          {/* Mensagem de confirmação */}
          {mensagem && (
            <p
              className="detalhes-mensagem"
              role="status"
            >
              {mensagem}
            </p>
          )}

          {/* Botões de edição */}
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

              <button
                type="submit"
                className="detalhes-botao"
              >
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

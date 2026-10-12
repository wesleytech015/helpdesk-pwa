
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";

import {
  buscarChamadoPorId,
  atualizarChamado,
} from "../services/chamadosService";

import "../styles/detalhesChamado.css";

const categorias = [
  "Não Conformidade",
  "Dúvida ou Conceito",
  "Sugestão de Melhoria",
];

const prioridades = ["Baixo", "Normal", "Alto"];

const statusDisponiveis = [
  "Novo",
  "Aguardando Atendimento",
  "Aguardando Retorno do Cliente",
  "Encaminhado para o DEV",
  "Encaminhado para Equipe de Produto",
  "Fechado",
];

export default function DetalhesChamado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chamado, setChamado] = useState(null);
  const [formulario, setFormulario] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // Consulta o chamado real no IndexedDB.
  useEffect(() => {
    let ativo = true;

    async function carregarChamado() {
      setCarregando(true);
      setErro("");
      setMensagem("");
      setEditando(false);
      setChamado(null);
      setFormulario(null);

      try {
        const dados = await buscarChamadoPorId(id);

        if (!ativo) {
          return;
        }

        if (dados) {
          setChamado(dados);
          setFormulario({ ...dados });
        } else {
          setErro("Chamado não encontrado.");
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível consultar o chamado."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarChamado();

    return () => {
      ativo = false;
    };
  }, [id]);

  // Atualiza os campos do formulário.
  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setMensagem("");
    setErro("");
  }

  // Inicia a edição com os dados atuais.
  function iniciarEdicao() {
    setFormulario({ ...chamado });
    setEditando(true);
    setMensagem("");
    setErro("");
  }

  // Salva as alterações utilizando o serviço do Marcos.
  async function salvarAlteracoes(evento) {
    evento.preventDefault();

    if (salvando || !formulario || !chamado) {
      return;
    }

    if (
      !formulario.titulo.trim() ||
      !formulario.descricao.trim()
    ) {
      setErro("Preencha os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    setMensagem("");
    setErro("");

    try {
      // Enviamos somente os campos permitidos pelo serviço.
      const dadosAtualizados = {
        titulo: formulario.titulo.trim(),
        descricao: formulario.descricao.trim(),
        categoria: formulario.categoria,
        prioridade: formulario.prioridade,
        status: formulario.status,
      };

      const salvo = await atualizarChamado(
        chamado.id,
        dadosAtualizados
      );

      setChamado(salvo);
      setFormulario({ ...salvo });
      setEditando(false);

      setMensagem("Alterações salvas com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSalvando(false);
    }
  }

  // Descarta alterações não salvas.
  function cancelarEdicao() {
    if (salvando) {
      return;
    }

    setFormulario({ ...chamado });
    setEditando(false);
    setMensagem("");
    setErro("");
  }

  function formatarData(data) {
    if (!data) {
      return "-";
    }

    const dataTexto = String(data).slice(0, 10);
    const partes = dataTexto.split("-");

    if (partes.length !== 3) {
      return dataTexto;
    }

    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  // Estado de carregamento.
  if (carregando) {
    return (
      <main className="conteudo">
        <h1>Detalhes do Chamado</h1>
        <p className="subtitulo" role="status">
          Carregando informações do chamado...
        </p>
      </main>
    );
  }

  // Chamado não localizado ou erro na consulta.
  if (!chamado || !formulario) {
    return (
      <main className="conteudo">
        <h1>Chamado não encontrado</h1>

        <p className="subtitulo" role="alert">
          {erro || "Não foi encontrado um chamado com esse número."}
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

  return (
    <main className="conteudo">
      {/* Retornar para a listagem */}
      <button
        type="button"
        className="detalhes-voltar"
        onClick={() => navigate("/chamados")}
      >
        <ArrowLeft size={18} aria-hidden="true" />
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
            onClick={iniciarEdicao}
          >
            <Pencil size={16} aria-hidden="true" />
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
                disabled={salvando}
                maxLength={120}
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
                disabled={salvando}
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
                  disabled={salvando}
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
                  disabled={salvando}
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
                  disabled={salvando}
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

          {/* Mensagens de sucesso e erro */}
          {mensagem && (
            <p
              className="detalhes-mensagem"
              role="status"
            >
              {mensagem}
            </p>
          )}

          {erro && (
            <p
              className="detalhes-mensagem"
              role="alert"
            >
              {erro}
            </p>
          )}

          {/* Botões de edição */}
          {editando && (
            <div className="detalhes-acoes">
              <button
                type="button"
                className="detalhes-cancelar"
                onClick={cancelarEdicao}
                disabled={salvando}
              >
                <X size={16} aria-hidden="true" />
                Cancelar
              </button>

              <button
                type="submit"
                className="detalhes-botao"
                disabled={salvando}
              >
                <Save size={16} aria-hidden="true" />
                {salvando
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}


import { useState } from "react";
import { Link } from "react-router-dom";
import { criarChamado } from "../services/chamadosService";
import "../styles/novoChamado.css";

const formularioInicial = {
  titulo: "",
  descricao: "",
  categoria: "",
  prioridade: "Normal",
};

export default function NovoChamado() {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [chamadoCriado, setChamadoCriado] = useState(null);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setMensagem("");
    setTipoMensagem("");
    setChamadoCriado(null);
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();

    if (salvando) {
      return;
    }

    if (
      !formulario.titulo.trim() ||
      !formulario.descricao.trim() ||
      !formulario.categoria
    ) {
      setMensagem("Preencha todos os campos obrigatórios.");
      setTipoMensagem("erro");
      return;
    }

    setSalvando(true);
    setMensagem("");
    setTipoMensagem("");
    setChamadoCriado(null);

    try {
      const chamado = await criarChamado({
        titulo: formulario.titulo.trim(),
        descricao: formulario.descricao.trim(),
        categoria: formulario.categoria,
        prioridade: formulario.prioridade,
      });

      setChamadoCriado(chamado);
      setFormulario({ ...formularioInicial });

      setMensagem(
        "Chamado cadastrado com sucesso! O registro foi salvo no banco de dados local."
      );
      setTipoMensagem("sucesso");
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Não foi possível cadastrar o chamado. Tente novamente."
      );
      setTipoMensagem("erro");
    } finally {
      setSalvando(false);
    }
  }

  function limparFormulario() {
    if (salvando) {
      return;
    }

    setFormulario({ ...formularioInicial });
    setMensagem("");
    setTipoMensagem("");
    setChamadoCriado(null);
  }

  return (
    <main className="conteudo">
      <h1>Novo Chamado</h1>

      <p className="subtitulo">
        Preencha as informações para abrir um chamado.
      </p>

      <section className="formulario-container">
        <form onSubmit={enviarFormulario}>
          <div className="campo-formulario">
            <label htmlFor="titulo">Título *</label>

            <input
              id="titulo"
              name="titulo"
              type="text"
              value={formulario.titulo}
              onChange={atualizarCampo}
              placeholder="Informe o assunto do chamado"
              maxLength={120}
              disabled={salvando}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="descricao">Descrição *</label>

            <textarea
              id="descricao"
              name="descricao"
              value={formulario.descricao}
              onChange={atualizarCampo}
              placeholder="Descreva o problema ou a solicitação"
              rows={5}
              disabled={salvando}
              required
            />
          </div>

          <div className="campos-linha">
            <div className="campo-formulario">
              <label htmlFor="categoria">Categoria *</label>

              <select
                id="categoria"
                name="categoria"
                value={formulario.categoria}
                onChange={atualizarCampo}
                disabled={salvando}
                required
              >
                <option value="">Selecione a categoria</option>
                <option value="Não Conformidade">
                  Não Conformidade
                </option>
                <option value="Dúvida ou Conceito">
                  Dúvida ou Conceito
                </option>
                <option value="Sugestão de Melhoria">
                  Sugestão de Melhoria
                </option>
              </select>
            </div>

            <div className="campo-formulario">
              <label htmlFor="prioridade">Prioridade *</label>

              <select
                id="prioridade"
                name="prioridade"
                value={formulario.prioridade}
                onChange={atualizarCampo}
                disabled={salvando}
                required
              >
                <option value="Baixo">Baixo</option>
                <option value="Normal">Normal</option>
                <option value="Alto">Alto</option>
              </select>
            </div>
          </div>

          <p className="status-inicial">
            Status inicial: <strong>Novo</strong>
          </p>

          {mensagem && (
            <div role={tipoMensagem === "erro" ? "alert" : "status"}>
              <p className="mensagem-formulario">
                {mensagem}
              </p>

              {tipoMensagem === "sucesso" && chamadoCriado && (
                <p>
                  <strong>Número do chamado: </strong>
                  {chamadoCriado.numero || "Não disponível"}
                  {" — "}
                  <Link
                    to={`/chamados/${chamadoCriado.id}`}
                    className="link-protocolo"
                  >
                    Consultar chamado cadastrado
                  </Link>
                </p>
              )}
            </div>
          )}

          <div className="botoes-formulario">
            <button
              type="button"
              className="botao-cancelar"
              onClick={limparFormulario}
              disabled={salvando}
            >
              Limpar
            </button>

            <button
              type="submit"
              className="botao-salvar"
              disabled={salvando}
            >
              {salvando ? "Cadastrando..." : "Cadastrar Chamado"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

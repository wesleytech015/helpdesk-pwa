
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RotateCcw } from "lucide-react";
import { listarChamados } from "../services/chamadosService";
import "../styles/chamados.css";

// Status utilizados na Central de Triagem
const statusDisponiveis = [
  "Novo",
  "Aguardando Atendimento",
  "Aguardando Retorno do Cliente",
  "Encaminhado para o DEV",
  "Encaminhado para Equipe de Produto",
  "Fechado",
];

// Categorias disponíveis
const categorias = [
  "Não Conformidade",
  "Dúvida ou Conceito",
  "Sugestão de Melhoria",
];

// Prioridades disponíveis
const prioridades = ["Baixo", "Normal", "Alto"];

export default function Chamados() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("");

  // Consulta os chamados armazenados no IndexedDB
  useEffect(() => {
    let ativo = true;

    async function carregarChamados() {
      try {
        const dados = await listarChamados();

        if (ativo) {
          setChamados(Array.isArray(dados) ? dados : []);
          setErro("");
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os chamados."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarChamados();

    return () => {
      ativo = false;
    };
  }, []);

  // Filtra os chamados retornados pelo serviço
  const chamadosFiltrados = chamados.filter((chamado) => {
    const texto =
      `${chamado.id ?? ""} ${chamado.titulo ?? ""}`.toLowerCase();

    return (
      texto.includes(pesquisa.toLowerCase().trim()) &&
      (!status || chamado.status === status) &&
      (!categoria || chamado.categoria === categoria) &&
      (!prioridade || chamado.prioridade === prioridade)
    );
  });

  function limparFiltros() {
    setPesquisa("");
    setStatus("");
    setCategoria("");
    setPrioridade("");
  }

  function formatarData(data) {
    if (!data) {
      return "-";
    }

    // Trata tanto AAAA-MM-DD quanto datas ISO
    const dataTexto = String(data);
    const dataSimples = dataTexto.slice(0, 10);
    const partes = dataSimples.split("-");

    if (partes.length !== 3) {
      return dataTexto;
    }

    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  return (
    <main className="conteudo">
      <h1>Todos os Chamados</h1>

      <p className="subtitulo">
        Consulte, pesquise e filtre os chamados.
      </p>

      <section className="painel-chamados">
        {/* Pesquisa e filtros */}
        <div className="filtros-chamados">
          <div className="pesquisa-chamados">
            <Search size={18} aria-hidden="true" />

            <input
              type="search"
              aria-label="Pesquisar chamados"
              placeholder="Pesquisar por número ou título..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>

          <div className="filtro-item">
            <label htmlFor="filtro-status">Status</label>

            <select
              id="filtro-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Todos</option>

              {statusDisponiveis.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label htmlFor="filtro-categoria">Categoria</label>

            <select
              id="filtro-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas</option>

              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label htmlFor="filtro-prioridade">Prioridade</label>

            <select
              id="filtro-prioridade"
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
            >
              <option value="">Todas</option>

              {prioridades.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantidade de resultados */}
        <div className="resumo-filtros">
          <span>
            {carregando
              ? "Carregando chamados..."
              : `${chamadosFiltrados.length} chamado(s) encontrado(s)`}
          </span>

          <button
            type="button"
            className="limpar-filtros"
            onClick={limparFiltros}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Limpar filtros
          </button>
        </div>

        {/* Listagem de chamados */}
        <div className="tabela-container">
          <table className="tabela-chamados">
            <thead>
              <tr>
                <th>Número</th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Abertura</th>
              </tr>
            </thead>

            <tbody>
              {carregando && (
                <tr>
                  <td colSpan={6} className="sem-dados">
                    Carregando chamados...
                  </td>
                </tr>
              )}

              {!carregando && erro && (
                <tr>
                  <td colSpan={6} className="sem-dados" role="alert">
                    Erro ao carregar os chamados: {erro}
                  </td>
                </tr>
              )}

              {!carregando &&
                !erro &&
                chamadosFiltrados.map((chamado) => (
                  <tr key={chamado.id}>
                    <td>
                      <Link
                        to={`/chamados/${chamado.id}`}
                        className="link-protocolo"
                      >
                        {chamado.id}
                      </Link>
                    </td>

                    <td>{chamado.titulo}</td>

                    <td>{chamado.categoria}</td>

                    <td>
                      <span
                        className={`prioridade prioridade-${String(
                          chamado.prioridade ?? ""
                        ).toLowerCase()}`}
                      >
                        {chamado.prioridade}
                      </span>
                    </td>

                    <td>{chamado.status}</td>

                    <td>{formatarData(chamado.dataAbertura)}</td>
                  </tr>
                ))}

              {!carregando &&
                !erro &&
                chamadosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="sem-dados">
                      Nenhum chamado encontrado.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

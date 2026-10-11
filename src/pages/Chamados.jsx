
import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import "../styles/chamados.css";

// Dados fictícios para desenvolver o Frontend
const chamadosExemplo = [
  {
    id: "CH-001",
    titulo: "Erro ao acessar sistema",
    categoria: "Não Conformidade",
    prioridade: "Alto",
    status: "Novo",
    dataAbertura: "2026-10-02"
  },
  {
    id: "CH-002",
    titulo: "Dúvida sobre cadastro",
    categoria: "Dúvida ou Conceito",
    prioridade: "Normal",
    status: "Aguardando Retorno do Cliente",
    dataAbertura: "2026-10-05"
  },
  {
    id: "CH-003",
    titulo: "Erro na emissão de relatório",
    categoria: "Não Conformidade",
    prioridade: "Alto",
    status: "Encaminhado para o DEV",
    dataAbertura: "2026-10-07"
  },
  {
    id: "CH-004",
    titulo: "Melhoria na tela de pesquisa",
    categoria: "Sugestão de Melhoria",
    prioridade: "Baixo",
    status: "Encaminhado para Equipe de Produto",
    dataAbertura: "2026-09-15"
  },
  {
    id: "CH-005",
    titulo: "Configuração concluída",
    categoria: "Dúvida ou Conceito",
    prioridade: "Normal",
    status: "Fechado",
    dataAbertura: "2026-10-08"
  }
];

const statusDisponiveis = [
  "Novo",
  "Aguardando Retorno do Cliente",
  "Encaminhado para o DEV",
  "Encaminhado para Equipe de Produto",
  "Fechado"
];

const categorias = [
  "Não Conformidade",
  "Dúvida ou Conceito",
  "Sugestão de Melhoria"
];

const prioridades = ["Baixo", "Normal", "Alto"];

export default function Chamados() {
  const [pesquisa, setPesquisa] = useState("");
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("");

  const chamadosFiltrados = chamadosExemplo.filter((chamado) => {
    const texto = `${chamado.id} ${chamado.titulo}`.toLowerCase();

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
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  return (
    <main className="conteudo">
      <h1>Todos os Chamados</h1>
      <p className="subtitulo">
        Consulte, pesquise e filtre os chamados.
      </p>

      <section className="painel-chamados">
        <div className="filtros-chamados">
          <div className="pesquisa-chamados">
            <Search size={18} />
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
                <option key={item} value={item}>{item}</option>
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
                <option key={item} value={item}>{item}</option>
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
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="resumo-filtros">
          <span>
            {chamadosFiltrados.length} chamado(s) encontrado(s)
          </span>

          <button
            type="button"
            className="limpar-filtros"
            onClick={limparFiltros}
          >
            <RotateCcw size={15} />
            Limpar filtros
          </button>
        </div>

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
              {chamadosFiltrados.map((chamado) => (
                <tr key={chamado.id}>
                  <td>{chamado.id}</td>
                  <td>{chamado.titulo}</td>
                  <td>{chamado.categoria}</td>
                  <td>
                    <span className={
                      `prioridade prioridade-${chamado.prioridade.toLowerCase()}`
                    }>
                      {chamado.prioridade}
                    </span>
                  </td>
                  <td>{chamado.status}</td>
                  <td>{formatarData(chamado.dataAbertura)}</td>
                </tr>
              ))}

              {chamadosFiltrados.length === 0 && (
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

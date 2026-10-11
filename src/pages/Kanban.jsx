
import { useState } from "react";
import { Search } from "lucide-react";
import "../styles/kanban.css";

// Status definidos para o HelpDesk
const statusDisponiveis = [
  { nome: "Novo", classe: "novo" },
  { nome: "Aguardando Retorno do Cliente", classe: "aguardando" },
  { nome: "Encaminhado para o DEV", classe: "dev" },
  { nome: "Encaminhado para Equipe de Produto", classe: "produto" },
  { nome: "Fechado", classe: "fechado" }
];

// Dados temporários para desenvolvimento do Frontend
const chamadosExemplo = [
  {
    id: "CH-001",
    titulo: "Erro ao acessar sistema",
    categoria: "Não Conformidade",
    prioridade: "Alto",
    status: "Novo"
  },
  {
    id: "CH-002",
    titulo: "Dúvida sobre cadastro",
    categoria: "Dúvida ou Conceito",
    prioridade: "Normal",
    status: "Aguardando Retorno do Cliente"
  },
  {
    id: "CH-003",
    titulo: "Erro na emissão de relatório",
    categoria: "Não Conformidade",
    prioridade: "Alto",
    status: "Encaminhado para o DEV"
  },
  {
    id: "CH-004",
    titulo: "Melhoria na tela de pesquisa",
    categoria: "Sugestão de Melhoria",
    prioridade: "Baixo",
    status: "Encaminhado para Equipe de Produto"
  },
  {
    id: "CH-005",
    titulo: "Configuração concluída",
    categoria: "Dúvida ou Conceito",
    prioridade: "Normal",
    status: "Fechado"
  }
];

export default function Kanban() {
  const [pesquisa, setPesquisa] = useState("");

  const chamadosFiltrados = chamadosExemplo.filter((chamado) => {
    const texto = `${chamado.id} ${chamado.titulo}`.toLowerCase();

    return texto.includes(pesquisa.trim().toLowerCase());
  });

  return (
    <main className="conteudo">
      <h1>Kanban de Chamados</h1>
      <p className="subtitulo">
        Acompanhe o andamento dos chamados por status.
      </p>

      <div className="kanban-pesquisa">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          aria-label="Pesquisar chamados no Kanban"
          placeholder="Pesquisar por número ou título..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
      </div>

      <section
        className="kanban-container"
        aria-label="Quadro Kanban de chamados"
      >
        {statusDisponiveis.map((coluna) => {
          const chamadosDaColuna = chamadosFiltrados.filter(
            (chamado) => chamado.status === coluna.nome
          );

          return (
            <section
              key={coluna.nome}
              className={`kanban-coluna ${coluna.classe}`}
              aria-label={coluna.nome}
            >
              <div className="kanban-cabecalho">
                <h2>{coluna.nome}</h2>
                <span>{chamadosDaColuna.length}</span>
              </div>

              <div className="kanban-lista">
                {chamadosDaColuna.map((chamado) => (
                  <article
                    key={chamado.id}
                    className="kanban-card"
                  >
                    <strong className="kanban-protocolo">
                      {chamado.id}
                    </strong>

                    <h3>{chamado.titulo}</h3>

                    <p className="kanban-categoria">
                      {chamado.categoria}
                    </p>

                    <span
                      className={`kanban-prioridade prioridade-${chamado.prioridade.toLowerCase()}`}
                    >
                      {chamado.prioridade}
                    </span>
                  </article>
                ))}

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
    </main>
  );
}

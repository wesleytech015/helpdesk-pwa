
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

import { chamadosMock } from "../mocks/chamadosMock";
import "../styles/kanban.css";

// Status definidos para o HelpDesk
const statusDisponiveis = [
  { nome: "Novo", classe: "novo" },
  { nome: "Aguardando Retorno do Cliente", classe: "aguardando" },
  { nome: "Encaminhado para o DEV", classe: "dev" },
  { nome: "Encaminhado para Equipe de Produto", classe: "produto" },
  { nome: "Fechado", classe: "fechado" }
];

export default function Kanban() {
  const [pesquisa, setPesquisa] = useState("");

  // Filtra os chamados utilizando os dados centralizados
  const chamadosFiltrados = chamadosMock.filter((chamado) => {
    const texto = `${chamado.id} ${chamado.titulo}`.toLowerCase();

    return texto.includes(pesquisa.trim().toLowerCase());
  });

  return (
    <main className="conteudo">
      <h1>Kanban de Chamados</h1>

      <p className="subtitulo">
        Acompanhe o andamento dos chamados por status.
      </p>

      {/* Campo de pesquisa */}
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

      {/* Quadro Kanban */}
      <section
        className="kanban-container"
        aria-label="Quadro Kanban de chamados"
      >
        {statusDisponiveis.map((coluna) => {
          // Seleciona os chamados pertencentes ao status
          const chamadosDaColuna = chamadosFiltrados.filter(
            (chamado) => chamado.status === coluna.nome
          );

          return (
            <section
              key={coluna.nome}
              className={`kanban-coluna ${coluna.classe}`}
              aria-label={coluna.nome}
            >
              {/* Cabeçalho da coluna */}
              <div className="kanban-cabecalho">
                <h2>{coluna.nome}</h2>
                <span>{chamadosDaColuna.length}</span>
              </div>

              {/* Cards dos chamados */}
              <div className="kanban-lista">
                {chamadosDaColuna.map((chamado) => (
                  <article
                    key={chamado.id}
                    className="kanban-card"
                  >
                    {/* Protocolo com link para detalhes */}
                    <strong className="kanban-protocolo">
                      <Link
                        to={`/chamados/${chamado.id}`}
                        className="kanban-link"
                      >
                        {chamado.id}
                      </Link>
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

                {/* Coluna sem resultados */}
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

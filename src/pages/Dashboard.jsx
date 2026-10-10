
import { useState } from "react";
import CardIndicador from "../components/CardIndicador";

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

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Dashboard() {
  const agora = new Date();

  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());

  const chamadosFiltrados = chamadosExemplo.filter((chamado) => {
    const [anoChamado, mesChamado] =
      chamado.dataAbertura.split("-").map(Number);

    return anoChamado === Number(ano) &&
           mesChamado === Number(mes);
  });

  const contar = (status) =>
    chamadosFiltrados.filter(
      (chamado) => chamado.status === status
    ).length;

  const encaminhados = chamadosFiltrados.filter(
    (chamado) =>
      chamado.status === "Encaminhado para o DEV" ||
      chamado.status === "Encaminhado para Equipe de Produto"
  ).length;

  return (
    <main className="conteudo">
      <h1>Dashboard</h1>
      <p className="subtitulo">Visão geral dos chamados</p>

      <div className="filtros">
        <label htmlFor="mes">Mês:</label>
        <select
          id="mes"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        >
          {meses.map((nome, index) => (
            <option key={nome} value={index + 1}>
              {nome}
            </option>
          ))}
        </select>

        <label htmlFor="ano">Ano:</label>
        <select
          id="ano"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
        >
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      <section className="indicadores">
        <CardIndicador
          titulo="Novos"
          quantidade={contar("Novo")}
          cor="azul"
        />
        <CardIndicador
          titulo="Aguardando Cliente"
          quantidade={contar("Aguardando Retorno do Cliente")}
          cor="amarelo"
        />
        <CardIndicador
          titulo="Encaminhados"
          quantidade={encaminhados}
          cor="roxo"
        />
        <CardIndicador
          titulo="Fechados"
          quantidade={contar("Fechado")}
          cor="verde"
        />
      </section>

      <section className="secao-chamados">
        <h2>Chamados do período</h2>

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Prioridade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {chamadosFiltrados.map((chamado) => (
                <tr key={chamado.id}>
                  <td>{chamado.id}</td>
                  <td>{chamado.titulo}</td>
                  <td>{chamado.categoria}</td>
                  <td>{chamado.prioridade}</td>
                  <td>{chamado.status}</td>
                </tr>
              ))}
              {chamadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="sem-dados">
                    Nenhum chamado encontrado neste período.
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

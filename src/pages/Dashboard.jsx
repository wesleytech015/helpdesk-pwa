
import { useState } from "react";
import { Link } from "react-router-dom";

import CardIndicador from "../components/CardIndicador";
import { chamadosMock } from "../mocks/chamadosMock";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

export default function Dashboard() {
  const agora = new Date();

  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());

  // Filtra os chamados pela data de abertura.
  const chamadosFiltrados = chamadosMock.filter((chamado) => {
    const [anoChamado, mesChamado] = chamado.dataAbertura
      .split("-")
      .map(Number);

    return (
      anoChamado === Number(ano) &&
      mesChamado === Number(mes)
    );
  });

  // Conta os chamados de um determinado status.
  const contar = (status) =>
    chamadosFiltrados.filter(
      (chamado) => chamado.status === status
    ).length;

  // Agrupa os encaminhados para DEV e Produto.
  const encaminhados = chamadosFiltrados.filter(
    (chamado) =>
      chamado.status === "Encaminhado para o DEV" ||
      chamado.status === "Encaminhado para Equipe de Produto"
  ).length;

  return (
    <main className="conteudo">
      <h1>Dashboard</h1>

      <p className="subtitulo">
        Visão geral dos chamados
      </p>

      {/* Filtros de mês e ano */}
      <div className="filtros">
        <label htmlFor="mes">Mês:</label>

        <select
          id="mes"
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
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
          onChange={(e) => setAno(Number(e.target.value))}
        >
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
        </select>
      </div>

      {/* Indicadores dos chamados */}
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

      {/* Tabela de chamados do período */}
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
                  <td>{chamado.prioridade}</td>
                  <td>{chamado.status}</td>
                </tr>
              ))}

              {chamadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="sem-dados">
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


import {
  TicketPlus,
  Clock3,
  Send,
  CheckCircle2,
  Ticket
} from "lucide-react";

// Ícones correspondentes aos indicadores
const icones = {
  novos: TicketPlus,
  aguardando: Clock3,
  encaminhados: Send,
  fechados: CheckCircle2
};

export default function CardIndicador({
  titulo,
  quantidade,
  cor = "cinza",
  tipo = "novos"
}) {
  const Icone = icones[tipo] || Ticket;

  return (
    <article className={`card-indicador card-${cor}`}>

      {/* Título e ícone */}
      <div className="indicador-cabecalho">
        <span className="indicador-titulo">
          {titulo}
        </span>

        <span
          className="indicador-icone"
          aria-hidden="true"
        >
          <Icone
            size={20}
            strokeWidth={1.8}
          />
        </span>
      </div>

      {/* Quantidade de chamados */}
      <strong className="indicador-quantidade">
        {quantidade}
      </strong>

      {/* Descrição */}
      <span className="indicador-descricao">
        Chamados no período
      </span>
    </article>
  );
}


export default function CardIndicador({ titulo, quantidade, cor }) {
  return (
    <div className={`card-indicador ${cor}`}>
      <span>{titulo}</span>
      <strong>{quantidade}</strong>
    </div>
  );
}

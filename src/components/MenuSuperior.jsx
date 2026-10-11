
import { NavLink } from "react-router-dom";
import { Headset } from "lucide-react";

export default function MenuSuperior() {
  return (
    <header className="menu-superior">
      <div className="menu-conteudo">
        <div className="logo">
          <Headset size={26} />
          <span>HelpDesk</span>
        </div>

        <nav className="navegacao">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/chamados">Chamados</NavLink>
          <NavLink to="/kanban">Kanban</NavLink>
          <NavLink to="/novo-chamado">Novo Chamado</NavLink>
        </nav>
      </div>
    </header>
  );
}

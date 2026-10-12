
import { NavLink } from "react-router-dom";
import { Headset } from "lucide-react";

export default function MenuSuperior() {
  return (
    <header className="menu-superior">
      <div className="menu-conteudo">
        <div className="logo">
          <Headset size={26} aria-hidden="true" />
          <span>HelpDesk</span>
        </div>

        <nav
          className="navegacao"
          aria-label="Navegação principal"
        >
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/triagem">
            Triagem
          </NavLink>

          <NavLink to="/chamados">
            Chamados
          </NavLink>

          <NavLink to="/novo-chamado">
            Novo Chamado
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

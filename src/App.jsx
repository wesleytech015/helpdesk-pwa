
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MenuSuperior from "./components/MenuSuperior";
import Dashboard from "./pages/Dashboard";
import Chamados from "./pages/Chamados";
import NovoChamado from "./pages/NovoChamado";
import Triagem from "./pages/Triagem";
import DetalhesChamado from "./pages/DetalhesChamado";

import "./styles/layout.css";

export default function App() {
  return (
    <BrowserRouter>
      <MenuSuperior />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/chamados" element={<Chamados />} />

        <Route
          path="/chamados/:id"
          element={<DetalhesChamado />}
        />

        <Route
          path="/triagem"
          element={<Triagem />}
        />

        <Route
          path="/novo-chamado"
          element={<NovoChamado />}
        />
      </Routes>
    </BrowserRouter>
  );
}

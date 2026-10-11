
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MenuSuperior from "./components/MenuSuperior";
import Dashboard from "./pages/Dashboard";
import Chamados from "./pages/Chamados";
import NovoChamado from "./pages/NovoChamado";
import Kanban from "./pages/Kanban";

import "./styles/layout.css";

export default function App() {
  return (
    <BrowserRouter>
      <MenuSuperior />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chamados" element={<Chamados />} />
        <Route path="/kanban" element={<Kanban />} />
        <Route
          path="/novo-chamado"
          element={<NovoChamado />}
        />
      </Routes>
    </BrowserRouter>
  );
}

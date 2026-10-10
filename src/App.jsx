
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuSuperior from "./components/MenuSuperior";
import Dashboard from "./pages/Dashboard";
import "./styles/layout.css";

function PaginaPendente({ titulo }) {
  return (
    <main className="conteudo">
      <h1>{titulo}</h1>
      <p className="subtitulo">Tela em desenvolvimento.</p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MenuSuperior />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/chamados"
          element={<PaginaPendente titulo="Chamados" />}
        />
        <Route
          path="/kanban"
          element={<PaginaPendente titulo="Kanban" />}
        />
        <Route
          path="/novo-chamado"
          element={<PaginaPendente titulo="Novo Chamado" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

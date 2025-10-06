import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

// Importados
import ListTecnico from "./pages/tecnicos/listado/ListTecnico";
import FormTecnico from "./pages/tecnicos/formulario/FormTecnico";

import ListCliente from "./pages/cliente/listado/ListCliente";
import ListProducto from "./pages/productos/listado/ListProducto";
import ListVendedor from "./pages/vendedor/listado/ListVendedor";

import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  // 📌 Estado global de técnicos
  const [tecnicos, setTecnicos] = useState([
    { id: 1, nombre: "Pedro Pisfil", dni: "40232588" },
    { id: 2, nombre: "Danny Reyes", dni: "50808084" },
  ]);

  return (
    <div className="d-flex">
      {/* 📌 Barra lateral */}
      <div className="bg-dark text-white p-3" style={{ width: "250px", minHeight: "100vh" }}>
        <h4 className="mb-4">Menu</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/tecnicos">Técnicos</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/clientes">Clientes</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/productos">Productos</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/vendedores">Vendedores</Link>
          </li>
        </ul>
      </div>

      {/* 📌 Contenido */}
      <div className="flex-grow-1 p-4">
        <Routes>
          {/* Tecnicos */}
          <Route path="/tecnicos" element={<ListTecnico tecnicos={tecnicos} setTecnicos={setTecnicos} />} />
          <Route path="/tecnicos/nuevo" element={<FormTecnico tecnicos={tecnicos} setTecnicos={setTecnicos} />} />
          <Route path="/tecnicos/:id" element={<FormTecnico tecnicos={tecnicos} setTecnicos={setTecnicos} />} />

          {/* Clientes */}
          <Route path="/clientes" element={<ListCliente />} />

          {/* Productos */}
          <Route path="/productos" element={<ListProducto />} />

          {/* Vendedores */}
          <Route path="/vendedores" element={<ListVendedor />} />

          {/* Home por defecto */}
          <Route path="/" element={<h2>Bienvenido a MAKUTO-CHAN</h2>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;


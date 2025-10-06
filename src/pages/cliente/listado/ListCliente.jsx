import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ListCliente.css"; 

const ListCliente = () => {
  // Datos de prueba (mock)
  const clientes = [
    { id: 1, codigo: "C001", nombre: "Panadería San José" },
    { id: 2, codigo: "C002", nombre: "Pastelería Dulce Aroma" },
    { id: 3, codigo: "C003", nombre: "Distribuidora La Delicia" },
    { id: 4, codigo: "C004", nombre: "Pastelería La Delicia" }
  ];

  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar clientes
  const filteredClientes = clientes.filter(
    (c) =>
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Listado de Clientes</h2>

      {/* Barra de búsqueda */}
      <nav className="navbar bg-body-tertiary mb-3">
        <div className="container-fluid">
          <form
            className="d-flex"
            role="search"
            onSubmit={(e) => e.preventDefault()} // evita recargar la página
          >
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar cliente..."
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-azul-noche" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </nav>

      {/* Tabla */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {filteredClientes.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center">
                No se encontraron clientes
              </td>
            </tr>
          ) : (
            filteredClientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.codigo}</td>
                <td>{cliente.nombre}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListCliente;








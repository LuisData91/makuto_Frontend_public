import React from "react";

const ListVendedor = () => {
  // Datos de prueba (mock). Más adelante conectamos con tu BD SQL
  const vendedores = [
    { id: 101, codigo: "VI-02", nombre: "Anna Ramos" },
    { id: 102, codigo: "HJ-05", nombre: "Hugo Obrgon" },
    { id: 103, codigo: "VE-05", nombre: "Yover Vasquez" }
  ];

  return (
    <div className="container mt-4">
      <h2>Listado de Vendedores</h2>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>id</th>
            <th>Código Vendedor</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map((vendedor) => (
            <tr key={vendedor.id}>
              <td>{vendedor.id}</td>
              <td>{vendedor.codigo}</td>
              <td>{vendedor.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListVendedor;

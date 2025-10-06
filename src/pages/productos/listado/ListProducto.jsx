import React from "react";

const ListProducto = () => {
  const productos = [
    { id: 1, codigo: "NPT10-042", descripcion: "Crema chantilly" },
    { id: 2, codigo: "P002", descripcion: "Jarabe de tres leches" },
    { id: 3, codigo: "P003", descripcion: "Ganache de chocolate" },
    { id: 4, codigo: "P004", descripcion: "Pastry topping" }
  ];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Listado de Productos</h2>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.codigo}</td>
              <td>{producto.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListProducto;

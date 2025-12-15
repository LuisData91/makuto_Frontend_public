


import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CrudCliente = () => {
  // Estado inicial con algunos clientes de prueba
  const [clientes, setClientes] = useState([
    { id: 1, codigo: "C001", nombre: "Panadería San José" },
    { id: 2, codigo: "C002", nombre: "Pastelería Dulce Aroma" },
    { id: 3, codigo: "C003", nombre: "Distribuidora La Delicia" }
  ]);

  const [form, setForm] = useState({ id: null, codigo: "", nombre: "" });
  const [editMode, setEditMode] = useState(false);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (cli) => {
  console.log("[FormBCliente] seleccionado:", cli);
  onSelect?.(cli);
  onClose?.();
};


  // Crear cliente
  const handleAdd = (e) => {
    e.preventDefault();
    if (form.codigo && form.nombre) {
      setClientes([...clientes, { ...form, id: Date.now() }]);
      setForm({ id: null, codigo: "", nombre: "" });
    }
  };

  // Editar cliente (preparar formulario)
  const handleEdit = (cliente) => {
    setForm(cliente);
    setEditMode(true);
  };

  // Guardar cambios en cliente
  const handleUpdate = (e) => {
    e.preventDefault();
    setClientes(
      clientes.map((c) => (c.id === form.id ? form : c))
    );
    setForm({ id: null, codigo: "", nombre: "" });
    setEditMode(false);
  };

  // Eliminar cliente
  const handleDelete = (id) => {
    setClientes(clientes.filter((c) => c.id !== id));
  };

  return (
    <div className="container mt-4">
      <h2>CRUD de Clientes</h2>

      {/* Formulario */}
      <form onSubmit={editMode ? handleUpdate : handleAdd} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              type="text"
              name="codigo"
              placeholder="Código"
              value={form.codigo}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-5">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary me-2">
              {editMode ? "Actualizar" : "Agregar"}
            </button>
            {editMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setForm({ id: null, codigo: "", nombre: "" });
                  setEditMode(false);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Tabla */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay clientes
              </td>
            </tr>
          ) : (
            clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.codigo}</td>
                <td>{cliente.nombre}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(cliente)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(cliente.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FormCliente;

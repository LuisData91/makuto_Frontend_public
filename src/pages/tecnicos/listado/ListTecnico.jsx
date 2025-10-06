import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTecnicos, deleteTecnico } from "../servicio/servTecnico";

const ListTecnico = ({ tecnicos, setTecnicos }) => {
  const navigate = useNavigate();

  // 🔹 Cargar técnicos del servicio
  useEffect(() => {
    getTecnicos().then((res) => setTecnicos(res.data));
  }, [setTecnicos]);

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este técnico?")) {
      deleteTecnico(id).then(() => {
        setTecnicos((prev) => prev.filter((t) => t.id !== id));
      });
    }
  };

  return (
    <div className="container mt-4">
      <h2>Listado de Técnicos</h2>
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/tecnicos/nuevo")}
      >
        <i className="bi bi-plus-circle"></i> Agregar Técnico
      </button>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tecnicos.map((tecnico) => (
            <tr key={tecnico.id}>
              <td>{tecnico.id}</td>
              <td>{tecnico.nombre}</td>
              <td>{tecnico.dni}</td>
              <td>
                <i
                  className="bi bi-pencil-square text-warning me-3"
                  title="Editar"
                  onClick={() =>
                    navigate(`/tecnicos/${tecnico.id}`, { state: tecnico })
                  }
                ></i>
                <i
                  className="bi bi-trash-fill text-danger"
                  title="Eliminar"
                  onClick={() => handleDelete(tecnico.id)}
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListTecnico;


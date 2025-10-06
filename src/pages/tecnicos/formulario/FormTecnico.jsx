import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { createTecnico, updateTecnico } from "../servicio/servTecnico";

const FormTecnico = ({ tecnicos, setTecnicos }) => {
  const [formData, setFormData] = useState({ nombre: "", dni: "" });
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (id && location.state) {
      setFormData(location.state);
    }
  }, [id, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id) {
      await updateTecnico(id, formData);
      setTecnicos((prev) =>
        prev.map((t) => (t.id === parseInt(id) ? { ...t, ...formData } : t))
      );
      alert("Técnico actualizado (mock)");
    } else {
      const res = await createTecnico(formData);
      setTecnicos((prev) => [...prev, res.data]);
      alert("Técnico creado (mock)");
    }

    navigate("/tecnicos");
  };

  return (
    <div className="container mt-4">
      <h2>{id ? "Editar Técnico" : "Agregar Técnico"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">DNI</label>
          <input
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-azul-noche me-2">
          {id ? "Actualizar" : "Guardar"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/tecnicos")}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default FormTecnico;

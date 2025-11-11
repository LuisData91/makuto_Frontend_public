import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReclamoService } from "../reclamoService"; // ojo a la ruta relativa

export default function ListReclamo() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const lista = await ReclamoService.listar();
        setRows(Array.isArray(lista) ? lista : []);
      } catch (e) {
        setError("No se pudieron cargar los reclamos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-3">Cargando…</div>;
  if (error) return <div className="p-3 text-danger">{error}</div>;

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Reclamos</h4>
        <Link to="/calidad/reclamos/nuevo" className="btn btn-primary">
          Nuevo reclamo
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-sm align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>N° Doc</th>
              <th>Estado</th>
              <th style={{width: 120}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="text-muted">Sin resultados</td></tr>
            ) : rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.fecha || r.created_at}</td>
                <td>{r.cliente_nombre || r.cliente}</td>
                <td>{r.num_doc || "-"}</td>
                <td>{r.estado_descripcion || r.estado}</td>
                <td>
                  <Link to={`/calidad/reclamos/${r.id}`} className="btn btn-sm btn-outline-secondary">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

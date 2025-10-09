import { useEffect, useState, useCallback, useContext } from "react";
import { listarTecnicos } from "../servicio/tecnicoService";
import { useNavigate } from "react-router-dom";
import { GeneralContext } from "../../../context/generalContext";

const ListTecnico = () => {

  const { setRegNuevo } = useContext(GeneralContext)
  const [tecnicos, setTecnicos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // q = filtro aplicado; filtro = texto del input
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState("");

  const navigate = useNavigate();

  const cargarTecnicos = useCallback(
    async (pagina = 1, criterio = q) => {
      try {
        const { data, pagination } = await listarTecnicos({
          q: criterio,
          page: pagina,
          per_page: 10,
        });

        setTecnicos(data || []);
        setPaginaActual(pagination.page);
        setTotalPaginas(pagination.pages);
        setTotalRegistros(pagination.total); // <-- importante: total, no per_page
      } catch (error) {
        console.error("Error al cargar técnicos:", error);
      }
    },
    [q]
  );

  useEffect(() => {
    cargarTecnicos(paginaActual);
  }, [paginaActual, q, cargarTecnicos]);

  const aplicarFiltro = () => {
    setPaginaActual(1);
    setQ(filtro.trim());
  };

  const limpiarFiltro = () => {
    setFiltro("");
    setPaginaActual(1);
    setQ("");
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Enter") aplicarFiltro();
  };

  return (
    <div className="container mt-4">
      <h2>Listado de Técnicos</h2>

      <div className="d-flex justify-content-between">
        <div className="p-2">
          {/* Boton Agregar */}
          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              setRegNuevo(true);
              navigate('/tecnico/nuevo');
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Técnico
          </button>
        </div>

        <div className="p-2">
          <div className="input-group mb-3">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={aplicarFiltro}
              title="Aplicar filtro"
            >
              <i className="fa-solid fa-filter"></i>
            </button>
            <input
              type="text"
              className="form-control"
              placeholder="Criterio de búsqueda"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              onKeyDown={onInputKeyDown}
            />
            {(q || filtro) && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={limpiarFiltro}
                title="Limpiar"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla - Lista de Registros */}
      <table className="table table-bordered table-striped">
        
        {/* Cabecera de Tabla */}
        <thead className="table-dark">
          <tr>
            <th>CODIGO</th>
            <th>NOMBRE</th>
            <th className="text-center">VER DETALLE</th>
          </tr>
        </thead>

        {/* Detalle de Tabla */}
        <tbody>
          {tecnicos.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                Sin resultados
              </td>
            </tr>
          ) : (
            tecnicos.map((tecnico) => (
              <tr key={tecnico.cod_tec}>
                <td>{tecnico.cod_tec}</td>
                <td>{tecnico.nombre}</td>
                <td className="text-center">
                  <i 
                    className="fa-solid fa-glasses"
                    role="button"
                    title="Editar"
                    onClick={() => {
                      setRegNuevo(false);
                      navigate(`/tecnico/${encodeURIComponent(tecnico.cod_tec)}/editar`);
                    }}
                  ></i>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center">
        <div>Total: {totalRegistros}</div>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            disabled={paginaActual <= 1}
            onClick={() => setPaginaActual((p) => p - 1)}
          >
            Anterior
          </button>
          <span>
            {paginaActual} / {totalPaginas}
          </span>
          <button
            className="btn btn-outline-secondary ms-2"
            disabled={paginaActual >= totalPaginas}
            onClick={() => setPaginaActual((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListTecnico;

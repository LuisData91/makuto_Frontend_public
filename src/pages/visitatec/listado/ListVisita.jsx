import { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GeneralContext } from "../../../context/generalContext";
import { listarVisitas } from "../servicio/visitaService";
import { obtenerTecnico } from "../../tecnicos/servicio/tecnicoService";
import "./ListVisita.css";

const ListVisita = () => {

    const { setRegNuevo, usuActual, setDTecnico } = useContext(GeneralContext);
    const [visitas, setVisitas] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [q, setQ] = useState("");
    const [filtro, setFiltro] = useState("");
    const hideOnMobile = "d-none d-md-table-cell";

    const navigate = useNavigate();

    const formatFecha = (valor) => {
        if (!valor) return "";
        const str = String(valor).trim();

        // Caso principal: YYYYMMDD (8 dígitos)
        if (/^\d{8}$/.test(str)) {
            const yyyy = str.slice(0, 4);
            const mm = str.slice(4, 6);
            const dd = str.slice(6, 8);
            return `${dd}.${mm}.${yyyy.slice(2)}`; // dd.mm.yy
        }

        // Fallback por si alguna vez llega ISO u otro formato parseable
        const d = new Date(str);
        if (!isNaN(d)) {
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yy = String(d.getFullYear()).slice(-2);
            return `${dd}.${mm}.${yy}`;
        }

        // Si no coincide con nada, lo mostramos tal cual
        return str;
    };

    const cargarVisitas = useCallback(
        async (pagina = 1, criterio = q) => {
            try {
                const { data } = await listarVisitas({
                    q: criterio,
                    page: pagina,
                    size: 10,
                    usrCod: usuActual.usr_cod,
                });

                const { data: tec } = await obtenerTecnico(usuActual.usr_cod);
                setDTecnico(tec);
                setVisitas(data.items || []);
                setPaginaActual(data.page);
                setTotalPaginas(data.pages);
                setTotalRegistros(data.total);
            } catch (error) {
                console.error("Error al cargar las visitas :", error);
            }
        },
        [q]
    );

    useEffect(() => {
        cargarVisitas(paginaActual);
    }, [paginaActual, q, cargarVisitas]);

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
            <h2>Visitas Técnicas</h2>

            <div className="d-flex justify-content-between">
                <div className="p-2">
                    {/* Boton Agregar */}
                    <button
                        className="btn btn-primary mb-3"
                        onClick={() => {
                            setRegNuevo(true);
                            navigate('/visita/nuevo');
                        }}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Registrar Visita
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
            <table className="table table-bordered table-striped table-sm visitas-table">

                {/* Cabecera de Tabla */}
                <thead className="table-dark">
                    <tr>
                        <th className={hideOnMobile} >DOCUMENTO</th>
                        <th>CLIENTE</th>
                        <th>EMISIÓN</th>
                        <th className={hideOnMobile} >MOTIVO</th>
                        <th className={hideOnMobile} >VENDEDOR</th>
                        <th className={hideOnMobile} >TÉCNICO</th>
                        <th className="text-center">VER DETALLE</th>
                    </tr>
                </thead>

                {/* Detalle de Tabla */}
                <tbody>
                    {visitas.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center">
                                Sin resultados
                            </td>
                        </tr>
                    ) : (
                        visitas.map((visita) => (
                            <tr key={visita.id}>
                                <td className={hideOnMobile} >{visita.correlativo}</td>
                                <td>{visita.cliente}</td>
                                <td>{formatFecha(visita.fecha_dig)}</td>
                                <td className={hideOnMobile} >{visita.motivo}</td>
                                <td className={hideOnMobile} >{visita.vendedor}</td>
                                <td className={hideOnMobile} >{visita.tecnico}</td>
                                <td className="text-center">
                                    <i
                                        className="fa-solid fa-glasses"
                                        role="button"
                                        title="Editar"
                                        onClick={() => {
                                            setRegNuevo(false);
                                            navigate(`/visita/${encodeURIComponent(visita.id)}/editar`);
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
    )
}

export default ListVisita;
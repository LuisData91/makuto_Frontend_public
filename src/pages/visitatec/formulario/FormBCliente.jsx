import { useEffect, useMemo, useState } from 'react';
import { listarClientes } from '../../cliente/servicio/clienteService';

const FormBCliente = ({ show, onClose, onSelect }) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const canShow = !!show;

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, pagination: pg } = await listarClientes({
        q,
        page,
        per_page: perPage,
      });

      setRows(data || []);

      const current = pg?.page ?? pg?.current_page ?? page ?? 1;
      const pages = pg?.total_pages ?? pg?.pages ?? 1;
      const total = pg?.total_items ?? pg?.total ?? data?.length ?? 0;

      setPaginaActual(current);
      setTotalPaginas(pages);
      setTotalRegistros(total);
    } catch (err) {
      console.error(err);
      setRows([]);
      setPaginaActual(1);
      setTotalPaginas(1);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canShow) fetchData();
  }, [canShow, page, perPage, q]);

  const handleSelect = (cli) => {
    console.log("[FormBCliente] seleccionado:", cli); // 👈 para que veas qué trae
    onSelect?.(cli);
    onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (page !== 1) setPage(1);
    else fetchData();
  };

  const modalClass = useMemo(
    () => `modal fade ${canShow ? "show d-block" : ""}`,
    [canShow]
  );

  return (
    <>
      <div className={modalClass} tabIndex="-1" role="dialog" aria-modal={canShow} aria-hidden={!canShow}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Buscar Cliente</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <form className="row g-2 align-items-end mb-3" onSubmit={handleSubmit}>
                <div className="col-12 col-md-6">
                  <input
                    className="form-control"
                    placeholder="Código (RUC) o razón social"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                <div className="col-1 col-md-1">
                  <button type="submit" className="btn btn-primary w-100">
                    <i className="fa-solid fa-magnifying-glass me-2" />
                  </button>
                </div>
              </form>

              <div className="table-responsive">
                <table className="table table-hover align-middle table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Razón Social</th>
                      {/* <th>Teléfono</th>
                      <th>Correo</th>
                      <th>Dirección</th> */}
                      <th style={{ width: 120 }} className="text-end">Seleccionar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="spinner-border spinner-border-sm" role="status" />
                            <span>Cargando...</span>
                          </div>
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-muted">Sin resultados</td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.cli_id}>
                          <td>{r.cod}</td>
                          <td>{r.nombre}</td>
                          {/* <td>{r.telefono}</td>
                          <td>{r.correo}</td>
                          <td>{r.direccion}</td> */}
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleSelect(r)}
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>Total: {totalRegistros}</div>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={paginaActual <= 1 || loading}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    « Anterior
                  </button>

                  <span className="mx-2">
                    {paginaActual} / {totalPaginas}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={paginaActual >= totalPaginas || loading}
                    onClick={() => setPage(p => Math.min((totalPaginas || p + 1), p + 1))}
                  >
                    Siguiente »
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {canShow && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default FormBCliente;

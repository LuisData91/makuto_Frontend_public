// src/pages/calidad/formulario/FormReclamo.jsx

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import FormBCliente from "../../cliente/formulario/FormBCliente";
import FormBVendedor from "../../vendedor/formulario/FormBVendedor";
import FormBProducto from "../../productos/formulario/FormBProducto";

import { ReclamoService } from "../reclamoService";
import { GeneralContext } from "../../../context/generalContext";

const hoyYYYYMMDD = () => {
  const d = new Date(); const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function FormReclamo() {
  const { regNuevo } = useContext(GeneralContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(!regNuevo);
  const [saving, setSaving] = useState(false);

  // estado principal del formulario
  const [form, setForm] = useState({
    num_doc: "",
    fecha: hoyYYYYMMDD(),
    // cliente
    id_clien: null, cod_clien: "", nom_clien: "",
    // vendedor
    id_vend: null, cod_vend: "", nom_vend: "",
    // productos (detalle)
    detalle: [], // [{cod_prod, nom_prod}]
    // otros campos
    descripcion: "",
    obs: ""
  });

  // ==== Modales ====
  const [showCli, setShowCli] = useState(false);
  const [showVend, setShowVend] = useState(false);
  const [showProd, setShowProd] = useState(false);

  const onSelectCliente = (cli) => setForm(p => ({
    ...p, id_clien: cli.cli_id, cod_clien: cli.cod, nom_clien: cli.nombre
  }));

  const onSelectVendedor = (v) => setForm(p => ({
    ...p, id_vend: v.vend_id, cod_vend: v.cod, nom_vend: v.nombre
  }));

  const onSelectProducto = (prod) => {
    const codigo = String(prod?.cod || "").trim();
    const nombre = String(prod?.nombre || "").trim();
    if (!codigo) return;
    setForm(p => {
      const existe = p.detalle.some(d => d.cod_prod === codigo);
      return existe ? p : { ...p, detalle: [...p.detalle, { cod_prod: codigo, nom_prod: nombre }] };
    });
  };

  const quitarProducto = (cod) =>
    setForm(p => ({ ...p, detalle: p.detalle.filter(d => d.cod_prod !== cod) }));

  // ==== Carga (modo editar) ====
  useEffect(() => {
    if (regNuevo) return;
    (async () => {
      try {
        setLoading(true);
        const data = await ReclamoService.obtener(id);
        setForm({
          num_doc: data?.num_doc ?? "",
          fecha: (data?.fecha || hoyYYYYMMDD()).slice(0,10),
          id_clien: data?.id_clien ?? null,
          cod_clien: data?.cliente?.cod ?? data?.cod_clien ?? "",
          nom_clien: data?.cliente?.nombre ?? data?.nom_clien ?? "",
          id_vend: data?.id_vend ?? null,
          cod_vend: data?.vendedor?.cod ?? data?.cod_vend ?? "",
          nom_vend: data?.vendedor?.nombre ?? data?.nom_vend ?? "",
          detalle: Array.isArray(data?.productos)
            ? data.productos.map(p => ({ cod_prod: p.cod || p.cod_prod, nom_prod: p.nombre || p.nom_prod }))
            : [],
          descripcion: data?.descripcion ?? "",
          obs: data?.obs ?? ""
        });
      } catch {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar el reclamo" });
        navigate("/calidad/reclamos");
      } finally { setLoading(false); }
    })();
  }, [regNuevo, id, navigate]);

  // ==== Guardar ====
  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      num_doc: form.num_doc,
      fecha: form.fecha.replaceAll("-", ""), // AAAAMMDD si así guarda tu backend
      id_clien: form.cod_clien,
      id_vend: form.cod_vend,
      descripcion: form.descripcion,
      obs: form.obs,
      productos: form.detalle.map(d => ({ cod_prod: d.cod_prod }))
    };

    try {
      setSaving(true);
      if (regNuevo) {
        const created = await ReclamoService.crear(payload);
        toast.success("Reclamo creado");
        navigate(`/calidad/reclamos/${created.id}`);
      } else {
        await ReclamoService.actualizar(id, payload);
        toast.success("Reclamo actualizado");
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || "No se pudo guardar" });
    } finally { setSaving(false); }
  };

  if (loading) return <p className="p-4">Cargando…</p>;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row justify-content-center w-100 px-3">
        <div className="col-12 col-xl-11">
          <div className="card shadow-sm">
            <div className="card-header"><span className="fw-bold">Registro de Reclamos</span></div>
            <div className="card-body p-4 p-md-5">
              <form onSubmit={onSubmit} autoComplete="off">
                <div className="row g-3">
                  {/* Nro Doc y Fecha */}
                  <div className="col-12 col-md-6">
                    <div className="form-floating">
                      <input type="text" className="form-control" value={form.num_doc} readOnly />
                      <label>Nro. Documento</label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="form-floating">
                      <input type="date" className="form-control" value={form.fecha}
                        onChange={(e)=>setForm(p=>({...p,fecha:e.target.value}))}
                        onFocus={(e)=>e.target.showPicker && e.target.showPicker()} />
                      <label>F. Emisión</label>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="col-12">
                    <div className="input-group">
                      <div className="form-floating flex-grow-1">
                        <input className="form-control" readOnly value={form.nom_clien} />
                        <label>Cliente {form.cod_clien ? `(${form.cod_clien})` : ""}</label>
                      </div>
                      <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowCli(true)}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </button>
                    </div>
                  </div>

                  {/* Vendedor */}
                  <div className="col-12">
                    <div className="input-group">
                      <div className="form-floating flex-grow-1">
                        <input className="form-control" readOnly value={form.nom_vend} />
                        <label>Vendedor {form.cod_vend ? `(${form.cod_vend})` : ""}</label>
                      </div>
                      <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowVend(true)}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </button>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="col-12">
                    <div className="form-floating">
                      <textarea className="form-control" style={{height:"100px"}}
                        value={form.descripcion}
                        onChange={(e)=>setForm(p=>({...p,descripcion:e.target.value}))}/>
                      <label>Descripción</label>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="col-12">
                    <div className="input-group mb-2">
                      <button className="btn btn-info" type="button" onClick={()=>setShowProd(true)}>
                        <i className="fa-solid fa-plus"></i>
                      </button>
                      <span className="input-group-text">Productos</span>
                    </div>

                    <div className="p-2 rounded">
                      <div className="d-flex flex-wrap gap-2">
                        {form.detalle.length === 0
                          ? <span className="text-muted">Sin productos aún</span>
                          : form.detalle.map(p => (
                              <span key={p.cod_prod} className="badge rounded-pill text-bg-light border border-dark d-inline-flex align-items-center px-3 py-2">
                                <span className="me-2">{p.nom_prod}</span>
                                <button type="button" className="btn-close" onClick={()=>quitarProducto(p.cod_prod)} />
                              </span>
                            ))
                        }
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="col-12">
                    <div className="form-floating">
                      <textarea className="form-control text-uppercase" style={{height:"100px"}}
                        value={form.obs}
                        onChange={(e)=>setForm(p=>({...p,obs:e.target.value.toLocaleUpperCase("es-PE")}))}/>
                      <label>Observaciones</label>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="col-12 d-flex gap-2 justify-content-end">
                    <button className="btn btn-primary" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
                    <button type="button" className="btn btn-secondary" disabled={saving} onClick={()=>navigate("/calidad/reclamos")}>Cancelar</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Modales */}
          <FormBCliente show={showCli} onClose={()=>setShowCli(false)} onSelect={onSelectCliente} />
          <FormBVendedor show={showVend} onClose={()=>setShowVend(false)} onSelect={onSelectVendedor} />
          <FormBProducto show={showProd} onClose={()=>setShowProd(false)} onSelect={onSelectProducto} closeOnSelect={false}/>
        </div>
      </div>
    </div>
  );
}

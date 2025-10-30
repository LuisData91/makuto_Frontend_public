import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import FormBCliente from "./FormBCliente";
import FormBVendedor from "./FormBVendedor";
import FormBMotivo from "./FormBMotivo";
import FormBProducto from "./FormBProducto";
import { actualizarVisitaFull, crearVisitaFull, eliminarVisita, obtenerVisitaPorId, } from "../servicio/visitaService";
import { GeneralContext } from "../../../context/generalContext";

const hoyYYYYMMDD = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

function toAAAAMMDD(value) {
    if (value instanceof Date) {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, "0");
        const dd = String(value.getDate()).padStart(2, "0");
        return `${yyyy}${mm}${dd}`;
    }
    if (typeof value === "string") {
        const s = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.replace(/-/g, "");
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
            const [dd, mm, yyyy] = s.split("/");
            return `${yyyy}${mm}${dd}`;
        }
        if (/^\d{8}$/.test(s)) return s;
    }
    return "";
}

function toYYYYMMDD(value) {
    let y, m, d;

    if (value instanceof Date) {
        y = String(value.getFullYear());
        m = String(value.getMonth() + 1).padStart(2, "0");
        d = String(value.getDate()).padStart(2, "0");
    } else if (typeof value === "string") {
        const s = value.trim();
        // Quita separadores si viniera con - o /
        const digits = s.replace(/[-/]/g, "");
        if (!/^\d{8}$/.test(digits)) return "";
        y = digits.slice(0, 4);
        m = digits.slice(4, 6);
        d = digits.slice(6, 8);
    } else {
        return "";
    }

    // Validación de fecha real
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    if (
        dt.getFullYear() !== Number(y) ||
        dt.getMonth() + 1 !== Number(m) ||
        dt.getDate() !== Number(d)
    ) {
        return "";
    }

    return `${y}-${m}-${d}`;
}

const FormVisita = () => {

    const { dTecnico, regNuevo } = useContext(GeneralContext);
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(!regNuevo);
    const [isDeleting, setIsDeleting] = useState(false);
    const { id: codParam } = useParams();

    const mapDetalle = (d = {}) => ({
        id: d?.id ?? null,
        cod_prod: d?.cod_prod || "",
        nom_prod: d?.nom_prod || "",
    });

    const [form, setForm] = useState({
        documento: "",
        fecha: hoyYYYYMMDD(),
        id_clien: null,
        cod_clien: "",
        nom_clien: "",
        id_vend: null,
        cod_vend: "",
        nom_vend: "",
        id_tec: null,
        cod_tec: "",
        nom_tec: "",
        id_motivo: null,
        cod_motivo: "",
        nom_motivo: "",
        obs: "",
        detalle: [],
    });

    // ******* Cliente ***********
    const [showCli, setShowCli] = useState(false);
    const abrirCliente = () => setShowCli(true);
    const cerrarCliente = () => setShowCli(false);
    const handleSelectCliente = (cli) => {
        setForm((prev) => ({
            ...prev,
            id_clien: cli.cli_id,
            cod_clien: cli.cod,
            nom_clien: cli.nombre,
        }));
    };

    // ******** Vendedor *******

    const [showVend, setShowVend] = useState(false);
    const abrirVendedor = () => setShowVend(true);
    const cerrarVendedor = () => setShowVend(false);
    const handleSelectVendedor = (vend) => {
        setForm((prev) => ({
            ...prev,
            id_vend: vend.vend_id,
            cod_vend: vend.cod,
            nom_vend: vend.nombre,
        }));
    };

    // ******** Motivo visita *******

    const [showMotivo, setShowMotivo] = useState(false);
    const abrirMotivo = () => setShowMotivo(true);
    const cerrarMotivo = () => setShowMotivo(false);
    const handleSelectMotivo = (motivo) => {
        setForm((prev) => ({
            ...prev,
            id_motivo: motivo.id_visita,
            cod_motivo: motivo.id_visita, // no existe motivo.cod
            nom_motivo: motivo.descripcion,
        }));
    };

    // ******** Producto *******

    const [showProducto, setShowProducto] = useState(false);
    const abrirProducto = () => setShowProducto(true);
    const cerrarProducto = () => setShowProducto(false);

    const safeTrim = (v) => (typeof v === "string" ? v.trim() : v ?? "");

    const normalizarProducto = (producto = {}) => ({
        id: producto?.prod_id ?? null,                 // id interno del producto (num)
        codigo: safeTrim(producto?.cod) || "",         // clave funcional para detalle
        nombre: safeTrim(producto?.nombre) || "",
    });

    const handleSelectProducto = (producto) => {
        const p = normalizarProducto(producto);
        if (!p.codigo) return;

        setForm((prev) => {
            const existeEnDetalle = prev.detalle?.some(
                (d) => safeTrim(d.cod_prod) === p.codigo
            );

            if (existeEnDetalle) return prev;

            const nuevoDet = {
                id: null,
                cod_prod: p.codigo,
                nom_prod: p.nombre,
            };

            return { ...prev, detalle: [...(prev.detalle || []), nuevoDet] };
        });
    };

    const eliminarProducto = (cod) => {
        const codigo = (cod ?? "").trim();
        setForm((prev) => ({
            ...prev,
            detalle: (prev.detalle || []).filter(
                (d) => (d.cod_prod ?? "").trim() !== codigo
            ),
        }));
    };

    const handleDelete = async () => {
        if (regNuevo || !codParam) return;

        const { isConfirmed } = await Swal.fire({
            icon: "warning",
            title: "¿Eliminar visita?",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!isConfirmed) return;

        try {
            setIsDeleting(true);
            const resp = await eliminarVisita(codParam);
            if (resp?.ok) {
                toast.success("Visita eliminada.");
                navigate("/visita");
            } else {
                const msg = resp?.message || "No se pudo eliminar la visita.";
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: msg,
                    confirmButtonText: "Aceptar",
                });
            }
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.message || "Error al eliminar la visita.",
                confirmButtonText: "Aceptar",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payloadBase = {
            fecha_emision: form.fecha,
            id_tec: dTecnico.cod_tec,
            id_vend: form.cod_vend,
            id_clien: form.cod_clien,
            id_motivo: form.cod_motivo,
            obs: form.obs,
        };

        try {
            setIsSaving(true);

            if (regNuevo) {
                const resp = await crearVisitaFull({
                    ...payloadBase,
                    fecha_emision: toAAAAMMDD(form.fecha),
                    productos: form.detalle.map((p) => ({ cod_prod: p.cod_prod })),
                });

                if (resp?.ok) {
                    const corr = resp.data?.correlativo;
                    setForm((prev) => ({ ...prev, documento: corr }));
                    toast.success(`Registro guardado. Doc: ${corr ?? "—"}`);
                    setTimeout(() => navigate("/visita"), 800);
                } else {
                    const msg = resp?.message || "No se pudo crear la visita.";
                    await Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: msg,
                        confirmButtonText: "Aceptar",
                    });
                }
            } else {
                const resp = await actualizarVisitaFull(
                    codParam,
                    {
                        ...payloadBase,
                        detalles: form.detalle.map((p) => ({ cod_prod: p.cod_prod })),
                    },
                    "reemplazar"
                );

                if (resp?.ok) {
                    toast.success("Visita actualizada.");
                    setTimeout(() => navigate("/visita"), 600);
                } else {
                    const msg = resp?.message || "No se pudo actualizar la visita.";
                    await Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: msg,
                        confirmButtonText: "Aceptar",
                    });
                }
            }
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.message || (regNuevo ? "Error al crear la visita." : "Error al actualizar la visita."),
                confirmButtonText: "Aceptar",
            });
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (regNuevo) return;
        (async () => {
            try {
                setLoading(true);
                const { data } = await obtenerVisitaPorId(codParam);
                setForm({
                    documento: data?.correlativo ?? "",
                    fecha: toYYYYMMDD(data?.fecha_dig),
                    id_clien: data?.id_clien,
                    cod_clien: data.cliente.cod,
                    nom_clien: data.cliente.nombre,
                    id_vend: data?.id_vend,
                    cod_vend: data.vendedor.cod,
                    nom_vend: data.vendedor.nombre,
                    id_tec: data?.id_tec ?? "",
                    cod_tec: data.tecnico.cod,
                    nom_tec: data.tecnico.nombre,
                    id_motivo: data?.id_motivo,
                    cod_motivo: data.motivo.cod,
                    nom_motivo: data.motivo.descripcion,
                    obs: data?.obs ?? "",
                    detalle: Array.isArray(data.detalles) ? data.detalles.map(mapDetalle) : [],
                })

            } catch (e) {
                alert("No se pudo cargar el documento ")
                navigate("/visita")
            } finally {
                setLoading(false);
            }

        })();
    }, [regNuevo, codParam, navigate]);

    if (loading) return <p className="p-4">Cargando…</p>;

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="row justify-content-center w-100 px-3">
                <div className="col-12 col-xl-11">
                    {/* INICIO DE CARD */}
                    <div className="card shadow-sm">
                        {/* CABECERA DEL CARD */}
                        <div className="card-header">
                            <span className="fw-bold">Registro de Visitas</span>
                        </div>

                        {/* DETALLE DEL CARD */}
                        <div className="card-body p-4 p-md-5">
                            <form autoComplete="off" onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    {/* Nro. de Documento */}
                                    <div className="col-12 col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="documento"
                                                placeholder="Nro. de documento"
                                                value={form.documento}
                                                readOnly
                                            />
                                            <label htmlFor="documento">Nro. Documento</label>
                                        </div>
                                    </div>

                                    {/* F. Emisión */}
                                    <div className="col-12 col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="emision"
                                                placeholder="F. de Emisión"
                                                value={form.fecha}
                                                onChange={(e) =>
                                                    setForm((prev) => ({ ...prev, fecha: e.target.value }))
                                                }
                                                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                                            />
                                            <label htmlFor="emision">F. Emisión</label>
                                        </div>
                                    </div>

                                    {/* Cliente */}
                                    <div className="col-12">
                                        <div className="input-group">
                                            <div className="form-floating flex-grow-1">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="cliente"
                                                    placeholder="Cliente"
                                                    value={form.nom_clien}
                                                    readOnly
                                                />
                                                <label htmlFor="cliente">
                                                    Cliente {form.cod_clien ? `( ${form.cod_clien} )` : ""}
                                                </label>
                                            </div>
                                            <button type="button" className="btn btn-outline-secondary" onClick={abrirCliente}>
                                                <i className="fa-solid fa-magnifying-glass"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Vendedor */}
                                    <div className="col-12">
                                        <div className="input-group">
                                            <div className="form-floating flex-grow-1">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="vendedor"
                                                    placeholder="Vendedor"
                                                    value={form.nom_vend || ""}
                                                    readOnly
                                                />
                                                <label htmlFor="vendedor">
                                                    Vendedor {form.cod_vend ? `( ${form.cod_vend} )` : ""}
                                                </label>
                                            </div>
                                            <button type="button" className="btn btn-outline-secondary" onClick={abrirVendedor}>
                                                <i className="fa-solid fa-magnifying-glass"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Motivo de visita */}
                                    <div className="col-12">
                                        <div className="input-group">
                                            <div className="form-floating flex-grow-1">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="visita"
                                                    placeholder="Motivo de visita"
                                                    value={form.nom_motivo || ""}
                                                    readOnly
                                                />
                                                <label htmlFor="visita">Motivo de visita</label>
                                            </div>
                                            <button type="button" className="btn btn-outline-secondary" onClick={abrirMotivo}>
                                                <i className="fa-solid fa-magnifying-glass"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Observaciones */}
                                    <div className="col-12">
                                        <div className="form-floating mb-3">
                                            <textarea
                                                className="form-control text-uppercase"
                                                placeholder="Observaciones"
                                                id="obs"
                                                style={{ height: "100px" }}
                                                maxLength={200}
                                                value={form.obs}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        obs: e.target.value.toLocaleUpperCase("es-PE"),
                                                    }))
                                                }
                                            ></textarea>
                                            <label htmlFor="obs">Observaciones</label>
                                        </div>
                                    </div>

                                    {/* Lista de Productos Evaluados */}
                                    <div className="col-12">
                                        <div className="input-group mb-2">
                                            <button className="btn btn-info" type="button" onClick={abrirProducto}>
                                                <i className="fa-solid fa-plus"></i>
                                            </button>
                                            <span className="input-group-text">Productos Evaluados</span>
                                        </div>

                                        <div className="p-2 rounded ">
                                            <div className="d-flex flex-wrap gap-2">

                                                {form.detalle.length === 0 ? (
                                                    <span className="text-muted">Sin productos aún</span>
                                                ) : (
                                                    form.detalle.map((p) => (
                                                        <span
                                                            key={p.id}
                                                            className="badge rounded-pill text-bg-light border border-dark d-inline-flex align-items-center px-3 py-2"
                                                            title={p.cod_prod}
                                                        >
                                                            <span className="me-2">{p.nom_prod}</span>
                                                            <button
                                                                type="button"
                                                                className="btn-close"
                                                                aria-label={`Eliminar ${p.nom_prod}`}
                                                                onClick={() => eliminarProducto(p.cod_prod)}
                                                            />
                                                        </span>
                                                    ))
                                                )}

                                            </div>
                                        </div>

                                        {/* Si quieres enviar al backend, guarda IDs en un hidden */}
                                        <input
                                            type="hidden"
                                            name="productos_ids"
                                            value={JSON.stringify(form.detalle.map((p) => p.id))}
                                        />

                                    </div>

                                    {/* Acciones */}
                                    <div className="col-12 d-flex gap-2 justify-content-end">
                                        <button type="submit" className="btn btn-primary" disabled={isSaving} >
                                            {isSaving ? "Guardando..." : "Guardar"}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={handleDelete}
                                            disabled={isDeleting || isSaving}
                                            title="Eliminar visita"
                                        >
                                            {isDeleting ? "Eliminando..." : "Eliminar"}
                                        </button>
                                        <button type="reset" className="btn btn-secondary" disabled={isSaving} onClick={() => {
                                            navigate("/visita")
                                        }}>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {/* FIN DETALLE */}
                    </div>
                    {/* FIN CARD */}

                    {/* MODAL: Buscar Cliente */}
                    <FormBCliente
                        show={showCli}
                        onClose={cerrarCliente}
                        onSelect={handleSelectCliente}
                    />

                    <FormBVendedor
                        show={showVend}
                        onClose={cerrarVendedor}
                        onSelect={handleSelectVendedor}
                    />

                    <FormBMotivo
                        show={showMotivo}
                        onClose={cerrarMotivo}
                        onSelect={handleSelectMotivo}
                    />

                    <FormBProducto
                        show={showProducto}
                        onClose={cerrarProducto}
                        onSelect={handleSelectProducto}
                        closeOnSelect={false}
                    />

                </div>
            </div>
        </div>
    );
};

export default FormVisita;
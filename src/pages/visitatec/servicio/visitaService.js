import api from "../../../api/api";

/* ---------- utils ---------- */
function cleanParams(obj) {
    const out = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (typeof v === "string") {
            const t = v.trim();
            if (t !== "") out[k] = t;
        } else {
            out[k] = v;
        }
    });
    return out;
}

function clean(obj) {
    const out = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (typeof v === "string") {
            const t = v.trim();
            if (t !== "") out[k] = t;
        } else {
            out[k] = v;
        }
    });
    return out;
}

function toAAAAMMDD(value) {
    if (!value) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, "0");
        const dd = String(value.getDate()).padStart(2, "0");
        return `${yyyy}${mm}${dd}`;
    }
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [yyyy, mm, dd] = s.split("-");
        return `${yyyy}${mm}${dd}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [dd, mm, yyyy] = s.split("/");
        return `${yyyy}${mm}${dd}`;
    }
    if (/^\d{8}$/.test(s)) return s;
    return "";
}

function _detallesDesdeProductos(productos = []) {
    return (productos || [])
        .map((p) => p?.cod_prod || p?.cod || p?.codigo)
        .filter(Boolean)
        .map((cod) => ({ cod_prod: String(cod).trim() }));
}

function _detallesDesdeDetalles(detalles = []) {
    return (detalles || [])
        .map((d) => d?.cod_prod || d?.cod || d?.codigo)
        .filter(Boolean)
        .map((cod) => ({ cod_prod: String(cod).trim() }));
}

/* ---------- servicios ---------- */

// LISTAR DE VISITAS
export async function listarVisitas({ page = 1, size = 20, q, usrCod } = {}) {
    const qUpper =
        typeof q === "string" ? q.trim().toLocaleUpperCase("es-PE") : q;

    const params = cleanParams({
        page,
        size,
        q: qUpper,
        ...(typeof usrCod === "string" && usrCod.trim()
            ? { usr_cod: usrCod.trim() }
            : {}),
    });

    const { data } = await api.get("api/visitas/grilla", { params });
    return data; // { ok, data: { items, page, pages, total } }
}

// CREAR VISITA (cabecera + detalles)
export async function crearVisitaFull({
    fecha_emision,
    id_tec,
    id_vend,
    id_clien,
    id_motivo,
    obs,
    productos = [],
} = {}) {
    const fecha_dig = toAAAAMMDD(fecha_emision);

    // Detalles: [{ cod_prod }]
    const detalles = (productos || [])
        .map((p) => p?.cod_prod || p?.cod || p?.codigo)
        .filter(Boolean)
        .map((cod) => ({ cod_prod: String(cod).trim() }));

    const body = clean({
        fecha_dig,
        id_tec,
        id_vend,
        id_clien,
        id_motivo,
        obs,
        detalles,
    });

    // Validaciones mínimas (opcional)
    if (!body.fecha_dig) throw new Error("Fecha inválida.");
    if (!body.id_tec) throw new Error("Falta id_tec.");
    if (!body.id_vend) throw new Error("Falta id_vend.");
    if (!body.id_clien) throw new Error("Falta id_clien.");
    if (!body.id_motivo) throw new Error("Falta id_motivo.");
    if (!Array.isArray(body.detalles) || body.detalles.length === 0)
        throw new Error("Debes agregar al menos un producto.");

    const { data } = await api.post("api/visitas/full", body);
    return data; // { ok, data: { id, detalles, correlativo } }
}

// CONSULTAR VISITA
export async function obtenerVisitaPorId(idcab) {
    if (idcab == null) throw new Error("idcab es requerido");
    const { data } = await api.get(`api/visitas/${encodeURIComponent(idcab)}`);
    return data; // mantiene el mismo patrón: { ok, data }
}

// ACTUALIZAR VISITA
export async function actualizarVisitaFull(
    idcab,
    payload = {},
    detallesMode = "omitir"
) {
    if (idcab == null) throw new Error("idcab es requerido");

    const {
        fecha_emision,
        id_tec,
        id_vend,
        id_clien,
        id_motivo,
        obs,
        productos,
        detalles,
    } = payload || {};

    const fecha_dig = toAAAAMMDD(fecha_emision);
    const body = clean({
        ...(fecha_dig ? { fecha_dig } : {}),
        id_tec,
        id_vend,
        id_clien,
        id_motivo,
        obs,
    });

    // Manejo de DETALLES según modo
    if (detallesMode === "vaciar") {
        // explícitamente borrar todos
        body.detalles = [];
    } else if (detallesMode === "reemplazar") {
        // construir nueva lista
        let detallesNormalizados = [];

        if (Array.isArray(productos) && productos.length) {
            detallesNormalizados = _detallesDesdeProductos(productos);
        } else if (Array.isArray(detalles) && detalles.length) {
            detallesNormalizados = _detallesDesdeDetalles(detalles);
        }

        if (!Array.isArray(detallesNormalizados) || detallesNormalizados.length === 0) {
            throw new Error("Para 'reemplazar' debes enviar al menos un producto/detalle.");
        }
        body.detalles = detallesNormalizados;
    }
    // si es "omitir", simplemente no añadimos 'detalles' al body

    const { data } = await api.put(`api/visitas/${encodeURIComponent(idcab)}/full`, body);
    return data;
}

export async function actualizarVisitaCabecera(idcab, cambios = {}) {
    return actualizarVisitaFull(idcab, cambios, "omitir");
}

export async function borrarDetallesVisita(idcab) {
    return actualizarVisitaFull(idcab, {}, "vaciar");
}

export async function reemplazarDetallesVisita(idcab, productosODetalles = [], extrasCabecera = {}) {
    const payload = Array.isArray(productosODetalles)
        ?
        (productosODetalles.length && typeof productosODetalles[0] === "object"
            ? { detalles: productosODetalles, ...extrasCabecera }
            : { productos: productosODetalles, ...extrasCabecera })
        : { ...extrasCabecera };

    return actualizarVisitaFull(idcab, payload, "reemplazar");
}

// ELLIMINAR VISITA
export async function eliminarVisita(idcab) {
    if (idcab == null) throw new Error("idcab es requerido");
    const { data } = await api.delete(`api/visitas/${encodeURIComponent(idcab)}`);
    return data; // { ok, data: { id } }
}
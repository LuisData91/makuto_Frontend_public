import api from '../../../api/api';

// LISTAR DE TÉCNICOS
export async function listarTecnicos({
    q,
    codigo,
    nombre,
    page = 1,
    per_page = 20,
} = {}) {
    const params = new URLSearchParams();
    // if (q) params.set("q", q.trim());
    if (q) params.set("q", q.toLocaleUpperCase('es-PE').trim());
    if (codigo) params.set("codigo", codigo.trim());
    if (nombre) params.set("nombre", nombre.trim());
    params.set("page", page);
    params.set("per_page", per_page);

    const res = await api.get("/tecnico", { params });
    const { content, pagination, message } = res.data;
    return { data: content, pagination, message };
}

// OBTENER REGISTRO POR CODIGO
export async function obtenerTecnico(cod_tec) {
  const res = await api.get(`/tecnico/${encodeURIComponent(cod_tec)}`);
  const { content, message } = res.data;
  return { data: content, message };
}

// CREAR REGISTRO
export async function crearTecnico({ cod_tec, nombre, activo }) {
  const payload = {
    cod_tec: cod_tec?.trim().toUpperCase(),
    nombre: nombre?.trim(),
    // tu backend usa estado "1" (activo) / "2" (inactivo/soft delete)
    estado: activo ? "1" : "2",
  };
  const res = await api.post("/tecnico", payload);
  return { data: res.data.content, message: res.data.message };
}

// ACTUALIZAR REGISTRO
export async function actualizarTecnico(cod_tec, { nombre }) {
  const payload = {
    cod_tec: cod_tec,
    nombre: nombre?.trim(),
  };
  const res = await api.put(
    `/tecnico/${encodeURIComponent(cod_tec)}`,
    payload
  );
  return { data: res.data.content, message: res.data.message };
}

// ELIMINAR REGISTRO
export async function eliminarTecnico(cod_tec) {
  const res = await api.delete(`/tecnico/${encodeURIComponent(cod_tec)}`);
  return { message: res.data.message ?? "Técnico eliminado" };
}
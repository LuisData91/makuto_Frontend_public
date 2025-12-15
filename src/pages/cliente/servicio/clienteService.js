import api from '../../../api/api';

// LISTAR DE CLIENTES
const BASE = "/api/reclamos";

export const ReclamoService = {
  listar: (params = {}) =>
    api.get(BASE, { params }).then((r) => r.data?.items ?? r.data ?? []),

  crear: async (payload) => {
    const { data } = await api.post(BASE, payload);
    console.log("[RECLAMO crear] respuesta:", data);
    return data; // aquí ya viene data.id
  },

  obtener: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),

  actualizar: (id, payload) =>
    api.put(`${BASE}/${id}`, payload).then((r) => r.data),

  subirAdjuntoPorId: async (id, file) => {
    const fd = new FormData();
    fd.append("file", file);

    // 👇 Ruta correcta del backend
    const { data } = await api.post(
      `/api/adjuntos/reclamo/${id}/upload`,
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return data;
  },
};

// LISTAR DE CLIENTES (para modales de búsqueda)
export async function listarClientes({
  q,
  page = 1,
  per_page = 20,
} = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q.toLocaleUpperCase('es-PE').trim());
  params.set("page", page);
  params.set("per_page", per_page);

  // usamos la ruta /cliente/loja
  const res = await api.get("/cliente/loja", { params });
  const { content, pagination, message } = res.data;

  // normalizamos un poco
  const data = (content || []).map((c) => ({
    cli_id: c.cli_id,
    cod: (c.cod || "").trim(),
    nombre: (c.nombre || "").trim(),
    telefono: (c.telefono || "").trim(),
    correo: (c.correo || "").trim(),
    direccion: (c.direccion || "").trim(),
  }));

  return { data, pagination, message };
}


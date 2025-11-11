import api from "../../api/api"; // o { api } si así exportas

const BASE = "/api/solicitud-reclamo";

export const ReclamoService = {
  listar: (params = {}) => api.get(BASE, { params }).then(r => r.data?.items ?? r.data ?? []),
  crear: (payload) => api.post(BASE, payload).then(r => r.data),
  obtener: (id) => api.get(`${BASE}/${id}`).then(r => r.data),
  actualizar: (id, payload) => api.put(`${BASE}/${id}`, payload).then(r => r.data),
  subirAdjunto: (id, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post(`/reclamo/${id}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
};

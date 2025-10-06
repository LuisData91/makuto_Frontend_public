import api from '../../../api/api';

export async function listarTecnicos({
    q,
    codigo,
    nombre,
    page = 1,
    per_page = 20,
} = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q.trim());
    if (codigo) params.set("codigo", codigo.trim());
    if (nombre) params.set("nombre", nombre.trim());
    params.set("page", page);
    params.set("per_page", per_page);

    const res = await api.get("/tecnico", { params });
    const { content, pagination, message } = res.data;
    return { data: content, pagination, message };
}
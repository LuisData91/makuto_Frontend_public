import api from '../../../api/api';

// LISTAR DE MOTIVO
export async function listarMotivos({
    q,
    page = 1,
    per_page = 20,
} = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q.toLocaleUpperCase('es-PE').trim());
    params.set("page", page);
    params.set("per_page", per_page);

    const res = await api.get("/visita", { params });
    const { content, pagination, message } = res.data;
    return { data: content, pagination, message };
}
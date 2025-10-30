import api from '../../../api/api';

// LISTAR DE PRODUCTOS
export async function listarProductos({
    q,
    page = 1,
    per_page = 20,
} = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q.toLocaleUpperCase('es-PE').trim());
    params.set("page", page);
    params.set("per_page", per_page);

    const res = await api.get("/producto", { params });
    const { content, pagination, message } = res.data;
    return { data: content, pagination, message };
}
import api from '../../../api/api';

// LISTAR DE VENDEDORES
export async function listarVendedores({
    q,
    page = 1,
    per_page = 20,
} = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q.toLocaleUpperCase('es-PE').trim());
    params.set("page", page);
    params.set("per_page", per_page);

    const res = await api.get("/vendedor", { params });
    const { content, pagination, message } = res.data;
    return { data: content, pagination, message };
}
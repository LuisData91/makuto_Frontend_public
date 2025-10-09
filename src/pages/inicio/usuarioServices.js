import api from '../../api/api';

export const obtenerUsuarioPorCodigo = async (usr_cod) => {
    try {
        const response = await api.get(`/usuario/${encodeURIComponent(usr_cod)}`);
        return response.data.usuario;
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        throw error;
    }
};
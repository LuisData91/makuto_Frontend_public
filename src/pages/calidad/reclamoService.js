// src/pages/calidad/reclamoService.js
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

export const ReclamoService = {



    async listarAdjuntos(idReclamo) {
      const url = `${API_BASE}/api/adjuntos/reclamo/${idReclamo}`;
      const { data } = await axios.get(url);
      return data;
    },


  // ===================== LISTAR MIS RECLAMOS =====================
  async listarMisReclamos(idUsuario) {
    const url = `${API_BASE}/api/reclamos`;
    const { data } = await axios.get(url, {
      params: { id_usuario_registro: idUsuario },
    });
    return data; // esto ya será el array de reclamos
  },



  // ===================== ACTUALIZAR RECLAMO EXISTENTE =====================
async actualizar(id, payload, skipEmail = false) {
  // si skipEmail es true, agregamos ?skip_email=1
  const qs = skipEmail ? "?skip_email=1" : "";
  const url = `${API_BASE}/api/reclamos/${id}${qs}`;

  const token = localStorage.getItem("token");

  const { data } = await axios.put(url, payload, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  // Normalizamos un poco la respuesta para que FormReclamo la use igual que crear()
  const idNorm = data.id_reclamo ?? data.id ?? data.ID ?? id;

  const documentoNorm = data.documento ?? data.num_doc ?? data.NUM_DOC ?? null;

  return {
    id: idNorm,
    documento: documentoNorm,
    raw: data,
  };
},


  // ===================== CREAR RECLAMO =====================
  async crear(payload) {
    const url = `${API_BASE}/api/reclamos`;

    const token = localStorage.getItem("token");

    const { data } = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Solo consideramos error si el backend explícitamente devuelve ok === false
    if (data && data.ok === false) {
      throw new Error(data.message || "Error al crear reclamo");
    }

    // Normalizamos posibles nombres de campos
    const id =
      data.id_reclamo ??
      data.id ??
      data.ID ??
      null;

    const documento =
      data.documento ??
      data.num_doc ??
      data.NUM_DOC ??
      null;

    if (!id) {
      // Si ni siquiera pudimos inferir un ID, ahí sí lo consideramos error
      throw new Error("No se pudo obtener el ID del reclamo creado");
    }

    return {
      id,
      documento,
      raw: data,
    };
  },

  /**
   * Subir UN adjunto (por compatibilidad, si lo necesitas en otra pantalla).
   * En el flujo actual de FormReclamo se recomienda usar subirAdjuntosMultiples.
   */
  async subirAdjuntoPorId(idReclamo, file) {
    const url = `${API_BASE}/api/adjuntos/reclamo/${idReclamo}/upload`;
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (data && data.ok === false) {
      throw new Error(data.message || "Error al subir adjunto");
    }

    return data;
  },

  /**
   * Subir VARIOS adjuntos en una sola llamada.
   * Usa el endpoint /upload-multiple, que al finalizar dispara 1 solo correo
   * con todos los enlaces de los adjuntos.
   */
  async subirAdjuntosMultiples(idReclamo, files) {
    if (!files || files.length === 0) return null;

    const url = `${API_BASE}/api/adjuntos/reclamo/${idReclamo}/upload-multiple`;
    const formData = new FormData();

    for (const f of files) {
      formData.append("files", f);
    }

    const { data } = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Consideramos error solo si el backend dice ok === false
    // Y además no se subió ningún archivo
    const subidos = data?.subidos || [];
    if (data && data.ok === false && subidos.length === 0) {
      throw new Error(
        data.message || "Error al subir adjuntos (ningún archivo fue subido)"
      );
    }

    return data;
  },

  // ========== CHAT DEL RECLAMO ==========

  // Obtener los mensajes del reclamo
  async listarMensajes(idReclamo) {
      const url = `${API_BASE}/api/reclamos/${idReclamo}/mensajes`;
      const { data } = await axios.get(url);
      return data;
  },

  // Crear mensaje nuevo
  async crearMensaje(idReclamo, payload) {
      const url = `${API_BASE}/api/reclamos/${idReclamo}/mensajes`;
      const { data } = await axios.post(url, payload);
      return data;
  },

  // OBTENER RECLAMO POR ID (para cuando se entra por URL directa)
// OBTENER RECLAMO POR ID (cuando entro desde el correo)
  async obtenerPorId(idReclamo) {
    const url = `${API_BASE}/api/reclamos/id/${idReclamo}`;
    const { data } = await axios.get(url);
    // el backend devolverá el objeto del reclamo directamente
    return data;
  },

  async actualizarEstadoCalidad(id, payload) {
    const url = `${API_BASE}/api/reclamos/${id}/estado-calidad-admin`;

    const token = localStorage.getItem("token");

    const { data } = await axios.put(url, payload, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    });

    return data;
  },




};

 
// src/pages/calidad/formulario/ChatReclamo.jsx

import React, { useEffect, useRef, useState } from "react";
import { ReclamoService } from "../reclamoService";
import "./ChatReclamo.css"; // 👈 IMPORTA LOS ESTILOS DEL CHAT

const obtenerIniciales = (nombre, idUsuario) => {
  if (nombre && nombre.trim()) {
    const partes = nombre.trim().split(/\s+/);
    const iniciales = partes.slice(0, 2).map((p) => p[0].toUpperCase());
    return iniciales.join("");
  }
  return (idUsuario ?? "?").toString().slice(0, 2).toUpperCase();
};

const ChatReclamo = ({ idReclamo, documento, idUsuarioActual }) => {
  const [mensajes, setMensajes] = useState([]);
  const [mensajeNuevo, setMensajeNuevo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const contenedorMensajesRef = useRef(null);

  // Cargar mensajes
  useEffect(() => {
    if (!idReclamo) return;

    const cargarMensajes = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await ReclamoService.listarMensajes(idReclamo);
        setMensajes(data || []);
      } catch (err) {
        console.error("[ChatReclamo] Error al listar mensajes", err);
        setError("No se pudieron cargar los mensajes.");
      } finally {
        setCargando(false);
      }
    };

    cargarMensajes();
  }, [idReclamo]);

  // Scroll al último mensaje
  useEffect(() => {
    if (contenedorMensajesRef.current) {
      contenedorMensajesRef.current.scrollTop =
        contenedorMensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!mensajeNuevo.trim() || !idReclamo || !idUsuarioActual) return;

    setEnviando(true);
    setError(null);

    try {
      const payload = {
        id_usuario: idUsuarioActual,
        mensaje: mensajeNuevo.trim(),
      };

      const data = await ReclamoService.crearMensaje(idReclamo, payload);

      setMensajes((prev) => [...prev, data]);
      setMensajeNuevo("");
    } catch (err) {
      console.error("[ChatReclamo] Error al enviar mensaje", err);
      setError("No se pudo enviar el mensaje porque fue cerrado.");
    } finally {
      setEnviando(false);
    }
  };

  if (!idReclamo) return null;

  return (
    <div className="chat-wrapper mt-4">
      <div className="chat-card-pro shadow-sm">
        {/* HEADER */}
        <div className="chat-header-pro">
          <div className="chat-header-left">
            <div className="chat-icon-circle">
              <i className="fa-regular fa-comments" />
            </div>
            <div>
              <div className="chat-title"> Chat del reclamo <strong>{documento}</strong></div>

              <div className="chat-subtitle">
                {/* Conversación entre Calidad y el vendedor. */}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="chat-body-pro">
          {cargando && (
            <p className="chat-info small mb-2">Cargando mensajes...</p>
          )}
          {error && (
            <p className="chat-error small mb-2">
              {error}
            </p>
          )}

          <div ref={contenedorMensajesRef} className="chat-mensajes-pro">
            {!cargando && mensajes.length === 0 && (
              <div className="chat-empty">
                <i className="fa-regular fa-message mb-2" />
                <p className="mb-0 small">
                  Aún no hay mensajes en este reclamo.
                  <br />
                  Inicia la conversación escribiendo un mensaje abajo.
                </p>
              </div>
            )}

            {mensajes.map((m) => {
              const esMio = m.id_usuario === idUsuarioActual;
              const iniciales = obtenerIniciales(m.nombre_usuario, m.id_usuario);

              return (
                <div
                  key={m.id_mensaje}
                  className={`chat-row ${esMio ? "mine" : "theirs"}`}
                >
                  {/* Avatar */}
                  <div className="chat-avatar">
                    <div className="chat-avatar-circle">
                      <span>{iniciales}</span>
                    </div>
                  </div>

                  {/* Burbuja */}
                  <div
                    className={`chat-burbuja-pro ${
                      esMio ? "bubble-mine" : "bubble-theirs"
                    }`}
                  >
                    <div className="chat-bubble-header">
                      <span className="chat-usuario-pro">
                        {m.nombre_usuario || `Usuario ${m.id_usuario}`}
                      </span>
                      {m.fecha_envio && (
                        <span className="chat-fecha-pro">
                          {new Date(m.fecha_envio).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="chat-texto-pro">{m.mensaje}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* INPUT */}
          <form className="chat-footer-pro" onSubmit={handleEnviar}>
            <div className="chat-input-wrapper">
              <textarea
                className="chat-input-pro form-control"
                rows={2}
                placeholder="Escribe un mensaje..."
                value={mensajeNuevo}
                onChange={(e) => setMensajeNuevo(e.target.value)}
              />
              <button
                type="submit"
                className="chat-btn-enviar btn btn-primary"
                disabled={enviando || !mensajeNuevo.trim()}
              >
                {enviando ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane me-1" />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatReclamo;

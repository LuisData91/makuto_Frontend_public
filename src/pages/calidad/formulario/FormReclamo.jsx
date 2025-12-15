// src/pages/calidad/formulario/FormReclamo.jsx

import ChatReclamo from "./ChatReclamo.jsx";
import React, { useState, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { ReclamoService } from "../reclamoService";
import { GeneralContext } from "../../../context/generalContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import FormBCliente from "../../visitatec/formulario/FormBCliente";
import FormBVendedor from "../../visitatec/formulario/FormBVendedor";
import FormBProducto from "../../visitatec/formulario/FormBProducto";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function FormReclamo() {
  const { usuActual } = useContext(GeneralContext);
  const { id } = useParams(); // /calidad/reclamos/:id
  const location = useLocation();
 
  const reclamoInicial = location.state?.reclamo || null;


  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState({
    fecha_emision: hoy(),
    cod_prod: "",
    nombre_prod: "",
    lote_prod: "",
    cantidad_reclamada: "",
    cliente: "",
    telefono_cliente: "",
    correo_cliente: "",
    direccion_cliente: "",
    fecha_despacho: hoy(),
    tipo_reclamo: "",
    descripcion_reclamo: "",
    nombre_vendedor: usuActual?.usr_nom || "",
    ruta_imagen: "",
  });

  // === Reglas de bloqueo por estado cerrado ===

  // 1) Estado inicial: puede venir de reclamoInicial o del form, con varios nombres o como string
  const estadoInicialRaw = esEdicion
    ? (
        reclamoInicial?.estado ??
        reclamoInicial?.ESTADO ??
        form.estado ??
        form.ESTADO ??
        form.estado_reclamo ??
        1
      )
    : 1;

  const estadoInicial = Number(estadoInicialRaw); // lo normalizamos a número

  // 2) Id del usuario que creó el reclamo (puede venir con distintos nombres)
  const idUsuarioRegistro =
    reclamoInicial?.id_usuario_registro ??
    reclamoInicial?.id_usuario ??
    reclamoInicial?.ID_USUARIO ??
    form.id_usuario_registro ??
    form.id_usuario ??
    form.ID_USUARIO ??
    null;

  // 2 = CERRADO
  const esCerrado = esEdicion && estadoInicial === 2;

  const esCreador =
    esEdicion &&
    idUsuarioRegistro != null &&
    String(idUsuarioRegistro) === String(usuActual?.usr_id);

  // Si el reclamo está cerrado y el usuario es quien lo creó -> no puede editar
  const bloqueadoPorCierre = esCerrado && esCreador;

  

// Gestión de Calidad SIEMPRE bloqueada para el usuario que creó el reclamo (vendedor)
const bloqueadoGestionCalidad = esCreador;

// DEBUG extra (opcional)
console.log({
  estadoInicial,
  estadoInicialRaw,
  esEdicion,
  esCerrado,
  esCreador,
  bloqueadoPorCierre,
  bloqueadoGestionCalidad,
  idUsuarioRegistro,
  usr_id_actual: usuActual?.usr_id,
});

  // ⬅️ A partir de aquí siguen tus useEffect, funciones, JSX, etc.

   
useEffect(() => {
    const cargarReclamoDesdeApi = async () => {
      if (!esEdicion || !id || reclamoInicial) return;

      try {
        const data = await ReclamoService.obtenerPorId(id);
        console.log("[FormReclamo] Cargando reclamo por ID (API):", data);

        if (!data) return;

        setForm(prev => ({
          ...prev,
          fecha_emision: data.fecha_emision?.slice(0, 10) || prev.fecha_emision,
          cod_prod: data.cod_prod || "",
          nombre_prod: data.nombre_prod || "",
          lote_prod: data.lote_prod || "",
          cantidad_reclamada: data.cantidad_reclamada || "",
          cliente: data.cliente || "",
          telefono_cliente: data.telefono_cliente || "",
          correo_cliente: data.correo_cliente || "",
          direccion_cliente: data.direccion_cliente || "",
          fecha_despacho: data.fecha_despacho?.slice(0, 10) || prev.fecha_despacho,
          tipo_reclamo: data.tipo_reclamo || "",
          descripcion_reclamo: data.descripcion_reclamo || "",
          nombre_vendedor: data.nombre_vendedor || "",
          ruta_imagen: data.ruta_imagen || "",
          id_usuario_registro: data.id_usuario_registro || prev.id_usuario_registro,
          documento: data.documento || prev.documento,
        }));

        // === Gestión de Calidad desde API ===
        const estadoRawApi =
          data.estado ??
          data.ESTADO ??
          data.estado_reclamo ??
          1;

        const estadoNumApi = Number(estadoRawApi);

        if (estadoNumApi === 1) {
          setEstadoCalidad("");
        } else {
          setEstadoCalidad(String(estadoNumApi));  // 2 o 3
        }

        setRespuestaCalidad(data.respuesta_calidad ?? "");
      } catch (error) {
        console.error("[FormReclamo] Error al cargar reclamo por ID:", error);
      }
    };

  cargarReclamoDesdeApi();
}, [esEdicion, id, reclamoInicial]);



  const [showCli, setShowCli] = useState(false);
  const [showVend, setShowVend] = useState(false);
  const [showProd, setShowProd] = useState(false);
  const [saving, setSaving] = useState(false);

  // === Estado Calidad (solo para edición) ===
  const [estadoCalidad, setEstadoCalidad] = useState("");
  const [respuestaCalidad, setRespuestaCalidad] = useState("");

  useEffect(() => {
    if (reclamoInicial) {
      // Tomamos el estado desde el reclamo (aceptamos varias posibles claves)
      const estadoRaw =
        reclamoInicial.estado ??
        reclamoInicial.ESTADO ??
        reclamoInicial.estado_reclamo ??
        1; // valor por defecto (CREADO)

      const estadoNum = Number(estadoRaw);

      // Si el estado es 1 = CREADO → no debe mostrarse en el combo
      if (estadoNum === 1) {
        setEstadoCalidad(""); // deja "-- Seleccionar --"
      } else {
        // Si es 2 o 3 → convertirlo a string para select
        setEstadoCalidad(String(estadoNum));
      }

      // Respuesta de calidad
      setRespuestaCalidad(reclamoInicial.respuesta_calidad ?? "");
    }
  }, [reclamoInicial]);





  // Adjuntos nuevos
  const [pendingFiles, setPendingFiles] = useState([]);
  // Adjuntos existentes (por ahora vacío, luego lo puedes poblar desde backend)
  const [adjuntosExistentes, setAdjuntosExistentes] = useState([]);

  // =============== CARGAR DATOS CUANDO ES EDICIÓN ==================
useEffect(() => {
  if (!esEdicion) return;

  if (!reclamoInicial) {
    console.warn(
      "[FormReclamo] No llegó reclamoInicial por location.state, se queda en blanco."
    );
    return;
  }

  console.log("[FormReclamo] Cargando reclamoInicial:", reclamoInicial);

  setForm({
    fecha_emision: reclamoInicial.fecha_emision?.slice(0, 10) || hoy(),
    cod_prod: reclamoInicial.cod_prod || "",
    nombre_prod: reclamoInicial.nombre_prod || "",
    lote_prod: reclamoInicial.lote_prod || "",
    cantidad_reclamada: reclamoInicial.cantidad_reclamada ?? "",
    cliente: reclamoInicial.cliente || "",
    telefono_cliente: reclamoInicial.telefono_cliente || "",
    correo_cliente: reclamoInicial.correo_cliente || "",
    direccion_cliente: reclamoInicial.direccion_cliente || "",
    fecha_despacho: reclamoInicial.fecha_despacho?.slice(0, 10) || hoy(),
    tipo_reclamo: reclamoInicial.tipo_reclamo || "",
    descripcion_reclamo: reclamoInicial.descripcion_reclamo || "",
    nombre_vendedor: reclamoInicial.nombre_vendedor || "",
    ruta_imagen: reclamoInicial.ruta_imagen || "",
  });

  setAdjuntosExistentes([]);
      }, [esEdicion, reclamoInicial]);

      useEffect(() => {
        if (!esEdicion) return;

        const cargarAdjuntos = async () => {
          try {
            const adjuntos = await ReclamoService.listarAdjuntos(id);
            console.log("[FormReclamo] Adjuntos cargados:", adjuntos);
            setAdjuntosExistentes(adjuntos || []);
          } catch (err) {
            console.warn("[FormReclamo] No se pudieron cargar adjuntos:", err);
            setAdjuntosExistentes([]);
          }
        };

        cargarAdjuntos();
      }, [esEdicion, id]);

  useEffect(() => {
    if (!esEdicion) return;

    const cargarAdjuntos = async () => {
      try {
        const adjuntos = await ReclamoService.listarAdjuntos(id);
        console.log("[FormReclamo] Adjuntos cargados:", adjuntos);
        setAdjuntosExistentes(adjuntos || []);
      } catch (err) {
        console.warn("[FormReclamo] No se pudieron cargar adjuntos:", err);
        setAdjuntosExistentes([]);
      }
    };

    cargarAdjuntos();
  }, [esEdicion, id]);

  // TRAE DATOS  AL FORMULARIO
        
      useEffect(() => {
        const cargarReclamo = async () => {
          if (!id) return;
          if (reclamoInicial) return; // ya viene de la tabla

          try {
            const data = await ReclamoService.obtener(id); // 👈 Necesitamos este endpoint
            setForm((prev) => ({
              ...prev,
              ...data
            }));
          } catch (error) {
            console.error("Error cargando reclamo:", error);
          }
        };

        cargarReclamo();
      }, [id]);


  // TRAE LOS ENLACES ADJUNTOS

    useEffect(() => {
      if (!esEdicion) return;

      const cargarAdjuntos = async () => {
        try {
          const adjuntos = await ReclamoService.listarAdjuntos(id);
          console.log("[FormReclamo] Adjuntos cargados:", adjuntos);
          setAdjuntosExistentes(adjuntos || []);
        } catch (err) {
          console.warn("[FormReclamo] No se pudieron cargar adjuntos:", err);
          setAdjuntosExistentes([]);
        }
      };

      cargarAdjuntos();
    }, [esEdicion, id]);




  // =============== MANEJO DE FORM ==================
  const update = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.value,
    }));

  const onSelectCliente = (cli) => {
    setForm((p) => ({
      ...p,
      cliente: cli?.nombre || "",
      telefono_cliente: cli?.telefono || "",
      correo_cliente: cli?.correo || "",
      direccion_cliente: cli?.direccion || "",
    }));
    setShowCli(false);
  };

  const onSelectVendedor = (v) => {
    setForm((p) => ({
      ...p,
      nombre_vendedor: v?.nombre || "",
    }));
    setShowVend(false);
  };

  const onSelectProducto = (prod) => {
    setForm((p) => ({
      ...p,
      cod_prod: prod?.cod || "",
      nombre_prod: prod?.nombre || "",
    }));
    setShowProd(false);
  };

  // =============== ARCHIVOS ==================
  const removeFile = (indexToRemove) => {
    setPendingFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const onFiles = (e) => {
    const newFiles = Array.from(e.target.files || []);

    setPendingFiles((prev) => {
      const combined = [...prev];
      newFiles.forEach((newFile) => {
        const exists = prev.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size &&
            existingFile.type === newFile.type
        );
        if (!exists) {
          combined.push(newFile);
        }
      });
      return combined;
    });

    e.target.value = "";
  };

  const resetForm = () => {
    setForm({
      fecha_emision: hoy(),
      cod_prod: "",
      nombre_prod: "",
      lote_prod: "",
      cantidad_reclamada: "",
      cliente: "",
      telefono_cliente: "",
      correo_cliente: "",
      direccion_cliente: "",
      fecha_despacho: hoy(),
      tipo_reclamo: "",
      descripcion_reclamo: "",
      nombre_vendedor: "",
      ruta_imagen: "",
    });
    setPendingFiles([]);
    setAdjuntosExistentes([]);
  };

  // =============== SUBMIT (CREAR / ACTUALIZAR) ==================
          const onSubmit = async (e) => {
            e.preventDefault();

             if (bloqueadoPorCierre) {
                  Swal.fire(
                    "Reclamo cerrado",
                    "Este reclamo está cerrado y no puede ser modificado por el usuario que lo creó.",
                    "warning"
                  );
                  return;
                }

            // ==== VALIDACIONES BÁSICAS (deja las tuyas, estas son ejemplo) ====
            if (!form.cod_prod)
              return Swal.fire("Falta", "Selecciona un producto.", "warning");
            if (!form.nombre_prod)
              return Swal.fire("Falta", "Falta nombre de producto.", "warning");
            if (!form.lote_prod)
              return Swal.fire("Falta", "Ingresa lote.", "warning");
            if (!form.cantidad_reclamada)
              return Swal.fire("Falta", "Ingresa cantidad reclamada.", "warning");
            if (!form.cliente)
              return Swal.fire("Falta", "Selecciona un cliente.", "warning");
            if (!form.fecha_emision)
              return Swal.fire("Falta", "Ingresa fecha de emisión.", "warning");
            if (!form.fecha_despacho)
              return Swal.fire("Falta", "Ingresa fecha de despacho.", "warning");
            if (!form.tipo_reclamo)
              return Swal.fire("Falta", "Selecciona tipo de reclamo.", "warning");
            if (!form.descripcion_reclamo)
              return Swal.fire("Falta", "Ingresa la descripción del reclamo.", "warning");
            if (!form.nombre_vendedor)
              return Swal.fire("Falta", "Selecciona el vendedor.", "warning");

            setSaving(true);

            try {
              // ====== ARMAR PAYLOAD ======
              const payload = {
                fecha_emision: form.fecha_emision,
                cod_prod: form.cod_prod.trim(),
                nombre_prod: form.nombre_prod.trim(),
                lote_prod: form.lote_prod.trim(),
                cantidad_reclamada: Number(form.cantidad_reclamada || 0),
                cliente: form.cliente.trim(),
                telefono_cliente: (form.telefono_cliente || "").trim(),
                correo_cliente: (form.correo_cliente || "").trim(),
                direccion_cliente: (form.direccion_cliente || "").trim(),
                fecha_despacho: form.fecha_despacho,
                tipo_reclamo: form.tipo_reclamo,
                descripcion_reclamo: form.descripcion_reclamo.trim(),
                nombre_vendedor: form.nombre_vendedor.trim(),
                ruta_imagen: form.ruta_imagen ?? "",
              };

              // 👉 SOLO en creación enviamos id_usuario_registro
              if (!esEdicion) {
                payload.id_usuario_registro = usuActual?.usr_id;
              }

              if (esEdicion) {
                payload.id_usuario_actual = usuActual?.usr_id;
}

              let reclamoResult = null;
              let idReclamo = esEdicion ? id : null;
              let documento = null;

              // 👉 aquí detectamos si hay adjuntos nuevos
              const tieneAdjuntosNuevos = pendingFiles && pendingFiles.length > 0;

              if (esEdicion) {
                // ====== EDITAR ======
                // skipEmail = true SOLO si hay adjuntos nuevos
                reclamoResult = await ReclamoService.actualizar(
                  id,
                  payload,
                  tieneAdjuntosNuevos
                );

                // si el backend devuelve algo, lo usamos; si no, usamos el id de la URL
                if (reclamoResult) {
                  idReclamo = reclamoResult.id ?? id;
                  documento =
                    reclamoResult.documento ||
                    reclamoInicial?.documento ||
                    `REC-${idReclamo}`;
                } else {
                  documento = reclamoInicial?.documento || `REC-${idReclamo}`;
                }
              } else {
                // ====== CREAR ======
                reclamoResult = await ReclamoService.crear(payload);

                idReclamo = reclamoResult.id;
                documento = reclamoResult.documento || `REC-${idReclamo}`;
              }

              // ====== SUBIR ADJUNTOS (si hay) ======
              if (tieneAdjuntosNuevos) {
                try {
                  await ReclamoService.subirAdjuntosMultiples(idReclamo, pendingFiles);
                } catch (fileError) {
                  console.error(
                    "[FormReclamo] Error subiendo adjuntos múltiples:",
                    fileError
                  );
                  toast.warn(
                    "El reclamo se guardó, pero hubo problemas al subir algunos adjuntos."
                  );
                }
              }
          // ====== MENSAJE FINAL ======
          Swal.fire({
            title: esEdicion ? "¡Reclamo actualizado!" : "¡Reclamo registrado!",
            html: `Se ${
              esEdicion ? "actualizó" : "generó"
            } el reclamo <strong>${documento}</strong> correctamente.`,
            icon: "success",
            confirmButtonText: "Aceptar",
          }).then(() => {
            navigate("/calidad/reclamos");
          });
        } catch (err) {
          console.error("[FormReclamo] Error:", err);

          const data = err?.response?.data;
          const detalle = data?.errors
            ? JSON.stringify(data.errors)
            : data?.detail || data?.message || "";

          Swal.fire(
            "Error",
            detalle || "No se pudo completar la operación",
            "error"
          );
        } finally {
          setSaving(false);
        }
      };

      const guardarEstadoCalidad = async () => {
        if (!estadoCalidad) {
          return Swal.fire("Falta", "Selecciona un estado.", "warning");
        }

        try {
          await ReclamoService.actualizarEstadoCalidad(id, {
            estado: estadoCalidad,
            respuesta_calidad: respuestaCalidad,
            id_usuario_calidad: usuActual?.usr_id, // recno (101,112)
          });

          Swal.fire("Éxito", "El estado fue actualizado correctamente.", "success");

        } catch (error) {
          console.error("Error al actualizar estado:", error);
          Swal.fire("Error", "No cuentas con permisos para cerrar el caso", "error");
        }
      };



  // =============== RENDER ==================
  return (
    <div className="container my-4">
      <div className="card shadow-sm border-0">
        <div
          className="card-header text-white d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#252850" }}
        >
          <div>
            <h4 className="mb-0 d-flex align-items-center gap-2">
              <i className="fa-solid fa-clipboard-check" />
              <span>
                {esEdicion ? "Edición de Reclamo" : "Registro de Reclamos"}
              </span>
            </h4>
            <small className="d-block">
              {esEdicion
                ? "Modifica la información del reclamo y gestiona las evidencias."
                : "Completa la información del reclamo y adjunta evidencias."}
            </small>
          </div>
          <span className="badge bg-light" style={{ color: "#252850" }}>
            <i className="fa-solid fa-circle-info me-1" />
            Calidad
          </span>
        </div>

        <div className="card-body">
          <form onSubmit={onSubmit} className="row g-3">
            {/* DATOS DEL PRODUCTO */}
            <div className="col-12">
              <h6 className="text-muted text-uppercase small mb-2 d-flex align-items-center gap-2">
                <i className="fa-solid fa-box-open text-secondary" />
                <span>Datos del producto</span>
                <span className="flex-grow-1 border-bottom" />
              </h6>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold">Fecha Emisión</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={form.fecha_emision}
                onChange={update("fecha_emision")}
                disabled={bloqueadoPorCierre}
                
              />
            </div>

            <div className="col-12 col-md-5">
              <label className="form-label small fw-semibold">Producto</label>
              <div className="input-group input-group-sm">
                <input
                  className="form-control"
                  readOnly
                  value={form.nombre_prod}
                  placeholder="Nombre de producto"
                />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowProd(true)}
                            title="Buscar producto"
                            disabled={bloqueadoPorCierre}
                          >
             <i className="fa-solid fa-magnifying-glass" />
                </button>
              </div>
              <small className="text-muted d-block mt-1">
                Código: <strong>{form.cod_prod || "-"}</strong>
              </small>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold">Lote</label>
              <input
                className="form-control form-control-sm"
                value={form.lote_prod}
                onChange={update("lote_prod")}
                placeholder="Lote"
                disabled={bloqueadoPorCierre}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold">
                Cantidad reclamada
              </label>
              <input
                type="number"
                className="form-control form-control-sm"
                min="0"
                step="1"
                value={form.cantidad_reclamada}
                onChange={update("cantidad_reclamada")}
                disabled={bloqueadoPorCierre}
              />
            </div>

            {/* DATOS DEL CLIENTE */}
            <div className="col-12 mt-2">
              <h6 className="text-muted text-uppercase small mb-2 d-flex align-items-center gap-2">
                <i className="fa-solid fa-user-group text-secondary" />
                <span>Datos del cliente</span>
                <span className="flex-grow-1 border-bottom" />
              </h6>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Cliente</label>
              <div className="input-group input-group-sm">
                <input
                  className="form-control"
                  readOnly
                  value={form.cliente}
                  placeholder="Razón social"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowCli(true)}
                  title="Buscar cliente"
                   disabled={bloqueadoPorCierre}
                >
                  <i className="fa-solid fa-magnifying-glass" />
                </button>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Teléfono</label>
              <input
                className="form-control form-control-sm"
                value={form.telefono_cliente}
                onChange={update("telefono_cliente")}
                placeholder="Teléfono"
                disabled={bloqueadoPorCierre}
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Correo</label>
              <input
                type="email"
                className="form-control form-control-sm"
                value={form.correo_cliente}
                onChange={update("correo_cliente")}
                placeholder="Correo electrónico"
                disabled={bloqueadoPorCierre}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Dirección</label>
              <input
                className="form-control form-control-sm"
                value={form.direccion_cliente}
                onChange={update("direccion_cliente")}
                placeholder="Dirección completa"
                disabled={bloqueadoPorCierre}
              />
            </div>

            {/* INFORMACIÓN DEL RECLAMO */}
            <div className="col-12 mt-2">
              <h6 className="text-muted text-uppercase small mb-2 d-flex align-items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation text-secondary" />
                <span>Información del reclamo</span>
                <span className="flex-grow-1 border-bottom" />
              </h6>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold">Fecha Despacho</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={form.fecha_despacho}
                onChange={update("fecha_despacho")}
                disabled={bloqueadoPorCierre}
              />
            </div>

            <div className="col-12 col-md-5">
              <label className="form-label small fw-semibold">Tipo de reclamo</label>
              <select
                className="form-select form-select-sm"
                value={form.tipo_reclamo}
                onChange={update("tipo_reclamo")}
                disabled={bloqueadoPorCierre}
              >
                <option value="">-- Selecciona --</option>
                <option value="Calidad de envase">Calidad de envase</option>
                <option value="Inocuidad de producto">
                  Inocuidad de producto (contaminación)
                </option>
                <option value="Calidad de producto">Calidad de producto</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">
                Nombre del vendedor
              </label>
              <div className="input-group input-group-sm">
                <input
                  className="form-control"
                  readOnly
                  value={form.nombre_vendedor}
                  placeholder="Nombre vendedor"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowVend(true)}
                  title="Buscar vendedor"
                  disabled={bloqueadoPorCierre}
                >
                  <i className="fa-solid fa-magnifying-glass" />
                </button>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">
                Descripción del reclamo
              </label>
              <textarea
                className="form-control form-control-sm"
                rows={4}
                value={form.descripcion_reclamo}
                onChange={update("descripcion_reclamo")}
                placeholder="Detalle claramente el problema, situación presentada, condiciones, etc."
                disabled={bloqueadoPorCierre}
              />
            </div>

            {/* ADJUNTOS EXISTENTES */}
                  {esEdicion && (
                    <div className="col-12 mt-2">
                      <h6 className="text-muted text-uppercase small mb-2 d-flex align-items-center gap-2">
                        <i className="fa-solid fa-paperclip text-secondary" />
                        <span>Adjuntos</span>
                      </h6>

                      {adjuntosExistentes?.length > 0 ? (
                        <ul className="mb-0">
                          {adjuntosExistentes.map((a, idx) => (
                            <li key={a.id_adjunto ?? a.id ?? idx}>
                              <a
                                href={a.ruta_imagen}   // 👈 el enlace correcto
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#0d6efd", textDecoration: "underline" }}
                              >
                                {`Adjunto ${idx + 1}`}   {/* 👈 texto visible */}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <small className="text-muted">
                          Este reclamo no tiene adjuntos registrados.
                        </small>
                      )}
                    </div>
                  )}


            {/* ADJUNTAR EVIDENCIAS */}
            <div className="col-12 mt-2">
              <h6 className="text-muted text-uppercase small mb-2 d-flex align-items-center gap-2">
                <i className="fa-solid fa-paperclip text-secondary" />
                <span>Adjuntar evidencias</span>
                <span className="flex-grow-1 border-bottom" />
              </h6>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">
                Imágenes / archivos (múltiples)
              </label>
              <input
                type="file"
                className="form-control form-control-sm"
                multiple
                onChange={onFiles}
                disabled={bloqueadoPorCierre}
              />
              <small className="text-muted d-block mt-1">
                Puedes seleccionar varias imágenes o documentos a la vez.
              </small>

              {pendingFiles.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-2">
                    Seleccionados: {pendingFiles.length}
                  </small>
                  <div className="d-flex flex-wrap gap-2">
                    {pendingFiles.map((file, index) => (
                      <div key={index} className="position-relative">
                        <div
                          className="card border-0 shadow-sm p-2"
                          style={{ width: "130px", cursor: "pointer" }}
                          onClick={() => {
                            if (file.type.startsWith("image/")) {
                              const imageUrl = URL.createObjectURL(file);
                              Swal.fire({
                                title: file.name,
                                imageUrl: imageUrl,
                                imageAlt: file.name,
                                showCloseButton: true,
                                showConfirmButton: false,
                                willClose: () => URL.revokeObjectURL(imageUrl),
                              });
                            } else {
                              Swal.fire({
                                title: "Archivo",
                                html: `
                                  <p><strong>Nombre:</strong> ${file.name}</p>
                                  <p><strong>Tipo:</strong> ${
                                    file.type || "Desconocido"
                                  }</p>
                                  <p><strong>Tamaño:</strong> ${(
                                    file.size / 1024
                                  ).toFixed(2)} KB</p>
                                `,
                                icon: "info",
                              });
                            }
                          }}
                        >
                          <div className="text-center mb-2">
                            {file.type.startsWith("image/") ? (
                              <i className="fa-solid fa-image fa-2x text-primary"></i>
                            ) : file.type.includes("pdf") ? (
                              <i className="fa-solid fa-file-pdf fa-2x text-danger"></i>
                            ) : file.type.includes("word") ||
                              file.type.includes("document") ? (
                              <i className="fa-solid fa-file-word fa-2x text-primary"></i>
                            ) : (
                              <i className="fa-solid fa-file fa-2x text-secondary"></i>
                            )}
                          </div>
                          <small
                            className="d-block text-center text-truncate"
                            title={file.name}
                          >
                            {file.name.length > 18
                              ? file.name.substring(0, 15) + "..."
                              : file.name}
                          </small>
                          <small className="d-block text-center text-muted">
                            {(file.size / 1024).toFixed(1)} KB
                          </small>
                        </div>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                          style={{ transform: "translate(30%, -30%)" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          title="Eliminar archivo"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BOTONES */}
            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/calidad/reclamos")}
                disabled={saving}
              >
                <i className="fa-solid fa-arrow-left me-1" />
                Cancelar
              </button>


             <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || bloqueadoPorCierre}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save me-1" />
                      Guardar
                    </>
                  )}
                </button>



            </div>
          </form>
        </div>
      </div>
{/* BLOQUE PARA CAMBIAR ESTADO */}
              {esEdicion && (
          <div className="card mt-4 shadow-sm">
            <div className="card-header" style={{ background: "#f5f5f5" }}>
              <h6 className="mb-0">
                <i className="fa-solid fa-clipboard-check me-2"></i>
                Gestión de Calidad
              </h6>
            </div>

            <div className="card-body">

              <div className="mb-3">
                <label className="form-label fw-semibold">Estado de Calidad</label>
                <select
                  className="form-select form-select-sm"
                  value={estadoCalidad}
                  onChange={(e) => setEstadoCalidad(e.target.value)}
                  disabled={bloqueadoGestionCalidad}   //  Vendedor no puede editar
                >

                  <option value="">-- Seleccionar --</option>
                  <option value="3">En proceso</option>
                  <option value="2">Cerrado</option>
                  
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Respuesta del área de calidad</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  value={respuestaCalidad}
                  onChange={(e) => setRespuestaCalidad(e.target.value)}
                  placeholder="Describe la evaluación o acción tomada"
                  disabled={bloqueadoGestionCalidad} 
                ></textarea>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={guardarEstadoCalidad}
                disabled={bloqueadoGestionCalidad}
              >
                <i className="fa-solid fa-save me-1"></i>
                Guardar estado
              </button>
            </div>
          </div>
        )}








           {/* CHAT DEL RECLAMO */}
      {esEdicion && id && usuActual?.usr_id && (
        <div className="mt-4">
         <ChatReclamo
            idReclamo={id}
            documento={reclamoInicial?.documento}
            idUsuarioActual={usuActual.usr_id}
          />

        </div>
      )}     


      {/* MODALES */}
      <FormBCliente
        show={showCli}
        onClose={() => setShowCli(false)}
        onSelect={onSelectCliente}
      />
      <FormBVendedor
        show={showVend}
        onClose={() => setShowVend(false)}
        onSelect={onSelectVendedor}
      />
      <FormBProducto
        show={showProd}
        onClose={() => setShowProd(false)}
        onSelect={onSelectProducto}
      />
    </div>
  );
}

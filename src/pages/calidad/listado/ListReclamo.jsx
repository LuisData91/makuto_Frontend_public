import React, { useContext, useEffect, useMemo, useState } from "react";
import { GeneralContext } from "../../../context/generalContext";
import { ReclamoService } from "../reclamoService";
import { useNavigate } from "react-router-dom";

// OJO: estilos reales en Excel
import * as XLSX from "xlsx-js-style";

/* ===================== HELPERS ===================== */
function fmtDateShort(iso) {
  if (!iso) return "-";
  const [yyyy, mm, dd] = String(iso).slice(0, 10).split("-");
  return `${dd}-${mm}-${yyyy.slice(2)}`; // dd-mm-yy
}

function toNombrePropio(str) {
  if (!str) return "-";

  const smallWords = new Set([
    "de", "del", "la", "las", "el", "los", "y", "o", "u",
    "a", "al", "en", "con", "por", "para", "sin"
  ]);

  const s = String(str).trim().replace(/\s+/g, " ").toLowerCase();

  return s
    .split(" ")
    .map((w, i) => {
      if (i > 0 && smallWords.has(w)) return w;

      // mantiene abreviaturas comunes
      const up = w.toUpperCase();
      if (["S.A.C.", "S.A.", "S.R.L.", "E.I.R.L."].includes(up)) return up;

      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

// 1 = Creado | 3 = En proceso | 2 = Cerrado
function getEstadoMeta(estadoRaw) {
  const v = String(estadoRaw ?? "").trim();
  if (v === "1") return { dot: "bg-primary", text: "Creado" };
  if (v === "3") return { dot: "bg-warning", text: "En proceso" };
  if (v === "2") return { dot: "bg-success", text: "Cerrado" };
  return { dot: "bg-secondary", text: "Desconocido" };
}

const Dot = ({ colorClass, title }) => (
  <span
    className={`d-inline-block rounded-circle ${colorClass}`}
    style={{ width: 10, height: 10 }}
    title={title}
  />
);

/* ===================== EXPORT EXCEL (DEBE ESTAR DEFINIDA AQUÍ) ===================== */
function exportarReclamosExcel(reclamos, { fechaDesde, fechaHasta } = {}) {
  if (!reclamos || reclamos.length === 0) return;

  const now = new Date();
  const fechaDesc = now.toLocaleDateString("es-PE");
  const horaDesc = now.toLocaleTimeString("es-PE");

  const titulo = "REPORTE DE RECLAMOS";
  const subtitulo1 = `Fecha de descarga: ${fechaDesc} ${horaDesc}`;
  const subtitulo2 = `Total reclamos: ${reclamos.length}`;
  const subtitulo3 =
    fechaDesde || fechaHasta
      ? `Filtro fechas: ${fechaDesde || "—"}  a  ${fechaHasta || "—"}`
      : "Filtro fechas: —";

  // Datos
  const rows = reclamos.map((r, idx) => ({
    "#": idx + 1,
    Documento: r.documento ?? "",
    Vendedor: toNombrePropio(r.nombre_vendedor ?? r.vendedor ?? r.NOMBRE_VENDEDOR ?? r.VENDEDOR),
    Fecha: fmtDateShort(r.fecha_emision),
    Cliente: toNombrePropio(r.cliente),
    Producto: toNombrePropio(r.nombre_prod),
    Tipo: toNombrePropio(r.tipo_reclamo),
    Estado:
      String(r.estado ?? r.ESTADO) === "1"
        ? "Creado"
        : String(r.estado ?? r.ESTADO) === "3"
        ? "En proceso"
        : String(r.estado ?? r.ESTADO) === "2"
        ? "Cerrado"
        : "Desconocido",
  }));

  // Hoja
  const ws = XLSX.utils.json_to_sheet(rows, { origin: "A6" });

  // Títulos arriba
  XLSX.utils.sheet_add_aoa(
    ws,
    [[titulo], [subtitulo1], [subtitulo2], [subtitulo3], []],
    { origin: "A1" }
  );

  // Anchos
  ws["!cols"] = [
    { wch: 5 },  // #
    { wch: 14 }, // Documento
    { wch: 26 }, // Vendedor
    { wch: 10 }, // Fecha
    { wch: 40 }, // Cliente
    { wch: 45 }, // Producto
    { wch: 20 }, // Tipo
    { wch: 12 }, // Estado
  ];

  // Estilos (cabecera + bordes)
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const headerRow = 5; // A6 es cabecera (index 5 en 0-based)

  const border = {
    top: { style: "thin", color: { rgb: "D0D0D0" } },
    bottom: { style: "thin", color: { rgb: "D0D0D0" } },
    left: { style: "thin", color: { rgb: "D0D0D0" } },
    right: { style: "thin", color: { rgb: "D0D0D0" } },
  };

  // Estilo títulos
  const titleStyle = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: "left", vertical: "center" },
  };
  const subtitleStyle = {
    font: { sz: 10, color: { rgb: "555555" } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  // Aplica estilos a títulos
  ["A1", "A2", "A3", "A4"].forEach((addr, i) => {
    if (!ws[addr]) return;
    ws[addr].s = i === 0 ? titleStyle : subtitleStyle;
  });

  // Merge título (A1:H1) y subtítulos (A2:H2, etc.)
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
  ];

  // Estilo cabecera
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "1F4E79" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border,
  };

  // Estilo celdas
  const cellStyle = {
    font: { sz: 10 },
    alignment: { vertical: "top", wrapText: true },
    border,
  };

  // Recorre celdas y aplica estilos
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;

      if (R === headerRow) {
        ws[addr].s = headerStyle;
      } else if (R > headerRow) {
        ws[addr].s = cellStyle;
      }
    }
  }

  // Congelar panel en fila cabecera (después de títulos)
  ws["!freeze"] = { xSplit: 0, ySplit: 6 };

  // Libro + descarga
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reclamos");

  const fileName = `reclamos_${now.toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/* ===================== COMPONENT ===================== */
export default function ListaReclamos() {
  const { usuActual } = useContext(GeneralContext);
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError("");

        if (!usuActual?.usr_id) return;

        const data = await ReclamoService.listarMisReclamos(usuActual.usr_id);
        setReclamos(data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los reclamos");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [usuActual]);

  const handleEditar = (reclamo) => {
    navigate(`/calidad/reclamos/${reclamo.id}`, { state: { reclamo } });
  };

  const reclamosFiltrados = useMemo(() => {
    const query = q.trim().toLowerCase();
    const dDesde = desde ? new Date(desde + "T00:00:00") : null;
    const dHasta = hasta ? new Date(hasta + "T23:59:59") : null;

    return (reclamos || []).filter((r) => {
      const matchTexto =
        !query ||
        String(r.documento ?? "").toLowerCase().includes(query) ||
        String(r.nombre_vendedor ?? r.vendedor ?? "").toLowerCase().includes(query) ||
        String(r.cliente ?? "").toLowerCase().includes(query) ||
        String(r.tipo_reclamo ?? "").toLowerCase().includes(query);

      if (!matchTexto) return false;

      if (!dDesde && !dHasta) return true;
      if (!r.fecha_emision) return false;

      const f = new Date(String(r.fecha_emision).slice(0, 10) + "T12:00:00");
      return (!dDesde || f >= dDesde) && (!dHasta || f <= dHasta);
    });
  }, [reclamos, q, desde, hasta]);

  if (loading) return <div className="container mt-4">Cargando...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4" style={{ fontSize: "0.82rem" }}>
      <h5 className="mb-2">Mis reclamos</h5>

      <div className="sticky-top bg-white" style={{ zIndex: 1030 }}>
        <div className="d-flex gap-3 align-items-center mb-2">
          <span className="d-flex align-items-center gap-1 text-muted">
            <Dot colorClass="bg-primary" /> Creado
          </span>
          <span className="d-flex align-items-center gap-1 text-muted">
            <Dot colorClass="bg-warning" /> En proceso
          </span>
          <span className="d-flex align-items-center gap-1 text-muted">
            <Dot colorClass="bg-success" /> Cerrado
          </span>

          <span className="ms-auto text-muted">
            Mostrando {reclamosFiltrados.length} de {reclamos.length}
          </span>
        </div>

        <div className="d-flex flex-column flex-md-row gap-2 mb-2">
          <div className="input-group input-group-sm">
            <span className="input-group-text">
              <i className="fa fa-search" />
            </span>
            <input
              className="form-control"
              placeholder="Buscar por documento, vendedor, cliente o tipo"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="input-group input-group-sm">
            <span className="input-group-text">
              <i className="fa fa-calendar" />
            </span>
            <input type="date" className="form-control" value={desde} onChange={(e) => setDesde(e.target.value)} />
            <input type="date" className="form-control" value={hasta} onChange={(e) => setHasta(e.target.value)} />

            {/* BOTÓN EXCEL */}
            <button
              className="btn btn-outline-success"
              title="Descargar Excel"
              onClick={() =>
                exportarReclamosExcel(reclamosFiltrados, {
                  fechaDesde: desde || null,
                  fechaHasta: hasta || null,
                })
              }
            >
              <i className="fa-solid fa-file-excel" />
            </button>
          </div>
        </div>

        <div className="border-bottom mb-2" />
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="d-none d-sm-table-cell">#</th>
                <th className="text-nowrap">Documento</th>
                <th>Cliente</th>
                <th className="text-nowrap">Fecha</th>
                <th className="d-none d-md-table-cell">Vendedor</th>
                <th className="d-none d-xl-table-cell">Producto</th>
                <th className="d-none d-xxl-table-cell">Tipo</th>
                <th className="text-center" style={{ width: 40 }}></th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {reclamosFiltrados.map((r, idx) => {
                const meta = getEstadoMeta(r.estado ?? r.ESTADO);
                return (
                  <tr key={r.id}>
                    <td className="d-none d-sm-table-cell">{idx + 1}</td>
                    <td className="text-nowrap">{r.documento}</td>
                    <td>{toNombrePropio(r.cliente)}</td>
                    <td className="text-nowrap">{fmtDateShort(r.fecha_emision)}</td>

                    <td className="d-none d-md-table-cell">
                      {toNombrePropio(r.nombre_vendedor ?? r.vendedor)}
                    </td>

                    <td className="d-none d-xl-table-cell">
                      {toNombrePropio(r.nombre_prod)}
                    </td>

                    <td className="d-none d-xxl-table-cell">
                      {toNombrePropio(r.tipo_reclamo)}
                    </td>

                    <td className="text-center">
                      <Dot colorClass={meta.dot} title={meta.text} />
                    </td>

                    <td className="text-center">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => handleEditar(r)}>
                        <i className="fa fa-pen-to-square" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {reclamosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-3">
                    No hay reclamos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

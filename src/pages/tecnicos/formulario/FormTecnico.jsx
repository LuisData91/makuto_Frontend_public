import { useContext, useEffect, useState } from 'react'
import { GeneralContext } from '../../../context/generalContext'
import { useNavigate, useParams } from "react-router-dom";
import {
  obtenerTecnico,
  crearTecnico,
  actualizarTecnico,
  eliminarTecnico,
} from "../servicio/tecnicoService";

const FormTecnico = () => {
  const { regNuevo } = useContext(GeneralContext)
  const { cod_tec: codParam } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cod_tec: "",
    nombre: "",
    activo: true,
  });

  const [loading, setLoading] = useState(!regNuevo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (regNuevo) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await obtenerTecnico(codParam);
        setForm({
          cod_tec: data?.cod_tec ?? "",
          nombre: data?.nombre ?? "",
        });
      } catch (e) {
        alert("No se pudo cargar el técnico.");
        navigate("/tecnicos");
      } finally {
        setLoading(false);
      }
    })();
  }, [regNuevo, codParam, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (regNuevo) {
        await crearTecnico(form);
        alert("Técnico creado correctamente.");
      } else {
        await actualizarTecnico(form.cod_tec, form);
        alert("Técnico actualizado correctamente.");
      }
      navigate("/tecnico");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Deseas eliminar (inactivar) este técnico?")) return;
    try {
      setSaving(true);
      await eliminarTecnico(form.cod_tec);
      alert("Técnico eliminado (inactivado).");
      navigate("/tecnico");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar.");
    } finally {
      setSaving(false);
    }
  };

  const handleNombreChange = (e) => {
    const upper = e.target.value.toUpperCase();
    setForm((f) => ({ ...f, nombre: upper }));
  };

  if (loading) return <p className="p-4">Cargando…</p>;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-5 col-lg-6 col-xl-5">
            {/* Card */}
            <div className="card">

              {/* CABECERA DEL CARD */}
              <div className="card-header">
                Registro de Técnico
              </div>

              {/* DETALLE DEL CARD */}
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit} autoComplete='off'>
                  {/* CÓDIGO DE TÉCNICO */}
                  <div className="form-floating mb-3">
                    <input
                      id="codTec"
                      name="cod_tec"
                      type="text"
                      className="form-control"
                      placeholder="DNI"
                      value={form.cod_tec}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          cod_tec: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                      disabled={!regNuevo}
                    />
                    <label htmlFor="email">Código del Técnico</label>
                  </div>

                  {/* NOMBRE DE TÉCNICO */}
                  <div className="form-floating mb-3">
                    <input
                      id="nomTec"
                      name="nombre"
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={handleNombreChange}
                      autoCapitalize="characters"
                      spellCheck={false}
                      required
                    />
                    <label htmlFor="email">Nombre del Técnico</label>
                  </div>

                  {/* USUARIO EN PROTHEUS DEL TÉCNICO */}
                  <div className="form-floating mb-3">
                    <input
                      id="usuario"
                      name="usuario"
                      type="text"
                      className="form-control"
                      placeholder="Usuario"
                      // value={form.usuario}
                      // onChange={handleNombreChange}
                      // autoCapitalize="characters"
                      // spellCheck={false}
                      // required
                    />
                    <label htmlFor="usuario">Usuario Protheus</label>
                  </div>


                  {/* BOTONOES DE CONTROL */}
                  <div className="d-flex flex-row-reverse">
                    <div className="btn-group" role="group">

                      <button
                        type="submit"
                        className="btn btn-outline-secondary"
                        disabled={saving}
                      >
                        {regNuevo ? "Grabar" : "Guardar cambios"}
                      </button>

                      {!regNuevo && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleDelete}
                          disabled={saving}
                        >
                          Eliminar
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/tecnico")}
                        disabled={saving}
                      >
                        Cancelar
                      </button>

                    </div>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormTecnico
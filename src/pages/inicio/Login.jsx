import { useContext, useState } from "react";
import { GeneralContext } from "../../context/generalContext";
import { useNavigate } from 'react-router-dom';
import api from "../../api/api";
import qs from 'qs';
import { obtenerUsuarioPorCodigo } from "./usuarioServices";

const Login = () => {

    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState('');
    const { usuActual, setUsuActual } = useContext(GeneralContext)
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const respuesta = await api.post(
                '/api/proxy/token',
                qs.stringify({
                    grant_type: 'password',
                    username: usuario,
                    password: clave
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (respuesta.status === 201) {
                const data = await obtenerUsuarioPorCodigo(usuario);

                setUsuActual({
                    usr_cod: data.usr_cod,
                    usr_id: data.usr_id,
                    usr_nom: data.usr_nom,
                    usr_usu: data.usr_usu
                })

                navigate('/home')
            }


        } catch (err) {
            setError('Credenciales inválidas o error de conexión')
        }
    }

    return (
        <div className="container">
            <form onSubmit={handleLogin} >
                <div className="mb-3">
                    <label htmlFor="ususario" className="form-label">Usuario</label>
                    <input
                        type="text"
                        className="form-control"
                        id="usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value.toUpperCase())}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="clave" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="clave"
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        required
                    />
                </div>

                {error && <div className="alert alert-danger py-1">{error}</div>}

                <button type="submit" className="btn btn-primary">Ingresar</button>
            </form>
        </div>
    )
}

export default Login
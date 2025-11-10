import { useContext, useState } from "react";
import { GeneralContext } from "../../context/generalContext";
import { useNavigate } from 'react-router-dom';
import api from "../../api/api";
import qs from 'qs';
import { obtenerUsuarioPorCodigo } from "./usuarioServices";
import './Login.css';
import robot from "../../assets/images/robot.png";

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

            // if (respuesta.status === 201) {
            //     const data = await obtenerUsuarioPorCodigo(usuario);

            //     setUsuActual({
            //         usr_cod: data.usr_cod,
            //         usr_id: data.usr_id,
            //         usr_nom: data.usr_nom,
            //         usr_usu: data.usr_usu
            //     })

            //     navigate('/home')
            // }
            // en handleLogin
                
              if (respuesta.status >= 200 && respuesta.status < 300) {
                const dto = await obtenerUsuarioPorCodigo(usuario.trim().toUpperCase());
                setUsuActual({
                    usr_cod: dto.usr_cod,
                    usr_id: dto.usr_id,
                    usr_nom: dto.usr_nom,
                    usr_usu: dto.usr_usu
                });
                navigate('/home');
                }



        } catch (err) {
            setError('Credenciales inválidas o error de conexión')
        }
    }

    return (
        <div className="login-container fondo-login">
            <div className="login-box">
                <h1 className="title">Bienvenidos</h1>
                <img src={robot} alt="Makuto robot" className="robot-img" />
                <form onSubmit={handleLogin} className="login-form" autoComplete="off">
                    <div className="mb-3 input-grupo">
                        <i className="fa-solid fa-user icon"></i>
                        <input
                            type="text"
                            className="form-control"
                            id="usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                    <div className="mb-3 input-grupo">
                        <i className="fa-solid fa-lock icon"></i>
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

                    <button type="submit" className="login-btn">Ingresar</button>
                </form>
            </div>
        </div>
    )
}

export default Login
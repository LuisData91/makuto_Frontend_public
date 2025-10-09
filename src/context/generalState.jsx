import { useEffect, useState } from 'react'
import { GeneralContext } from './generalContext'

const GeneralState = ({ children }) => {

    const [ regNuevo, setRegNuevo ] = useState(true);
    const [ usuActual, setUsuActual ] = useState(() => {
        const DatosUsuario = localStorage.getItem('usr');
        return (
            DatosUsuario
            ? 
                JSON.parse(DatosUsuario)
            :
                {
                    usr_cod: '',
                    usr_id: null,
                    usr_nom: '',
                    usr_usu: '',
                }
        )
    })

    useEffect(() => {
        localStorage.setItem('usr', JSON.stringify(usuActual))
    });

    return (
        <GeneralContext.Provider value={{
            regNuevo,
            setRegNuevo,
            usuActual,
            setUsuActual,
        }}>
            { children }
        </GeneralContext.Provider>
    )
}

export default GeneralState
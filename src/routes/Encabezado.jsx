import { Outlet } from 'react-router-dom';
import MenuPrincipal from '../components/MenuPrincipal';

const Encabezado = () => {
    return (
        <>
            <MenuPrincipal />
            <main className='container pt-3'>
                <Outlet />
            </main>
        </>
    )
}

export default Encabezado
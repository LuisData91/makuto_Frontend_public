import { Suspense } from 'react';
import { listaRutas } from './rutas';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Encabezado from './Encabezado';

const Loading = () => <div className="text-center mt-5">Cargando…</div>;

const AdminRutas = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<Loading />} >
                <Routes>

                    {/* Rutas con menú (anidadas bajo Layout) */}
                    <Route element={<Encabezado />}>
                        {
                            listaRutas
                            .filter(r => !r.noLayout)
                            .map(({ Component, path }) => (
                                <Route key={path} path={path} element={<Component />} />
                            ))
                        }
                        {/* <Route index element={<Navigate to="/" replace />} /> */}
                    </Route>

                    {/* Rutas sin menú (ej. login) */}
                    {
                        listaRutas
                        .filter(r => r.noLayout)
                        .map(({ Component, path }) => (
                            <Route key={path} path={path} element={<Component />} />
                        ))
                    }

                    {/* Ruta por error 404 */}
                    <Route path='*' element={<div className='text-center mt-5'>Página no encontrada</div>} />

                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AdminRutas
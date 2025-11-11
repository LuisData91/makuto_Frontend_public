import { Component, lazy } from "react";

export const listaRutas = [
    {
        path: '/',
        Component: lazy(() => import('../pages/inicio/Login')),
        noLayout: true
    },
    {
        path: '/home',
        Component: lazy(() => import('../pages/inicio/Home')),
        noLayout: false
    },
    {
        path: '/tecnico',
        Component: lazy(() => import('../pages/tecnicos/listado/ListTecnico')),
        noLayout: false
    },
    {
        path: '/tecnico/nuevo',
        Component: lazy(() => import('../pages/tecnicos/formulario/FormTecnico')),
        noLayout: true,
    },
    {
        path: '/tecnico/:cod_tec/editar',
        Component: lazy(() => import('../pages/tecnicos/formulario/FormTecnico')),
        noLayout: true,
    },
    {
        path: '/visita',
        Component: lazy(() => import('../pages/visitatec/listado/ListVisita')),
        noLayout: false,
    },
    {
        path: '/visita/nuevo',
        Component: lazy(() => import('../pages/visitatec/formulario/FormVisita')),
        noLayout: true,
    },
    {
        path: '/visita/:id/editar',
        Component: lazy(() => import('../pages/visitatec/formulario/FormVisita')),
        noLayout: true,
    },

    {
        path: '/calidad/reclamos/nuevo',
        Component: lazy(() => import('../pages/calidad/formulario/FormReclamo')),
        noLayout: true,   // si tus formularios usan pantalla completa como /tecnico/nuevo
    },
        // (más adelante, cuando hagamos el listado y detalle)
    {
        path: '/calidad/reclamos',
        Component: lazy(() => import('../pages/calidad/listado/ListReclamo')), // lo creamos luego
        noLayout: false,
    },
    
    {
        path: '/calidad/reclamos/:id',
        Component: lazy(() => import('../pages/calidad/formulario/FormReclamo')), // modo editar/ver
        noLayout: true,
    },
]
import { lazy } from "react";

export const listaRutas = [

    // ============================
    // LOGIN (sin layout)
    // ============================
    {
        path: '/',
        Component: lazy(() => import('../pages/inicio/Login')),
        noLayout: true
    },

    // ============================
    // HOME
    // ============================
    {
        path: '/home',
        Component: lazy(() => import('../pages/inicio/Home')),
        noLayout: false
    },

    // ============================
    // TÉCNICOS
    // ============================
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

    // ============================
    // VISITAS
    // ============================
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

    // ============================
    // CALIDAD - RECLAMOS
    // ============================

   
    {
        path: '/calidad/reclamos/nuevo',
        Component: lazy(() => import('../pages/calidad/formulario/FormReclamo')),
        noLayout: true,
    },

    //  2. LISTADO (con layout) — USA ListReclamo.jsx
    {
        path: '/calidad/reclamos',
        Component: lazy(() => import('../pages/calidad/listado/ListReclamo')),
        noLayout: false,
    },

    //  3. FORM EDITAR (sin layout)
    {
        path: '/calidad/reclamos/:id',
        Component: lazy(() => import('../pages/calidad/formulario/FormReclamo')),
        noLayout: true,
    },
];

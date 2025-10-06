import { Component, lazy } from "react";

export const listaRutas = [
    {
        path: '/',
        Component: lazy( () => import('../pages/inicio/Home') ),
        noLayout: false
    },
    {
        path: '/login',
        Component: lazy( () => import('../pages/inicio/Login') ),
        noLayout: true
    },
    {
        path: '/tecnico',
        Component: lazy( () => import('../pages/tecnicos/listado/ListTecnico') ),
        noLayout: true
    },
]
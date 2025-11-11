export const MENU = [
    {
        key: "CAT",
        items: [
            {
                label: "Registro de Visita",
                path: "/visita",
            },
            {
                label: "Registro de Técnico",
                path: "/tecnico",
            },
        ],
    },

        {
        id: 'calidad',
        label: 'Calidad',
        icon: 'fa-clipboard-check',
        children: [
            { id: 'calidad-reclamos-nuevo', label: 'Nuevo Reclamo', to: '/calidad/reclamos/nuevo' },
            // cuando tengamos el listado:
            // { id: 'calidad-reclamos', label: 'Reclamos', to: '/calidad/reclamos' },
        ],
    },



    // {
    //     key: "Facturación",
    //     items: [
    //         {
    //             label: "Reg. de Pedido",
    //             path: "/home",
    //         },
    //         {
    //             label: "Reg. de Facturación",
    //             path: "/home",
    //         },
    //         {
    //             label: "Reg. de Nota de Crédito",
    //             path: "/home",
    //         },
    //     ],
    // },
    // {
    //     key: "Tesorería",
    //     items: [
    //         {
    //             label: "Reg. de Entrada de Caja",
    //             path: "/home",
    //         },
    //         {
    //             label: "Reg. de Salida de Caja",
    //             path: "/home",
    //         },
    //         {
    //             label: "Reg. de transferencia entre bancos",
    //             path: "/home",
    //         },
    //     ],
    // },
];
import { useState, useEffect, useCallback } from "react";
import Logo from "../assets/images/IconoChino.png";
import "../components/styles/MenuPrincipal.css";
import { MENU } from "../data/opcionesMenu";
import { useNavigate } from "react-router-dom";

const slug = (s) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-]/g, "")
        .toLowerCase();

const MenuPrincipal = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState(null);
    const navigate = useNavigate();

    const toggleSeccion = (key) => {
        setSeccionActiva((prev) => (prev === key ? null : key));
    };

    const closeMenu = useCallback(() => {
        setMenuVisible(false);
        setSeccionActiva(null);
    }, []);

    // Cerrar con tecla Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeMenu();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [closeMenu]);

    return (
        <>
            {/* NAV SUPERIOR */}
            <nav className="navbar bg-body-tertiary">
                <div className="container-fluid">
                    <div className="logo d-flex align-items-center">
                        <button
                            className="btn btn-sm btn-outline-secondary opacity-75"
                            type="button"
                            onClick={() => setMenuVisible(true)}
                            aria-label="Abrir menú"
                        >
                            <i className="fa-solid fa-bars fw-bold" />
                        </button>
                        <img className="ms-2" src={Logo} alt="Logo" height="25" />
                        <span className="fw-bold ms-1">MAkuto</span>
                    </div>
                </div>
            </nav>

            {/* BACKDROP (clic fuera para cerrar) */}
            <div
                className={`fp-backdrop ${menuVisible ? "show" : ""}`}
                onClick={closeMenu}
                aria-hidden={!menuVisible}
            />

            {/* PANEL IZQUIERDO (siempre montado; visibilidad por clase) */}
            <aside
                className={`floating-panel ${menuVisible ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="Menú lateral"
            >
                {/* Cabecera */}
                <div className="d-flex p-2 justify-content-between align-items-center border-bottom">
                    <div className="d-flex align-items-center">
                        <img className="ms-2" src={Logo} alt="Logo" height="25" />
                        <span className="fw-semibold ms-2">Menú</span>
                    </div>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={closeMenu}
                        aria-label="Cerrar menú"
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Menú acordeón */}
                <ul className="menu-root">
                    {MENU.map(({ key, items }) => {
                        const abierto = seccionActiva === key;
                        const sectionId = `sec-${slug(key)}`;
                        return (
                            <li className="menu-item" key={key}>
                                <button
                                    className={`menu-btn ${abierto ? "active" : ""}`}
                                    onClick={() => toggleSeccion(key)}
                                    aria-expanded={abierto}
                                    aria-controls={sectionId}
                                    type="button"
                                >
                                    <span>{key}</span>
                                    <i
                                        className={`fa-solid ${abierto ? "fa-chevron-up" : "fa-chevron-down"
                                            }`}
                                        aria-hidden="true"
                                    />
                                </button>

                                {/* Contenedor colapsable animado */}
                                <div id={sectionId} className={`collapsible ${abierto ? "open" : ""}`}>
                                    <div className="inner">
                                        <ul className="submenu">
                                            {items.map(({ label, path }) => (
                                                <li key={path}>
                                                    <button
                                                        className="submenu-link"
                                                        type="button"
                                                        onClick={() => {
                                                            navigate(path);
                                                            closeMenu();
                                                        }}
                                                    >
                                                        {label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </>
    );
};

export default MenuPrincipal;

import { useEffect } from "react";
import "../styles/ods.css";
import odsDetalle from "../data/odsDetalle";


export default function ODSModal({ ods, onClose }) {
    useEffect(() => {
        if (!ods) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [ods, onClose]);

    if (!ods) return null;
    const detalle = odsDetalle[ods.id] || {
        descripcion: "",
        objetivo: "",
        metas: []
    };
    return (
        <div
            className="ods-modal-overlay"
            onClick={onClose}
        >
            <div
                className="ods-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="ods-modal-close"
                    onClick={onClose}
                >
                    <i className="bi bi-x-lg"></i>
                </button>

                <div
                    className="ods-modal-header"
                    style={{ background: ods.color }}
                >
                    <img
                        src={ods.imagen}
                        alt={ods.titulo}
                        className="ods-modal-image"
                    />
                </div>

                <div className="ods-modal-content">

                    <span
                        className="ods-modal-number"
                        style={{ color: ods.color }}
                    >
                        {ods.numero}
                    </span>

                    <h2>{ods.titulo}</h2>

                    <p className="ods-modal-description">
                        {ods.descripcion}
                    </p>

                    <hr />

                    <section className="ods-section">
                        <h4>Descripción</h4>
                        <p>{detalle.descripcion}</p>

                        <h4 className="mt-4">Objetivo</h4>

                        <p>{detalle.objetivo}</p>

                        <h4 className="mt-4">Metas principales</h4>

                        <ul>
                            {detalle.metas?.map((meta, index) => (
                                <li key={index}>{meta}</li>
                            ))}
                        </ul>
                    </section>

                    <hr />

                    <div className="text-center mt-4">
                        <a
                            href={ods.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-success"
                        >
                            <i className="bi bi-box-arrow-up-right me-2"></i>
                            Más información en Naciones Unidas
                        </a>
                    </div>

                    <section className="ods-section">
                        <h4>¿Cómo puede contribuir la universidad?</h4>

                        <ul>
                            <li>Desarrollo de proyectos de extensión.</li>
                            <li>Actividades comunitarias.</li>
                            <li>Investigación aplicada.</li>
                            <li>Capacitación y educación.</li>
                        </ul>

                    </section>

                    <div className="text-center mt-4">

                        <button
                            className="btn btn-primary"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}
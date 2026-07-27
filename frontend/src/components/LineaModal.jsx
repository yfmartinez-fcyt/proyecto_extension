import { useEffect } from "react";
import "../styles/lineasAccion.css";


export default function LineaModal({ linea, onClose }) {


    useEffect(() => {

        if (!linea) return;


        const cerrar = (e) => {

            if (e.key === "Escape")
                onClose();

        };


        document.addEventListener(
            "keydown",
            cerrar
        );


        document.body.style.overflow = "hidden";


        return () => {

            document.removeEventListener(
                "keydown",
                cerrar
            );

            document.body.style.overflow = "auto";

        };


    }, [linea, onClose]);



    if (!linea) return null;



    return (

        <div
            className="linea-modal-overlay"
            onClick={onClose}
        >


            <div
                className="linea-modal"
                onClick={(e) => e.stopPropagation()}
            >


                <button
                    className="linea-close"
                    onClick={onClose}
                >
                    <i className="bi bi-x-lg"></i>
                </button>



                <div
                    className="linea-modal-header"
                    style={{
                        backgroundColor: linea.color
                    }}
                >

                    <i className={linea.icono}></i>

                    <h2>
                        {linea.area}
                    </h2>

                </div>



                <div className="linea-modal-content">


                    <h4>
                        Descripción
                    </h4>

                    <p>
                        {linea.descripcion}
                    </p>


                    <h4>
                        Líneas de acción
                    </h4>


                    <ul>

                        {
                            linea.sublineas.map(
                                (item, index) => (

                                    <li key={index}>
                                        {item}
                                    </li>

                                ))
                        }

                    </ul>



                    <button
                        className="btn btn-primary"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>


                </div>


            </div>


        </div>

    );
}
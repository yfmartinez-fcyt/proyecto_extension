import { useMemo, useState } from "react";

import lineasAccion from "../data/lineasAccion";

import LineaCard from "../components/LineaCard";
import LineaModal from "../components/LineaModal";
import LineasHero from "../components/LineasHero";
import LineasStats from "../components/LineasStats";

import "../styles/lineasAccion.css";


export default function LineasAccion() {

    const [busqueda, setBusqueda] = useState("");

    const [seleccionada, setSeleccionada] = useState(null);



    const filtradas = useMemo(() => {

        return lineasAccion.filter((linea) => {

            const texto =
                `${linea.area}
                ${linea.descripcion}
                ${linea.sublineas.join(" ")}`
                .toLowerCase();


            return texto.includes(
                busqueda.toLowerCase()
            );

        });


    }, [busqueda]);



    return (

        <div className="lineas-page">


            {/* Cabecera de la página */}
            <LineasHero />


            {/* Estadísticas */}
            <LineasStats />



            {/* Buscador */}
            <div className="lineas-search">

                <i className="bi bi-search"></i>

                <input

                    type="text"

                    placeholder="Buscar línea de acción..."

                    value={busqueda}

                    onChange={(e) =>
                        setBusqueda(e.target.value)
                    }

                />

            </div>



            {/* Tarjetas de líneas */}
            <div className="lineas-grid">


                {
                    filtradas.map((linea) => (

                        <LineaCard

                            key={linea.id}

                            linea={linea}

                            onSelect={setSeleccionada}

                        />

                    ))
                }


            </div>




            {/* Sin resultados */}
            {
                filtradas.length === 0 && (

                    <div className="lineas-empty">

                        <i className="bi bi-search"></i>

                        <h3>
                            No se encontraron resultados
                        </h3>

                        <p>
                            Intenta buscar otra línea de acción.
                        </p>

                    </div>

                )
            }



            {/* Modal de detalle */}
            <LineaModal

                linea={seleccionada}

                onClose={() =>
                    setSeleccionada(null)
                }

            />


        </div>

    );

}
import { useMemo, useState } from "react";

import odsData from "../data/ods";

import ODSCard from "../components/ODSCard";
import ODSModal from "../components/ODSModal";
import ODSHero from "../components/ODSHero";
import ODSStats from "../components/ODSStats";

import "../styles/ods.css";

export default function ODS() {

    const [busqueda, setBusqueda] = useState("");

    const [odsSeleccionado, setODSSeleccionado] = useState(null);

    const odsFiltrados = useMemo(() => {

        return odsData.filter((ods) => {

            const texto = `${ods.numero} ${ods.titulo} ${ods.descripcion}`.toLowerCase();

            return texto.includes(busqueda.toLowerCase());

        });

    }, [busqueda]);

    return (

        <div className="ods-page">

            <ODSHero />

            <ODSStats />

            <div className="ods-search">

                <div className="input-group">

                    <span className="input-group-text">

                        <i className="bi bi-search"></i>

                    </span>

                    <input

                        type="text"

                        className="form-control"

                        placeholder="Buscar un Objetivo de Desarrollo Sostenible..."

                        value={busqueda}

                        onChange={(e) => setBusqueda(e.target.value)}

                    />

                </div>

            </div>

            <div className="alert alert-light border d-flex justify-content-between align-items-center mb-4">

                <span>
                    <i className="bi bi-info-circle me-2"></i>
                    Explora los 17 Objetivos de Desarrollo Sostenible de la Agenda 2030.
                </span>

                <span className="badge bg-primary">
                    {odsFiltrados.length} objetivos
                </span>

            </div>

            <div className="ods-grid">

                {

                    odsFiltrados.map((ods) => (

                        <ODSCard

                            key={ods.id}

                            ods={ods}

                            onSelect={setODSSeleccionado}

                        />

                    ))

                }

            </div>

            {

                odsFiltrados.length === 0 && (

                    <div className="ods-empty">

                        <i className="bi bi-search"></i>

                        <h3>No se encontraron resultados</h3>

                        <p>

                            Intenta escribir otro nombre o número de ODS.

                        </p>

                    </div>

                )

            }

            <ODSModal

                ods={odsSeleccionado}

                onClose={() => setODSSeleccionado(null)}

            />


        </div>

    );

}
import logoODS from "../assets/ods/logo-ods.png";
export default function ODSHero() {

    return (

        <div className="ods-hero">

            <span className="ods-badge">
                Agenda 2030
            </span>

            <div className="ods-hero-title">

                <img
                    src={logoODS}
                    alt="ODS"
                    className="ods-logo"
                />

                <h1>Objetivos de Desarrollo Sostenible</h1>

            </div>

            <p>
                Los Objetivos de Desarrollo Sostenible (ODS) constituyen un
                llamado mundial para poner fin a la pobreza, proteger el planeta
                y garantizar que todas las personas disfruten de paz y
                prosperidad para el año 2030.
            </p>

            {/* Marca de agua */}
            <img
                src={logoODS}
                alt=""
                className="ods-watermark"
            />

        </div>
                

    );

}
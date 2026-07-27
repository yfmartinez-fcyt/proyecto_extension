import "../styles/lineasAccion.css";

export default function LineasStats() {

    const stats = [
        {
            numero: "5",
            texto: "Áreas estratégicas"
        },
        {
            numero: "15",
            texto: "Líneas de extensión"
        },
        {
            numero: "2",
            texto: "Modalidades de acción"
        },
        {
            numero: "UNCA",
            texto: "Compromiso universitario"
        }
    ];


    return (
        <div className="lineas-stats">

            {
                stats.map((stat, index) => (

                    <div
                        className="lineas-stat-card"
                        key={index}
                    >

                        <h2>
                            {stat.numero}
                        </h2>

                        <span>
                            {stat.texto}
                        </span>

                    </div>

                ))
            }

        </div>
    );
}
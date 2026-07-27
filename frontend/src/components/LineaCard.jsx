import "../styles/lineasAccion.css";


export default function LineaCard({ linea, onSelect }) {

    return (

        <div
            className="linea-card"
            onClick={() => onSelect(linea)}
        >

            <div
                className="linea-card-header"
                style={{
                    backgroundColor: linea.color
                }}
            >

                <i className={linea.icono}></i>

            </div>


            <div className="linea-card-body">

                <h3>
                    {linea.area}
                </h3>


                <p>
                    {linea.descripcion}
                </p>


                <span>
                    {linea.sublineas.length} líneas específicas
                </span>


            </div>

        </div>

    );
}
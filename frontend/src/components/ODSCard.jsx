import "../styles/ods.css";

export default function ODSCard({ ods, onSelect }) {
  return (
    <div
      className="ods-card"
      onClick={() => onSelect(ods)}
    >
      <div
        className="ods-card-header"
        style={{ backgroundColor: ods.color }}
      >
        <img
          src={ods.imagen}
          alt={ods.titulo}
          className="ods-card-image"
        />
      </div>

      <div className="ods-card-body">

        <span className="ods-card-number">
          {ods.numero}
        </span>

        <h5 className="ods-card-title">
          {ods.titulo}
        </h5>

        <p className="ods-card-description">
          {ods.descripcion}
        </p>

      </div>

    </div>
  );
}
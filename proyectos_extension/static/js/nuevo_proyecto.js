document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-proponente");

  const nombre = document.getElementById("nombre_proponente");
  const apellido = document.getElementById("apellido_proponente");
  const correo = document.getElementById("correo_proponente");
  const telefono = document.getElementById("telefono_proponente");
  const estudianteSi = document.getElementById("estudiante_si");
  const estudianteNo = document.getElementById("estudiante_no");
  const docenteCampo = document.getElementById("docente-responsable-campo");
  const docenteResponsable = document.getElementById("docente_responsable");
  const errorEstudiante = document.getElementById("error-estudiante");
  const organizaciones = document.getElementById("organizaciones-textarea");
  const fundamentacion = document.getElementById("fundamentacion");

  const regexSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const regexTelefono = /^\+?[0-9\s\-()]{6,20}$/;

  function obtenerContenedorError(input) {
    return input.parentElement.querySelector(".error-message");
  }

  function mostrarError(input, mensaje) {
    if (!input) return;
    const error = obtenerContenedorError(input);
    if (error) {
      error.textContent = mensaje;
      error.style.display = "block";
    }
    input.style.border = "1px solid red";
  }

  function limpiarError(input) {
    if (!input) return;
    const error = obtenerContenedorError(input);
    if (error) {
      error.textContent = "";
      error.style.display = "none";
    }
    input.style.border = "";
  }

  function limpiarErrorRadio() {
    if (errorEstudiante) {
      errorEstudiante.textContent = "";
      errorEstudiante.style.display = "none";
    }
  }

  function mostrarErrorRadio(mensaje) {
    if (errorEstudiante) {
      errorEstudiante.textContent = mensaje;
      errorEstudiante.style.display = "block";
    }
  }

  function toggleDocenteCampo() {
    if (!docenteCampo) return;

    if (estudianteSi && estudianteSi.checked) {
      docenteCampo.style.display = "block";
    } else {
      docenteCampo.style.display = "none";
      if (docenteResponsable) {
        docenteResponsable.value = "";
        limpiarError(docenteResponsable);
      }
    }

    limpiarErrorRadio();
  }

  function validarNombre() {
    if (!nombre) return true;
    const valor = nombre.value.trim();

    if (valor === "") {
      mostrarError(nombre, "El nombre es obligatorio.");
      return false;
    }

    if (!regexSoloLetras.test(valor)) {
      mostrarError(nombre, "El nombre solo debe contener letras.");
      return false;
    }

    limpiarError(nombre);
    return true;
  }

  function validarApellido() {
    if (!apellido) return true;
    const valor = apellido.value.trim();

    if (valor === "") {
      mostrarError(apellido, "El apellido es obligatorio.");
      return false;
    }

    if (!regexSoloLetras.test(valor)) {
      mostrarError(apellido, "El apellido solo debe contener letras.");
      return false;
    }

    limpiarError(apellido);
    return true;
  }

  function validarCorreo() {
    if (!correo) return true;
    const valor = correo.value.trim();

    if (valor === "") {
      mostrarError(correo, "El correo electrónico es obligatorio.");
      return false;
    }

    if (!regexCorreo.test(valor)) {
      mostrarError(correo, "Ingrese un correo electrónico válido.");
      return false;
    }

    limpiarError(correo);
    return true;
  }

  function validarTelefono() {
    if (!telefono) return true;
    const valor = telefono.value.trim();

    if (valor === "") {
      mostrarError(telefono, "El teléfono es obligatorio.");
      return false;
    }

    if (!regexTelefono.test(valor)) {
      mostrarError(telefono, "Ingrese un número de teléfono válido.");
      return false;
    }

    limpiarError(telefono);
    return true;
  }

  function validarEstudiante() {
    if (!estudianteSi || !estudianteNo) return true;

    if (!estudianteSi.checked && !estudianteNo.checked) {
      mostrarErrorRadio("Debe seleccionar una opción.");
      return false;
    }

    limpiarErrorRadio();
    return true;
  }

  function validarDocenteResponsable() {
    if (!docenteResponsable || !estudianteSi) return true;

    if (estudianteSi.checked) {
      const valor = docenteResponsable.value.trim();

      if (valor === "") {
        mostrarError(docenteResponsable, "El nombre del docente responsable es obligatorio.");
        return false;
      }

      if (!regexSoloLetras.test(valor)) {
        mostrarError(docenteResponsable, "El nombre del docente responsable solo debe contener letras.");
        return false;
      }
    }

    limpiarError(docenteResponsable);
    return true;
  }

  if (nombre) nombre.addEventListener("input", validarNombre);
  if (apellido) apellido.addEventListener("input", validarApellido);
  if (correo) correo.addEventListener("input", validarCorreo);
  if (telefono) telefono.addEventListener("input", validarTelefono);
  if (docenteResponsable) docenteResponsable.addEventListener("input", validarDocenteResponsable);
  if (estudianteSi) estudianteSi.addEventListener("change", toggleDocenteCampo);
  if (estudianteNo) estudianteNo.addEventListener("change", toggleDocenteCampo);

  const denominacionSelect = document.getElementById("denominacion-select");
  const sublineasAmbiente = document.getElementById("sublineas-ambiente");
  const sublineasComunidad = document.getElementById("sublineas-comunidad");
  const sublineasDesarrollo = document.getElementById("sublineas-desarrollo");
  const sublineaAmbiente = document.getElementById("sublinea_ambiente");
  const sublineaComunidad = document.getElementById("sublinea_comunidad");
  const sublineaDesarrollo = document.getElementById("sublinea_desarrollo");
  const hora = document.getElementById("hora");

  function ocultarTodasLasSublineas() {
    if (sublineasAmbiente) sublineasAmbiente.style.display = "none";
    if (sublineasComunidad) sublineasComunidad.style.display = "none";
    if (sublineasDesarrollo) sublineasDesarrollo.style.display = "none";
  }

  function limpiarSublineas() {
    if (sublineaAmbiente) {
      sublineaAmbiente.value = "";
      limpiarError(sublineaAmbiente);
    }
    if (sublineaComunidad) {
      sublineaComunidad.value = "";
      limpiarError(sublineaComunidad);
    }
    if (sublineaDesarrollo) {
      sublineaDesarrollo.value = "";
      limpiarError(sublineaDesarrollo);
    }
  }

  function mostrarSublineaCorrespondiente() {
    if (!denominacionSelect) return;
    ocultarTodasLasSublineas();
    limpiarSublineas();

    if (denominacionSelect.value === "ambiente" && sublineasAmbiente) {
      sublineasAmbiente.style.display = "block";
    } else if (denominacionSelect.value === "comunidad" && sublineasComunidad) {
      sublineasComunidad.style.display = "block";
    } else if (denominacionSelect.value === "desarrollo" && sublineasDesarrollo) {
      sublineasDesarrollo.style.display = "block";
    }
  }

  if (denominacionSelect) {
    denominacionSelect.addEventListener("change", function () {
      mostrarSublineaCorrespondiente();
      validarDenominacion();
      validarSublinea();
    });
    mostrarSublineaCorrespondiente();
  }

  const opcionesUnidades = [
    "Facultad de Ciencias y Tecnologías",
    "Facultad Ciencias de la Producción",
    "Facultad de Ciencias de la Salud",
    "Facultad de Ciencias Médicas",
    "Facultad de Odontología",
    "Facultad de Ciencias Económicas",
    "Facultad de Ciencias Sociales, Políticas y Humanidades",
    "Escuela Superior de Artes y Desarrollo de Talentos"
  ];

  const containerUnidades = document.getElementById("unidades-academicas-container");
  const btnAgregarUnidad = document.getElementById("agregar-unidad-btn");

  function getUnidadesSeleccionadas() {
    return Array.from(document.querySelectorAll(".unidad-academica-select"))
      .map(function (sel) { return sel.value; })
      .filter(function (val) { return val !== ""; });
  }

  function crearSelectUnidad(selected = "") {
    const select = document.createElement("select");
    select.className = "form-input unidad-academica-select";
    select.name = "unidad_academica[]";

    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = "Seleccione una unidad académica";
    select.appendChild(optionDefault);

    const seleccionadas = getUnidadesSeleccionadas();

    opcionesUnidades.forEach(function (opcion) {
      if (!seleccionadas.includes(opcion) || opcion === selected) {
        const opt = document.createElement("option");
        opt.value = opcion;
        opt.textContent = opcion;
        if (opcion === selected) opt.selected = true;
        select.appendChild(opt);
      }
    });

    select.addEventListener("change", actualizarOpcionesEnTodosLosSelects);
    return select;
  }

  function actualizarOpcionesEnTodosLosSelects() {
    const selects = document.querySelectorAll(".unidad-academica-select");
    const valores = getUnidadesSeleccionadas();

    selects.forEach(function (sel) {
      const valorActual = sel.value;

      while (sel.options.length > 0) {
        sel.remove(0);
      }

      const optionDefault = document.createElement("option");
      optionDefault.value = "";
      optionDefault.textContent = "Seleccione una unidad académica";
      sel.appendChild(optionDefault);

      opcionesUnidades.forEach(function (opcion) {
        if (!valores.includes(opcion) || opcion === valorActual) {
          const opt = document.createElement("option");
          opt.value = opcion;
          opt.textContent = opcion;
          if (opcion === valorActual) opt.selected = true;
          sel.appendChild(opt);
        }
      });
    });

    actualizarEstadoBotonAgregar();
  }

  function actualizarEstadoBotonAgregar() {
    if (!btnAgregarUnidad) return;

    const selects = document.querySelectorAll(".unidad-academica-select");

    if (!selects.length) {
      btnAgregarUnidad.disabled = true;
      return;
    }

    const ultimoSelect = selects[selects.length - 1];

    btnAgregarUnidad.disabled =
      ultimoSelect.value === "" ||
      getUnidadesSeleccionadas().length >= opcionesUnidades.length;

    btnAgregarUnidad.style.opacity = btnAgregarUnidad.disabled ? "0.5" : "1";
    btnAgregarUnidad.style.cursor = btnAgregarUnidad.disabled ? "not-allowed" : "pointer";
  }

  if (btnAgregarUnidad && containerUnidades) {
    btnAgregarUnidad.addEventListener("click", function () {
      const seleccionadas = getUnidadesSeleccionadas();
      const selects = document.querySelectorAll(".unidad-academica-select");
      const ultimoSelect = selects[selects.length - 1];

      if (!ultimoSelect || ultimoSelect.value === "" || seleccionadas.length >= opcionesUnidades.length) {
        return;
      }

      const div = document.createElement("div");
      div.className = "unidad-academica-group";
      div.style.marginTop = "12px";

      const label = document.createElement("label");
      label.className = "form-label";
      label.textContent = "Unidad Académica:";

      const select = crearSelectUnidad();

      div.appendChild(label);
      div.appendChild(select);
      containerUnidades.appendChild(div);

      actualizarOpcionesEnTodosLosSelects();
    });

    const primerSelect = document.querySelector(".unidad-academica-select");
    if (primerSelect) {
      primerSelect.addEventListener("change", actualizarOpcionesEnTodosLosSelects);
    }

    actualizarEstadoBotonAgregar();
  }

  function aplicarGuionAutomatico(textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;

    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();

        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        const before = value.substring(0, start);
        const after = value.substring(end);

        this.value = before + "\n- " + after;
        this.selectionStart = this.selectionEnd = start + 3;
      }
    });
  }

  aplicarGuionAutomatico("organizaciones-textarea");
  aplicarGuionAutomatico("objetivos-textarea");
  aplicarGuionAutomatico("metas-textarea");

  const fechaInicio = document.getElementById("fecha_inicio");
  const fechaFin = document.getElementById("fecha_fin");
  const horas = document.getElementById("horas");
  const carrera = document.getElementById("carrera");
  const curso = document.getElementById("curso");
  const proponente = document.getElementById("proponente");

  function validarSoloSiTieneValor(input, mensajeVacio, mensajeInvalido, regex) {
    if (!input) return true;
    const valor = input.value.trim();

    if (valor === "") {
      mostrarError(input, mensajeVacio);
      return false;
    }

    if (regex && !regex.test(valor)) {
      mostrarError(input, mensajeInvalido);
      return false;
    }

    limpiarError(input);
    return true;
  }

  function validarFechaInicioFin() {
    if (!fechaInicio || !fechaFin) return true;

    const inicio = fechaInicio.value;
    const fin = fechaFin.value;

    if (inicio === "" || fin === "") {
      if (inicio === "") mostrarError(fechaInicio, "La fecha de inicio es obligatoria.");
      else limpiarError(fechaInicio);

      if (fin === "") mostrarError(fechaFin, "La fecha de finalización es obligatoria.");
      else limpiarError(fechaFin);

      return false;
    }

    if (fin < inicio) {
      mostrarError(fechaFin, "La fecha de finalización no puede ser menor que la fecha de inicio.");
      limpiarError(fechaInicio);
      return false;
    }

    limpiarError(fechaInicio);
    limpiarError(fechaFin);
    return true;
  }

  function validarHoras() {
    if (!horas) return true;
    const valor = horas.value.trim();

    if (valor === "") {
      mostrarError(horas, "Las horas asignadas son obligatorias.");
      return false;
    }

    if (isNaN(valor) || Number(valor) <= 0) {
      mostrarError(horas, "Ingrese una cantidad válida de horas.");
      return false;
    }

    limpiarError(horas);
    return true;
  }

  function validarDenominacion() {
    if (!denominacionSelect) return true;

    if (denominacionSelect.value === "") {
      mostrarError(denominacionSelect, "Debe seleccionar una línea de acción.");
      return false;
    }

    limpiarError(denominacionSelect);
    return true;
  }

  function validarSublinea() {
    if (!denominacionSelect) return true;

    if (denominacionSelect.value === "") {
      return true;
    }

    if (denominacionSelect.value === "ambiente") {
      if (!sublineaAmbiente || sublineaAmbiente.value === "") {
        if (sublineaAmbiente) mostrarError(sublineaAmbiente, "Debe seleccionar una sublínea.");
        return false;
      }
      limpiarError(sublineaAmbiente);
    }

    if (denominacionSelect.value === "comunidad") {
      if (!sublineaComunidad || sublineaComunidad.value === "") {
        if (sublineaComunidad) mostrarError(sublineaComunidad, "Debe seleccionar una sublínea.");
        return false;
      }
      limpiarError(sublineaComunidad);
    }

    if (denominacionSelect.value === "desarrollo") {
      if (!sublineaDesarrollo || sublineaDesarrollo.value === "") {
        if (sublineaDesarrollo) mostrarError(sublineaDesarrollo, "Debe seleccionar una sublínea.");
        return false;
      }
      limpiarError(sublineaDesarrollo);
    }

    return true;
  }

  function validarHora() {
    if (!hora) return true;

    if (hora.value === "") {
      mostrarError(hora, "La hora es obligatoria.");
      return false;
    }

    limpiarError(hora);
    return true;
  }

  function validarHorasEnteras() {
    if (!horas) return true;

    const valor = horas.value.trim();

    if (valor === "") {
      return true;
    }

    if (!Number.isInteger(Number(valor))) {
      mostrarError(horas, "Las horas deben ser un número entero.");
      return false;
    }

    limpiarError(horas);
    return true;
  }

  function validarUnidadAcademica() {
    const selects = document.querySelectorAll(".unidad-academica-select");
    if (!selects.length) return true;

    let valido = true;

    selects.forEach(function (sel) {
      const contenedor = sel.parentElement.querySelector(".error-message");
      if (contenedor) contenedor.remove();

      if (sel.value === "") {
        let error = document.createElement("small");
        error.className = "error-message";
        error.textContent = "Debe seleccionar una unidad académica.";
        error.style.display = "block";
        sel.parentElement.appendChild(error);
        sel.style.border = "1px solid red";
        valido = false;
      } else {
        sel.style.border = "";
      }
    });

    return valido;
  }

  function limpiarErroresUnidadAcademica() {
    const selects = document.querySelectorAll(".unidad-academica-select");

    selects.forEach(function (sel) {
      const errores = sel.parentElement.querySelectorAll(".error-message");
      errores.forEach(function (error) {
        if (!error.id) error.remove();
      });

      if (sel.value !== "") {
        sel.style.border = "";
      }
    });
  }

  function validarCamposTextoProyecto() {
    const regexTexto = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\s.,\-()]+$/;

    const carreraValida = validarSoloSiTieneValor(
      carrera,
      "La carrera es obligatoria.",
      "La carrera contiene caracteres no permitidos.",
      regexTexto
    );

    const cursoValido = validarSoloSiTieneValor(
      curso,
      "El curso es obligatorio.",
      "El curso contiene caracteres no permitidos.",
      regexTexto
    );

    const proponenteValido = validarSoloSiTieneValor(
      proponente,
      "El campo proponente es obligatorio.",
      "El campo proponente contiene caracteres no permitidos.",
      regexTexto
    );

    return carreraValida && cursoValido && proponenteValido;
  }

  function validarOrganizaciones() {
    if (!organizaciones) return true;
    const valor = organizaciones.value.trim();

    if (valor === "" || valor === "-") {
      mostrarError(organizaciones, "Debe ingresar al menos una organización.");
      return false;
    }

    limpiarError(organizaciones);
    return true;
  }

  function validarFundamentacion() {
    if (!fundamentacion) return true;
    const valor = fundamentacion.value.trim();

    if (valor === "") {
      mostrarError(fundamentacion, "La fundamentación es obligatoria.");
      return false;
    }

    limpiarError(fundamentacion);
    return true;
  }

  if (fechaInicio) fechaInicio.addEventListener("change", validarFechaInicioFin);
  if (fechaFin) fechaFin.addEventListener("change", validarFechaInicioFin);
  if (hora) hora.addEventListener("change", validarHora);

  if (horas) {
    horas.addEventListener("input", function () {
      validarHoras();
      validarHorasEnteras();
    });
  }

  if (sublineaAmbiente) sublineaAmbiente.addEventListener("change", validarSublinea);
  if (sublineaComunidad) sublineaComunidad.addEventListener("change", validarSublinea);
  if (sublineaDesarrollo) sublineaDesarrollo.addEventListener("change", validarSublinea);

  if (carrera) carrera.addEventListener("input", limpiarError.bind(null, carrera));
  if (curso) curso.addEventListener("input", limpiarError.bind(null, curso));
  if (proponente) proponente.addEventListener("input", limpiarError.bind(null, proponente));
  if (organizaciones) organizaciones.addEventListener("input", validarOrganizaciones);
  if (fundamentacion) fundamentacion.addEventListener("input", validarFundamentacion);

  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("unidad-academica-select")) {
      limpiarErroresUnidadAcademica();
    }
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      const esNombreValido = validarNombre();
      const esApellidoValido = validarApellido();
      const esCorreoValido = validarCorreo();
      const esTelefonoValido = validarTelefono();
      const esEstudianteValido = validarEstudiante();
      const esDocenteValido = validarDocenteResponsable();

      const esDenominacionValida = validarDenominacion();
      const esSublineaValida = validarSublinea();
      const esFechaValida = validarFechaInicioFin();
      const esHoraValida = validarHora();
      const esHorasValida = validarHoras();
      const esHorasEnterasValida = validarHorasEnteras();
      const esUnidadValida = validarUnidadAcademica();
      const esTextoProyectoValido = validarCamposTextoProyecto();
      const esOrganizacionValida = validarOrganizaciones();
      const esFundamentacionValida = validarFundamentacion();

      if (
        !esNombreValido ||
        !esApellidoValido ||
        !esCorreoValido ||
        !esTelefonoValido ||
        !esEstudianteValido ||
        !esDocenteValido ||
        !esDenominacionValida ||
        !esSublineaValida ||
        !esFechaValida ||
        !esHoraValida ||
        !esHorasValida ||
        !esHorasEnterasValida ||
        !esUnidadValida ||
        !esTextoProyectoValido ||
        !esOrganizacionValida ||
        !esFundamentacionValida
      ) {
        e.preventDefault();
      }
    });
  }

  toggleDocenteCampo();
});
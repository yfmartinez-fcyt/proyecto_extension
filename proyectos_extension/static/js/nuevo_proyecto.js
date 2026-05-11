document.addEventListener("DOMContentLoaded", function () {

  // 1. ELEMENTOS DEL FORMULARIO (INPUTS PRINCIPALES)
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

  // =====================================================
  // 2. EXPRESIONES REGULARES (VALIDACIONES)
  // =====================================================
  const regexNombreApellido = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{2,80}$/;
  const regexDocente = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{5,100}$/;
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexTelefonoParaguay = /^(\+5959\d{8}|5959\d{8}|09\d{8})$/;

  // =====================================================
  // 3. MANEJO DE ERRORES (MOSTRAR / LIMPIAR)
  // =====================================================
  function obtenerContenedorError(input) {
    let error = input.parentElement.querySelector(".error-message");

    if (!error) {
      error = document.createElement("small");
      error.className = "error-message";
      input.parentElement.appendChild(error);
    }

    return error;
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

  // =====================================================
  // 4. VALIDACIONES DEL PROPONENTE
  // (Nombre, Apellido, Correo, Teléfono, Estudiante, Docente)
  // =====================================================
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

    if (!regexNombreApellido.test(valor)) {
      mostrarError(nombre, "El nombre debe tener entre 2 y 80 caracteres, solo letras y espacios.");
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

    if (!regexNombreApellido.test(valor)) {
      mostrarError(apellido, "El apellido debe tener entre 2 y 80 caracteres, solo letras y espacios.");
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

    if (!regexTelefonoParaguay.test(valor)) {
      mostrarError(telefono, "Ingrese un teléfono válido. Ej: 0981123456, 595981123456 o +595981123456.");
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

      if (!regexDocente.test(valor)) {
        mostrarError(docenteResponsable, "El docente responsable debe tener entre 5 y 100 caracteres, solo letras y espacios.");
        return false;
      }
    }

    limpiarError(docenteResponsable);
    return true;
  }

  // =====================================================
  // 5. EVENTOS EN TIEMPO REAL (PROPONENTE)
  // =====================================================
  if (nombre) nombre.addEventListener("input", validarNombre);
  if (apellido) apellido.addEventListener("input", validarApellido);
  if (correo) correo.addEventListener("input", validarCorreo);
  if (telefono) telefono.addEventListener("input", validarTelefono);
  if (docenteResponsable) docenteResponsable.addEventListener("input", validarDocenteResponsable);
  if (estudianteSi) estudianteSi.addEventListener("change", toggleDocenteCampo);
  if (estudianteNo) estudianteNo.addEventListener("change", toggleDocenteCampo);


  // =====================================================
  // 6. DENOMINACIÓN Y SUBLÍNEAS
  // =====================================================
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

  // =====================================================
  // 7. UNIDADES ACADÉMICAS DINÁMICAS
  // =====================================================
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


  // =====================================================
  // 8. FORMATO AUTOMÁTICO DE LISTAS (GUIONES)
  // =====================================================
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

  // =====================================================
  // 9. CAMPOS DEL PROYECTO
  // (Fechas, horas, carrera, curso, etc.)
  // =====================================================
  const fechaInicio = document.getElementById("fecha_inicio");
  const fechaFin = document.getElementById("fecha_fin");
  const horas = document.getElementById("horas");
  const carrera = document.getElementById("carrera");
  const curso = document.getElementById("curso");
  const proponente = document.getElementById("proponente");
  const objetivos = document.getElementById("objetivos-textarea");
  const metodologia = document.getElementById("metodologia");
  const metas = document.getElementById("metas-textarea");
  const resultados = document.getElementById("resultados");
  const recursosHumanos = document.getElementById("recursos_humanos");
  const beneficiarios = document.getElementById("beneficiarios");
  const localizacion = document.getElementById("localizacion");
  const presupuesto = document.getElementById("presupuesto");
  const declaracionRevision = document.getElementById("declaracion_revision");

  // =====================================================
  // 10. FUNCIONES AUXILIARES PARA VALIDAR TEXTOS
  // =====================================================
  function limpiarTextoLista(valor) {
    return valor.replace(/^-+\s*/gm, "").trim();
  }

  function contarPalabras(valor) {
    return limpiarTextoLista(valor)
      .split(/\s+/)
      .filter(function (palabra) {
        return palabra.length > 0;
      }).length;
  }

  function esTextoRepetido(valor) {
    const limpio = limpiarTextoLista(valor).replace(/\s+/g, "").toLowerCase();
    return limpio.length >= 6 && /^([a-záéíóúñü])\1+$/.test(limpio);
  }

  function esSoloSimbolos(valor) {
    const limpio = limpiarTextoLista(valor);
    return limpio !== "" && !/[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9]/.test(limpio);
  }

  function validarTextareaAvanzado(input, nombreCampo, minimoCaracteres, minimoPalabras) {
    if (!input) return true;

    const valor = input.value.trim();
    const textoLimpio = limpiarTextoLista(valor);

    if (valor === "" || textoLimpio === "") {
      mostrarError(input, `${nombreCampo} es obligatorio.`);
      return false;
    }

    if (textoLimpio.length < minimoCaracteres) {
      mostrarError(input, `${nombreCampo} debe tener al menos ${minimoCaracteres} caracteres.`);
      return false;
    }

    if (contarPalabras(valor) < minimoPalabras) {
      mostrarError(input, `${nombreCampo} debe contener al menos ${minimoPalabras} palabras.`);
      return false;
    }

    if (esTextoRepetido(valor)) {
      mostrarError(input, `${nombreCampo} no puede contener texto repetido sin sentido.`);
      return false;
    }

    if (esSoloSimbolos(valor)) {
      mostrarError(input, `${nombreCampo} no puede contener solo símbolos.`);
      return false;
    }

    limpiarError(input);
    return true;
  }

  // =====================================================
  // 11. VALIDACIONES DE TEXTOS DEL PROYECTO
  // (Objetivos, metodología, metas, resultados, etc.)
  // =====================================================
  function validarObjetivos() {
    return validarTextareaAvanzado(objetivos, "Los objetivos generales y específicos", 30, 5);
  }

  function validarMetodologia() {
    return validarTextareaAvanzado(metodologia, "La metodología de implementación", 50, 8);
  }

  function validarMetas() {
    return validarTextareaAvanzado(metas, "Las metas", 20, 3);
  }

  function validarResultados() {
    return validarTextareaAvanzado(resultados, "Los resultados esperados", 30, 5);
  }

  function validarRecursosHumanos() {
    return validarTextareaAvanzado(recursosHumanos, "Los recursos humanos participantes", 10, 2);
  }

  function validarBeneficiarios() {
    return validarTextareaAvanzado(beneficiarios, "La identificación de beneficiarios", 20, 4);
  }

  function validarLocalizacion() {
    if (!localizacion) return true;

    if (localizacion.value === "") {
      mostrarError(localizacion, "Debe seleccionar una localización.");
      return false;
    }

    limpiarError(localizacion);
    return true;
  }

  function validarPresupuesto() {
    if (!presupuesto) return true;

    const valor = presupuesto.value.trim();
    const textoLimpio = limpiarTextoLista(valor);

    if (valor === "" || textoLimpio === "") {
      mostrarError(presupuesto, "El presupuesto es obligatorio.");
      return false;
    }

    if (textoLimpio.length < 5) {
      mostrarError(presupuesto, "El presupuesto debe tener al menos 5 caracteres.");
      return false;
    }

    if (/-\s*\d+/.test(valor)) {
      mostrarError(presupuesto, "El presupuesto no puede contener montos negativos.");
      return false;
    }

    limpiarError(presupuesto);
    return true;
  }

  // =====================================================
  // 12. VALIDACIÓN DEL CRONOGRAMA
  // =====================================================
  function validarCronograma() {
    const filas = document.querySelectorAll(".cronograma-table tbody tr");
    const actividadesUsadas = [];
    let valido = true;

    filas.forEach(function (fila) {
      const actividades = fila.querySelectorAll('input[name^="cronograma_actividad_"]');
      const fechaInicio = fila.querySelector('input[name^="cronograma_inicio_"]');
      const dias = fila.querySelector('input[name^="cronograma_dias_"]');
      const hora = fila.querySelector('input[name^="cronograma_hora_"]');
      const fechaFin = fila.querySelector('input[name^="cronograma_fin_"]');
      const credito = fila.querySelector('input[name^="cronograma_credito_"]');

      const camposFila = [...actividades, fechaInicio, dias, hora, fechaFin, credito].filter(Boolean);
      const filaTieneDatos = camposFila.some(function (input) {
        return input.value.trim() !== "";
      });

      if (!filaTieneDatos) return;

      actividades.forEach(function (actividad) {
        const valor = actividad.value.trim();
        const limpio = limpiarTextoLista(valor).toLowerCase();

        if (valor === "" || limpio === "") {
          mostrarError(actividad, "La actividad es obligatoria.");
          valido = false;
        } else if (limpio.length < 5) {
          mostrarError(actividad, "La actividad debe tener al menos 5 caracteres.");
          valido = false;
        } else if (actividadesUsadas.includes(limpio)) {
          mostrarError(actividad, "No se permiten actividades duplicadas.");
          valido = false;
        } else {
          actividadesUsadas.push(limpio);
          limpiarError(actividad);
        }
      });

      if (!fechaInicio || fechaInicio.value === "") {
        mostrarError(fechaInicio, "La fecha de inicio es obligatoria.");
        valido = false;
      } else {
        limpiarError(fechaInicio);
      }

      if (!dias || dias.value.trim() === "" || !Number.isInteger(Number(dias.value)) || Number(dias.value) < 1) {
        mostrarError(dias, "Los días deben ser un número entero positivo.");
        valido = false;
      } else {
        limpiarError(dias);
      }

      if (!hora || hora.value === "") {
        mostrarError(hora, "La hora es obligatoria.");
        valido = false;
      } else {
        limpiarError(hora);
      }

      if (!fechaFin || fechaFin.value === "") {
        mostrarError(fechaFin, "La fecha de finalización es obligatoria.");
        valido = false;
      } else if (fechaInicio && fechaInicio.value !== "" && fechaFin.value < fechaInicio.value) {
        mostrarError(fechaFin, "La fecha de finalización no puede ser menor que la fecha de inicio.");
        valido = false;
      } else {
        limpiarError(fechaFin);
      }

      if (!credito || credito.value.trim() === "" || !Number.isInteger(Number(credito.value)) || Number(credito.value) < 1) {
        mostrarError(credito, "Las horas/crédito deben ser un número entero positivo.");
        valido = false;
      } else {
        limpiarError(credito);
      }
    });

    return valido;
  }

  // =====================================================
  // 13. VALIDACIÓN DE CONFIRMACIÓN FINAL
  // =====================================================
  function validarDeclaracionRevision() {
    if (!declaracionRevision) return true;

    const contenedor = declaracionRevision.closest(".declaration-box");
    let error = contenedor ? contenedor.parentElement.querySelector(".error-message-declaracion") : null;

    if (!declaracionRevision.checked) {
      if (!error && contenedor) {
        error = document.createElement("small");
        error.className = "error-message error-message-declaracion";
        error.style.display = "block";
        contenedor.parentElement.appendChild(error);
      }

      if (error) {
        error.textContent = "Debe confirmar que los datos ingresados son correctos.";
      }

      return false;
    }

    if (error) {
      error.textContent = "";
      error.style.display = "none";
    }

    return true;
  }

  // =====================================================
  // 14. VALIDACIONES GENERALES DEL PROYECTO
  // =====================================================
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
    return validarTextareaAvanzado(fundamentacion, "La fundamentación", 50, 8);
  }

  // =====================================================
  // 15. EVENTOS DE VALIDACIÓN EN TIEMPO REAL
  // =====================================================
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

  if (objetivos) objetivos.addEventListener("input", validarObjetivos);
  if (metodologia) metodologia.addEventListener("input", validarMetodologia);
  if (metas) metas.addEventListener("input", validarMetas);
  if (resultados) resultados.addEventListener("input", validarResultados);
  if (recursosHumanos) recursosHumanos.addEventListener("input", validarRecursosHumanos);
  if (beneficiarios) beneficiarios.addEventListener("input", validarBeneficiarios);
  if (localizacion) localizacion.addEventListener("change", validarLocalizacion);
  if (presupuesto) presupuesto.addEventListener("input", validarPresupuesto);
  if (declaracionRevision) declaracionRevision.addEventListener("change", validarDeclaracionRevision);

  // =====================================================
  // 16. WIZARD DE PASOS (NAVEGACIÓN + VALIDACIÓN POR ETAPA)
  // =====================================================
  const panels = Array.from(document.querySelectorAll(".wizard-panel"));
  const indicators = Array.from(document.querySelectorAll(".wizard-step"));
  const nextButtons = document.querySelectorAll("[data-next-step]");
  const prevButtons = document.querySelectorAll("[data-prev-step]");
  let currentStep = 1;

  function obtenerPrimerErrorVisible() {
    const errores = Array.from(document.querySelectorAll(".error-message, .error-message-declaracion"));
    return errores.find(function (error) {
      return error.textContent.trim() !== "" && window.getComputedStyle(error).display !== "none";
    });
  }

  function actualizarUIWizard() {
    panels.forEach(function (panel) {
      const panelStep = Number(panel.dataset.step);
      panel.classList.toggle("is-active", panelStep === currentStep);
    });

    indicators.forEach(function (indicator) {
      const indicatorStep = Number(indicator.dataset.stepIndicator);
      indicator.classList.toggle("is-active", indicatorStep === currentStep);
      indicator.classList.toggle("is-completed", indicatorStep < currentStep);
    });
  }

  function validarPasoActual(step) {
    if (step === 1) {
      return (
        validarNombre() &&
        validarApellido() &&
        validarCorreo() &&
        validarTelefono() &&
        validarEstudiante() &&
        validarDocenteResponsable()
      );
    }

    if (step === 2) {
      return (
        validarDenominacion() &&
        validarSublinea() &&
        validarFechaInicioFin() &&
        validarHora() &&
        validarHoras() &&
        validarHorasEnteras() &&
        validarUnidadAcademica() &&
        validarCamposTextoProyecto() &&
        validarOrganizaciones() &&
        validarFundamentacion() &&
        validarObjetivos() &&
        validarMetodologia() &&
        validarMetas() &&
        validarResultados()
      );
    }

    return true;
  }

  nextButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (!validarPasoActual(currentStep)) {
        const primerError = obtenerPrimerErrorVisible();
        if (primerError) {
          primerError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      currentStep = Math.min(currentStep + 1, panels.length);
      actualizarUIWizard();
      if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  prevButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentStep = Math.max(currentStep - 1, 1);
      actualizarUIWizard();
      if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // =====================================================
  // 17. VALIDACIÓN FINAL AL ENVIAR EL FORMULARIO
  // =====================================================
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
      const esObjetivosValido = validarObjetivos();
      const esMetodologiaValida = validarMetodologia();
      const esMetasValida = validarMetas();
      const esResultadosValido = validarResultados();
      const esRecursosHumanosValido = validarRecursosHumanos();
      const esBeneficiariosValido = validarBeneficiarios();
      const esLocalizacionValida = validarLocalizacion();
      const esPresupuestoValido = validarPresupuesto();
      const esCronogramaValido = validarCronograma();
      const esDeclaracionValida = validarDeclaracionRevision();

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
        !esFundamentacionValida ||
        !esObjetivosValido ||
        !esMetodologiaValida ||
        !esMetasValida ||
        !esResultadosValido ||
        !esRecursosHumanosValido ||
        !esBeneficiariosValido ||
        !esLocalizacionValida ||
        !esPresupuestoValido ||
        !esCronogramaValido ||
        !esDeclaracionValida
      ) {
        const primerError = obtenerPrimerErrorVisible();

        if (primerError) {
          primerError.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }

        e.preventDefault();
      }
    });
  }

  // =====================================================
  // 18. INICIALIZACIÓN DEL FORMULARIO
  // =====================================================
  toggleDocenteCampo();
  actualizarUIWizard();
});
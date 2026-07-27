const { ROLES_USUARIO } = require('./constants');

const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,20}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;


const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;


const isValidId = (id) => {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
};


const esCorreoValido = (email) =>
  typeof email === 'string' && EMAIL_REGEX.test(email.trim());


const esNombreValido = (value, campo = 'Nombre') => {

  if (typeof value !== 'string') {
    return `El ${campo.toLowerCase()} no es válido`;
  }

  const trimmed = value.trim();

  if (trimmed.length < 2) {
    return `El ${campo.toLowerCase()} debe tener al menos 2 caracteres`;
  }

  if (!NOMBRE_REGEX.test(trimmed)) {
    return `El ${campo.toLowerCase()} solo puede contener letras (sin números ni caracteres especiales)`;
  }

  return null;
};


const esUsernameValido = (username) => {

  if (!username || typeof username !== "string") {
    return "El username es obligatorio";
  }

  const value = username.trim();

  if (!USERNAME_REGEX.test(value)) {
    return "El username debe tener entre 4 y 20 caracteres y solo puede contener letras, números y guion bajo";
  }

  return null;
};


const esContrasenaValida = (password) => {

  if (typeof password !== 'string' || !password) {
    return 'La contraseña es obligatoria';
  }

  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }

  if (!PASSWORD_REGEX.test(password)) {
    return 'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales';
  }

  return null;
};


/**
 * Valida body para registrar usuario
 * POST /api/auth/register
 */
const validateRegister = (body = {}) => {

  const {
    nombre,
    apellido,
    email,
    username,
    password,
    rol
  } = body;


  if (!nombre || !apellido || !email || !username || !password) {
    return {
      valid: false,
      message: "Todos los campos son obligatorios"
    };
  }


  const nombreError = esNombreValido(nombre, "Nombre");

  if (nombreError) {
    return {
      valid: false,
      message: nombreError
    };
  }


  const apellidoError = esNombreValido(apellido, "Apellido");

  if (apellidoError) {
    return {
      valid: false,
      message: apellidoError
    };
  }


  if (!esCorreoValido(email)) {
    return {
      valid: false,
      message: "Debe ingresarse una dirección de correo electrónico válida"
    };
  }


  const usernameError = esUsernameValido(username);

  if (usernameError) {
    return {
      valid: false,
      message: usernameError
    };
  }


  const passwordError = esContrasenaValida(password);

  if (passwordError) {
    return {
      valid: false,
      message: passwordError
    };
  }


  if (rol !== undefined && !ROLES_USUARIO.includes(rol)) {
    return {
      valid: false,
      message: "El rol ingresado no es válido"
    };
  }


  return {
    valid: true,
    data: {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim(),
      password,
      rol: rol || "alumno"
    }
  };
};


/**
 * Valida body para actualizar usuario
 * PUT /api/usuarios/:id
 */
const validateUpdateUser = (body, { allowRol = false } = {}) => {

  const {
    nombre,
    apellido,
    email,
    username,
    rol
  } = body;


  const fields = [
    nombre,
    apellido,
    email,
    username,
    rol
  ];


  const hasField = fields.some((v) => v !== undefined);


  if (!hasField) {
    return {
      valid: false,
      message: "Debe enviar al menos un campo para actualizar"
    };
  }


  if (nombre !== undefined) {

    if (!isNonEmptyString(nombre)) {
      return {
        valid:false,
        message:"El nombre no puede estar vacío"
      };
    }

    const error = esNombreValido(nombre, "Nombre");

    if(error){
      return {
        valid:false,
        message:error
      };
    }
  }


  if (apellido !== undefined) {

    if (!isNonEmptyString(apellido)) {
      return {
        valid:false,
        message:"El apellido no puede estar vacío"
      };
    }

    const error = esNombreValido(apellido, "Apellido");

    if(error){
      return {
        valid:false,
        message:error
      };
    }
  }


  if (email !== undefined) {

    if (!isNonEmptyString(email)) {
      return {
        valid:false,
        message:"El email no puede estar vacío"
      };
    }

    if (!esCorreoValido(email)) {
      return {
        valid:false,
        message:"El email no es válido"
      };
    }
  }


  if (username !== undefined) {

    const error = esUsernameValido(username);

    if(error){
      return {
        valid:false,
        message:error
      };
    }
  }


  if (allowRol && rol !== undefined && !ROLES_USUARIO.includes(rol)) {

    return {
      valid:false,
      message:"El rol ingresado no es válido"
    };

  }


  return {
    valid:true,
    data:{
      nombre: nombre !== undefined ? nombre.trim() : undefined,
      apellido: apellido !== undefined ? apellido.trim() : undefined,
      email: email !== undefined ? email.trim().toLowerCase() : undefined,
      username: username !== undefined ? username.trim() : undefined,
      rol
    }
  };
};


module.exports = {
  isValidId,
  esCorreoValido,
  esNombreValido,
  esUsernameValido,
  esContrasenaValida,
  validateRegister,
  validateUpdateUser
};
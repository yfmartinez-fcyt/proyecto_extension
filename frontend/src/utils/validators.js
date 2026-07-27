const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/;


export const validateRegisterForm = (form) => {

  if (!form.nombre.trim() || !form.apellido.trim()) {
    return "El nombre y apellido son obligatorios";
  }


  if (form.nombre.trim().length < 2) {
    return "El nombre debe tener al menos 2 caracteres";
  }


  if (!NAME_REGEX.test(form.nombre.trim())) {
    return "El nombre solo puede contener letras";
  }


  if (!NAME_REGEX.test(form.apellido.trim())) {
    return "El apellido solo puede contener letras";
  }


  if (!EMAIL_REGEX.test(form.email.trim())) {
    return "Debe ingresar un correo electrónico válido";
  }


  if (!form.username || form.username.trim().length < 4) {
    return "El username debe tener al menos 4 caracteres";
  }

  if (form.username.includes(' ')) {
   return 'El usuario no puede contener espacios';
}


  if (!PASSWORD_REGEX.test(form.password)) {
    return "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales";
  }


  return null;
};
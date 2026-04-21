# 📚 Sistema Académico para Gestión de Proyectos de Extensión

> Plataforma web desarrollada con **Django** y **PostgreSQL** para registrar, solicitar, administrar y visualizar proyectos de extensión universitaria.

---

## 👥 Autores

| Nombre | Rol |
|--------|-----|
| María Duarte | Desarrolladora |
| Marcelo Vera | Desarrollador |
| Yanina Martínez | Desarrolladora |

---

## 🧾 Descripción

Sistema académico orientado a la gestión de proyectos de extensión universitaria. La plataforma permite a los usuarios registrar, solicitar, administrar y visualizar proyectos, basado en el patrón **MVT (Modelo-Vista-Template)** de Django.

### ✨ Funcionalidades principales

- 🔐 Registro y autenticación de usuarios
- 📝 Solicitud de proyectos de extensión
- 📊 Seguimiento y gestión de proyectos
- 📄 Elaboración y presentación de informes académicos

---

## 📁 Estructura del proyecto

```
proyecto_extension/
│
├── manage.py                        # Script principal de Django
├── README.md                        # Documentación del proyecto
├── requirements.txt                 # Dependencias
├── LICENSE
│
├── proyectos_extension/             # Configuración global del proyecto
│   ├── __init__.py
│   ├── settings.py                  # Configuraciones (BD, apps, seguridad, etc.)
│   ├── urls.py                      # Rutas principales
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   ├── core/                        # Módulo central
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── backends.py
│   │   ├── forms.py
│   │   └── tests.py
│   │
│   ├── usuarios/                    # Módulo de usuarios
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── backends.py
│   │   └── forms.py
│   │
│   ├── proyectos/                   # Módulo de proyectos
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── forms.py
│   │
│   └── informes/                    # Módulo de informes
│       └── migrations/
│
├── templates/
│   ├── base.html
│   ├── components/
│   │   ├── navbar.html
│   │   ├── sidebar.html
│   │   └── footer.html
│   │
│   ├── core/
│   │   ├── inicio.html
│   │   ├── lineas_accion.html
│   │   └── soporte_tecnico.html
│   │
│   ├── usuarios/
│   │   ├── login.html
│   │   └── perfil.html
│   │
│   ├── proyectos/
│   │   ├── nuevo_proyecto.html
│   │   ├── mis_proyectos.html
│   │   ├── detalle_repositorio.html
│   │   └── repositorio_proyectos.html
│   │
│   └── informes/
│       └── presentar_informe.html
│
├── static/
│   ├── css/
│   │   └── layout.css
│   ├── js/
│   └── assets/
│       ├── img/
│       └── icons/
│
└── media/
```

---

## ⚙️ Instalación y configuración

### 📋 Requisitos previos

**🐍 Python**
- Descargar desde: https://www.python.org/downloads/
- Durante la instalación, marcar `Add Python to PATH`
- Verificar: `python --version`

**🌐 Django**
- Instalar: `pip install django`
- Verificar: `django-admin --version`

---

### 🚀 Instalación del proyecto

**1. Clonar el repositorio**

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyectos_extension
git checkout desarrollo
```

**2. Crear y activar entorno virtual**

```bash
python -m venv venv
```

- Windows: `venv\Scripts\activate`
- Linux / macOS: `source venv/bin/activate`

**3. Instalar dependencias**

```bash
pip install -r requirements.txt
```

---

### 🗄️ Configuración de base de datos (PostgreSQL)

Crear una base de datos en PostgreSQL y configurar las credenciales en `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'nombre_bd',
        'USER': 'usuario_bd',
        'PASSWORD': 'password_bd',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

### 🧱 Migraciones iniciales

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 📦 Carga de datos iniciales

Después de las migraciones, crear los usuarios del sistema desde el shell de Django:

```bash
python manage.py shell
```

Dentro del shell, copiar y pegar el siguiente bloque completo:

```python
from django.contrib.auth import get_user_model

User = get_user_model()

usuarios = [
    {
        "first_name": "Nombre",
        "last_name": "Apellido",
        "username": "usuario1",
        "email": "usuario1@ejemplo.com",
        "password": "contraseña123",
        "rol": "rol_usuario",
    },
    {
        "first_name": "Nombre2",
        "last_name": "Apellido2",
        "username": "usuario2",
        "email": "usuario2@ejemplo.com",
        "password": "contraseña123",
        "rol": "rol_usuario",
    },
]

for data in usuarios:
    if not User.objects.filter(username=data["username"]).exists():
        user = User.objects.create_user(
            first_name=data["first_name"],
            last_name=data["last_name"],
            username=data["username"],
            email=data["email"],
            password=data["password"],
            rol=data["rol"],
        )
        print(f"Creado: {user.username}")
    else:
        print(f"Ya existe: {data['username']}")
```

---

### ▶️ Ejecutar el servidor

```bash
python manage.py runserver
```

Abrir en el navegador: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

### 🔐 Panel de administración

**Crear superusuario:**
```bash
python manage.py createsuperuser
```

**Acceder a:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 📌 Notas importantes

> ⚠️ Este proyecto es solo para **entorno de desarrollo**

- No subir credenciales reales al repositorio
- Si hay cambios en los modelos, ejecutar nuevamente:

```bash
python manage.py makemigrations
python manage.py migrate
```
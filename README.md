# Sistema Académico para Gestión de Proyectos de Extensión


## 👥 Autores
- María Duarte  
- Marcelo Vera  
- Yanina Martínez  

---

## 📁 Estructura del proyecto

    proyecto_academico/
    │
    ├── manage.py              # Script principal para ejecutar comandos de Django
    ├── README.md              # Documentación del proyecto
    ├── requirements.txt       # Dependencias del proyecto
    │
    ├── config/                # Configuración global del proyecto Django
    │   ├── __init__.py
    │   ├── settings.py        # Configuraciones (BD, apps, seguridad, etc.)
    │   ├── urls.py            # Rutas principales del sistema
    │   ├── asgi.py            # Configuración para despliegue asíncrono
    │   └── wsgi.py            # Configuración para servidores web
    │
    ├── apps/
    │   ├── usuarios/
    │   │   ├── models.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── forms.py
    │   │   └── admin.py
    │   │
    │   ├── proyectos/
    │   │   ├── models.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── forms.py
    │   │   └── admin.py
    │   │
    │   └── informes/
    │       ├── models.py
    │       ├── views.py
    │       ├── urls.py
    │       ├── forms.py
    │       └── admin.py
    │
    ├── templates/
    │   ├── base.html
    │   ├── usuarios/
    │   ├── proyectos/
    │   └── informes/
    │
    ├── static/
    │   ├── css/
    │   ├── js/
    │   └── img/
    │
    ├── media/
    │
    └── database/
        └── (conexión definida en settings.py)
        
---

## 🧾 Breve descripción del proyecto

Este proyecto consiste en el desarrollo de un sistema académico orientado a la gestión de proyectos de extensión universitaria. La plataforma permitirá a los usuarios registrar, solicitar, administrar y visualizar proyectos.

El sistema será desarrollado utilizando el framework **Django**, lo que permitirá una arquitectura robusta basada en el patrón MVT (Modelo-Vista-Template). Para la gestión de datos se utilizará **PostgreSQL**, garantizando eficiencia y escalabilidad en el manejo de la información.

### ⚙️ Funcionalidades principales

- Registro y autenticación de usuarios  
- Solicitud de proyectos de extensión  
- Seguimiento y gestión de proyectos  
- Elaboración de informes académicos

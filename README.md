# Sistema Académico para Gestión de Proyectos de Extensión

## 📌 Descripción
Sistema académico para poder solicitar proyectos de extensión y elaborar informes.

## 👥 Autores
- María Duarte  
- Marcelo Vera  
- Yanina Martínez  

---

## 📂 Estructura del proyecto
proyecto_academico/
│
├── manage.py # Script principal para ejecutar comandos de Django
├── README.md # Documentación del proyecto
├── requirements.txt # Dependencias del proyecto
│
├── config/ # Configuración global del proyecto Django
│ ├── init.py
│ ├── settings.py # Configuraciones (BD, apps, seguridad, etc.)
│ ├── urls.py # Rutas principales del sistema
│ ├── asgi.py # Configuración para despliegue asíncrono
│ └── wsgi.py # Configuración para servidores web
│
├── apps/ # Contiene las aplicaciones del sistema
│ │
│ ├── usuarios/ # Gestión de usuarios del sistema
│ │ ├── models.py # Modelo de usuario
│ │ ├── views.py # Lógica de vistas
│ │ ├── urls.py # Rutas de usuarios
│ │ ├── forms.py # Formularios
│ │ └── admin.py # Configuración en el admin de Django
│ │
│ ├── proyectos/ # Gestión de proyectos de extensión
│ │ ├── models.py # Modelo de proyectos
│ │ ├── views.py
│ │ ├── urls.py
│ │ ├── forms.py
│ │ └── admin.py
│ │
│ └── informes/ # Gestión de informes académicos
│ ├── models.py
│ ├── views.py
│ ├── urls.py
│ ├── forms.py
│ └── admin.py
│
├── templates/ # Plantillas HTML del sistema
│ ├── base.html # Plantilla base
│ ├── usuarios/ # Vistas de usuarios
│ ├── proyectos/ # Vistas de proyectos
│ └── informes/ # Vistas de informes
│
├── static/ # Archivos estáticos
│ ├── css/ # Estilos
│ ├── js/ # Scripts
│ └── img/ # Imágenes
│
├── media/ # Archivos subidos por usuarios (si aplica)
│
└── database/ # Configuración relacionada a PostgreSQL
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
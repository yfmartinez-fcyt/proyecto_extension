from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-fkl7q&q#ygl#=yif-4+97+9#e763j@+rs2^afvrz*_ts193n45'

DEBUG = True

ALLOWED_HOSTS = []

# -----------------------
# APPS
# -----------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'apps.core.apps.CoreConfig',
    'apps.usuarios.apps.UsuariosConfig',
    'apps.proyectos.apps.ProyectosConfig',
]

# -----------------------
# MIDDLEWARE
# -----------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'proyectos_extension.urls'

# -----------------------
# TEMPLATES
# (AQUÍ HAY MEJORA IMPORTANTE 👇)
# -----------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # 👈 IMPORTANTE
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'proyectos_extension.wsgi.application'

# -----------------------
# BASE DE DATOS (POSTGRES)
# -----------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'extension_db',
        'USER': 'postgres',
        'PASSWORD': '5605688',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# -----------------------
# USUARIO PERSONALIZADO
# -----------------------
AUTH_USER_MODEL = 'usuarios.Usuario'

AUTHENTICATION_BACKENDS = [
    'apps.usuarios.backends.EmailOrUsernameBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# -----------------------
# PASSWORDS
# -----------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# -----------------------
# INTERNACIONALIZACIÓN
# -----------------------
LANGUAGE_CODE = 'es-py'   # 👈 mejor para tu contexto

TIME_ZONE = 'America/Asuncion'  # 👈 recomendado

USE_I18N = True
USE_TZ = True

# -----------------------
# STATIC Y MEDIA
# -----------------------
STATIC_URL = 'static/'

STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# -----------------------
# LOGIN / LOGOUT
# -----------------------
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'inicio'
LOGOUT_REDIRECT_URL = 'inicio'
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import LoginForm

<<<<<<< HEAD

def login_view(request):
    if request.user.is_authenticated:
        return redirect('inicio')

    form = LoginForm(request.POST or None)

    if request.method == 'POST' and form.is_valid():
        identificador = form.cleaned_data['identificador']
        password = form.cleaned_data['password']

        user = authenticate(request, username=identificador, password=password)

        if user is not None:
            login(request, user)
            return redirect('inicio')

        messages.error(request, 'Credenciales incorrectas.')

    return render(request, 'usuarios/login.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('inicio')


@login_required
def ver_perfil(request):
    return render(request, 'usuarios/perfil.html')
=======
def soporte(request):
    enviado = False

    if request.method == 'POST':
        # Aquí luego puedes guardar en BD o enviar email
        enviado = True

    return render(request, 'soporte.html', {
        'enviado': enviado
    })
>>>>>>> 2618179c47cb6f73b87dd7543460c7b6ae5f5c5b

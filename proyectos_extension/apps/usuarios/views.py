from django.shortcuts import render

def soporte(request):
    enviado = False

    if request.method == 'POST':
        # Aquí luego puedes guardar en BD o enviar email
        enviado = True

    return render(request, 'soporte.html', {
        'enviado': enviado
    })
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def presentar_informe(request):
    return render(request, 'informes/presentar_informe.html')
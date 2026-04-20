from django import forms

class LoginForm(forms.Form):
    identificador = forms.CharField(
        label='Correo o usuario',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Correo institucional o username'
        })
    )

    password = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Contraseña'
        })
    )
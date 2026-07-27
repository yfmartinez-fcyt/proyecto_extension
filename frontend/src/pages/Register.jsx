import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateRegisterForm } from '../utils/validators';


export default function Register() {

    const { register } = useAuth();
    const navigate = useNavigate();


    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        username: '',
        email: '',
        password: '',
    });


    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);



    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

    };



    const handleSubmit = async (event) => {

        event.preventDefault();

        setError('');



        const validationError = validateRegisterForm(form);


        if (validationError) {

            setError(validationError);

            return;

        }



        setLoading(true);



        try {


            await register({

                nombre: form.nombre.trim(),

                apellido: form.apellido.trim(),

                username: form.username.trim(),

                email: form.email.trim().toLowerCase(),

                password: form.password,

            });



            navigate('/login', {
                state: {
                    registered: true
                }
            });



        } catch (err) {


            setError(
                err.message || 'No se pudo registrar'
            );


        } finally {


            setLoading(false);


        }

    };



    return (

        <div className="auth-page">


            <div className="auth-card">


                <div className="auth-icon">
                    <i className="bi bi-person-plus-fill"></i>
                </div>



                <div className="auth-header">

                    <h1>
                        Crear cuenta
                    </h1>

                    <p>
                        Regístrate para participar en proyectos de extensión.
                    </p>

                </div>




                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >



                    {error && (

                        <div className="auth-error">
                            {error}
                        </div>

                    )}




                    <label>

                        Nombre

                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            minLength={2}
                            required
                            autoComplete="given-name"
                        />

                    </label>




                    <label>

                        Apellido

                        <input
                            type="text"
                            name="apellido"
                            value={form.apellido}
                            onChange={handleChange}
                            minLength={2}
                            required
                            autoComplete="family-name"
                        />

                    </label>

                    <label>
                        Nombre de usuario

                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="usuario123"
                            minLength={4}
                            required
                        />

                    </label>




                    <label>

                        Email

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />

                    </label>




                    <label>

                        Contraseña

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            minLength={8}
                            required
                            autoComplete="new-password"
                        />


                        <small className="field-hint">

                            Mínimo 8 caracteres con mayúsculas,
                            minúsculas, números y caracteres especiales.

                        </small>


                    </label>




                    <div className="auth-actions">


                        <button
                            type="submit"
                            className="auth-btn-primary"
                            disabled={loading}
                        >

                            {loading
                                ? 'Creando cuenta...'
                                : 'Registrarme'
                            }

                        </button>




                        <Link
                            to="/"
                            className="auth-btn-secondary"
                        >

                            Volver al inicio

                        </Link>


                    </div>




                </form>





                <p className="auth-footer">

                    ¿Ya tienes cuenta?{' '}

                    <Link to="/login">
                        Inicia sesión
                    </Link>


                </p>




            </div>


        </div>

    );

}
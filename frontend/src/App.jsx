import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import LineasAccion from './pages/LineasAccion';
import Soporte from './pages/Soporte';
import MisProyectos from './pages/MisProyectos';
import WizardProyecto from './pages/WizardProyecto';
import Repositorio from './pages/Repositorio';
import DetalleRepositorio from './pages/DetalleRepositorio';
import DirectorDashboard from './pages/DirectorDashboard';
import DirectorRevision from './pages/DirectorRevision';
import PresentarInforme from './pages/PresentarInforme';
import './styles/director.css';
import ODS from './pages/ODS';


function BodyClassManager() {
  const location = useLocation();
  useEffect(() => {
    const isDirector = location.pathname.startsWith('/director');
    document.body.classList.toggle('director-portal', isDirector);
    document.body.classList.add('app-body');
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <BodyClassManager />
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Layout />
            </GuestRoute>
          }
        >
          <Route index element={<Login />} />
        </Route>

        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/lineas-de-accion" element={<LineasAccion />} />
          <Route path="/soporte-tecnico" element={<Soporte />} />
          <Route path="/proyectos/repositorio" element={<Repositorio />} />
          <Route path="/proyectos/detalle/:id" element={<DetalleRepositorio />} />
          <Route path="/ods" element={<ODS />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyectos/mis-proyectos"
            element={
              <ProtectedRoute roles={['alumno', 'docente', 'admin']}>
                <MisProyectos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyectos/nuevo"
            element={
              <ProtectedRoute roles={['alumno', 'docente', 'admin']}>
                <WizardProyecto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyectos/editar/:id"
            element={
              <ProtectedRoute roles={['alumno', 'docente', 'admin']}>
                <WizardProyecto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/informes/presentar"
            element={
              <ProtectedRoute roles={['alumno', 'docente', 'admin']}>
                <PresentarInforme />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['director_extension', 'admin']}>
              <Layout director />
            </ProtectedRoute>
          }
        >
          <Route path="/director" element={<DirectorDashboard />} />
          <Route path="/director/revision/:id" element={<DirectorRevision />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

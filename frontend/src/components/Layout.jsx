import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Cierra el offcanvas sin bloquear la navegación de React Router. */
function closeOffcanvas(canvasId) {
  const el = document.getElementById(canvasId);
  if (!el || !window.bootstrap?.Offcanvas) return;
  const instance =
    window.bootstrap.Offcanvas.getInstance(el) ||
    window.bootstrap.Offcanvas.getOrCreateInstance(el);
  instance.hide();
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="custom-footer" role="contentinfo">
      <div className="footer-container">
        <p className="footer-line">
          <span className="footer-institution">FCyT — UNCA</span>
          <span className="footer-sep">|</span>
          <span className="footer-copy">
            © {year} <strong>Sistema de Gestión de Proyectos de Extensión</strong>. Todos los derechos
            reservados.
          </span>
          <span className="footer-sep">|</span>
          <span className="footer-team-label">Desarrollado por</span>
          <span className="footer-dev-links">
            <a
              href="https://www.linkedin.com/in/mar%C3%ADa-duarte-a07949404"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-dev-link"
              aria-label="María Rogelia Duarte Ríos en LinkedIn"
              data-bs-toggle="popover"
              data-bs-trigger="hover focus"
              data-bs-placement="top"
              data-bs-content="María Rogelia Duarte Ríos"
            >
              MD
            </a>
            <a
              href="https://www.linkedin.com/in/yanina-fabiana-mart%C3%ADnez-villaverde-0a230b300"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-dev-link"
              aria-label="Yanina Fabiana Martínez Villaverde en LinkedIn"
              data-bs-toggle="popover"
              data-bs-trigger="hover focus"
              data-bs-placement="top"
              data-bs-content="Yanina Fabiana Martínez Villaverde"
            >
              YM
            </a>
            <a
              href="https://www.linkedin.com/in/marcelo-vera-figueredo-5607b725b"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-dev-link"
              aria-label="Marcelo David Vera Figueredo en LinkedIn"
              data-bs-toggle="popover"
              data-bs-trigger="hover focus"
              data-bs-placement="top"
              data-bs-content="Marcelo David Vera Figueredo"
            >
              MV
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}

function PublicSidebar() {
  const { isAuthenticated, isDirector, isProponente } = useAuth();

  const linkClass = ({ isActive }) => `nav-link sidebar-link${isActive ? ' active' : ''}`;
  const onNav = () => closeOffcanvas('sidebarCanvas');

  return (
    <div className="offcanvas offcanvas-start" tabIndex={-1} id="sidebarCanvas">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Menú principal</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar" />
      </div>
      <div className="offcanvas-body p-0">
        <ul className="nav flex-column p-3 gap-2">
          <li className="nav-item">
            <NavLink className={linkClass} to="/" end onClick={onNav}>
              <i className="bi bi-house me-2" />
              Inicio
            </NavLink>
          </li>

          {isAuthenticated && isDirector ? (
            <li className="nav-item">
              <NavLink className={linkClass} to="/director" onClick={onNav}>
                <i className="bi bi-shield-check me-2" />
                Portal Director
              </NavLink>
            </li>
          ) : null}

          {isAuthenticated && !isDirector && isProponente ? (
            <>
              <li className="nav-item">
                <NavLink className={linkClass} to="/proyectos/nuevo" onClick={onNav}>
                  <i className="bi bi-plus-circle me-2" />
                  Nuevo Proyecto
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={linkClass} to="/proyectos/mis-proyectos" onClick={onNav}>
                  <i className="bi bi-folder2-open me-2" />
                  Mis Proyectos
                </NavLink>
              </li>
            </>
          ) : null}

          <li className="nav-item">
            <NavLink className={linkClass} to="/lineas-de-accion" onClick={onNav}>
              <i className="bi bi-diagram-3 me-2" />
              Líneas de acción
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={linkClass} to="/proyectos/repositorio" onClick={onNav}>
              <i className="bi bi-archive me-2" />
              Repositorio de Proyectos
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

function DirectorSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    closeOffcanvas('directorSidebarCanvas');
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `nav-link sidebar-link${isActive ? ' active' : ''}`;
  const onNav = () => closeOffcanvas('directorSidebarCanvas');

  return (
    <div className="offcanvas offcanvas-start director-sidebar" tabIndex={-1} id="directorSidebarCanvas">
      <div className="offcanvas-header sidebar-header">
        <h5 className="offcanvas-title mobile-title">Menú institucional</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar" />
      </div>
      <div className="offcanvas-body p-0">
        <ul className="nav flex-column p-3 gap-2">
          <li className="nav-item">
            <NavLink className={linkClass} to="/director" end onClick={onNav}>
              <i className="bi bi-inbox-fill me-2" />
              Bandeja pendientes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={linkClass} to="/proyectos/repositorio" onClick={onNav}>
              <i className="bi bi-archive me-2" />
              Proyectos aprobados
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={linkClass} to="/lineas-de-accion" onClick={onNav}>
              <i className="bi bi-diagram-3 me-2" />
              Líneas de acción
            </NavLink>
          </li>
          <li className="nav-item mt-2">
            <button
              type="button"
              className="nav-link sidebar-link text-danger border-0 bg-transparent w-100 text-start"
              onClick={onLogout}
            >
              <i className="bi bi-box-arrow-right me-2" />
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Navbar({ director }) {
  const { user, isAuthenticated, isDirector, logout } = useAuth();
  const navigate = useNavigate();
  const canvasTarget = director ? '#directorSidebarCanvas' : '#sidebarCanvas';

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.nombre || user?.username || 'Usuario';

  return (
    <nav className={`navbar sticky-top custom-navbar${director ? ' director-navbar' : ''}`}>
      <div className="container-fluid app-navbar-inner">
        <button
          className="btn btn-outline-primary app-menu-btn"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target={canvasTarget}
        >
          <i className="bi bi-list" />
        </button>

        <Link className="navbar-brand d-flex align-items-center gap-3" to={director ? '/director' : '/'}>
          <span
            className={`navbar-logo-icon ${director ? 'd-inline-flex' : 'd-none d-md-inline-flex'}`}
            aria-hidden="true"
          >
            <i className={`bi ${director ? 'bi-shield-check' : 'bi-mortarboard-fill'}`} />
          </span>
          {!director && <span className="mobile-title d-md-none">Sistema de Proyectos</span>}
          <div className={`brand-text ${director ? '' : 'd-none d-md-block'}`}>
            <span className="system-name d-block">
              {director
                ? 'Portal Director de Extensión'
                : 'Sistema de Gestión de Proyectos de Extensión'}
            </span>
            <small className="system-subtitle">
              {director ? 'FCyT — UNCA · Revisión institucional' : 'FCyT - UNCA'}
            </small>
          </div>
        </Link>

        <div className="d-flex align-items-center gap-2 gap-md-3 app-navbar-actions">
          {!director && (
            <>
              <Link
                to="/soporte-tecnico"
                className="btn btn-outline-secondary btn-support d-none d-lg-inline-flex"
              >
                <i className="bi bi-headset me-1" /> Soporte Técnico
              </Link>
              <Link to="/soporte-tecnico" className="btn btn-outline-secondary d-lg-none">
                <i className="bi bi-headset" />
              </Link>
            </>
          )}

          {director && <span className="director-badge-role d-none d-md-inline">Director</span>}

          {isAuthenticated ? (
            <div className="dropdown">
              <button
                className="btn user-dropdown-btn dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span className="profile-avatar profile-avatar-fallback" aria-hidden="true">
                  <i className={`bi ${director ? 'bi-person-badge-fill' : 'bi-person-fill'}`} />
                </span>
                <div className="welcome-text text-start d-none d-md-block">
                  <small className="text-muted d-block">
                    {director ? 'Sesión institucional' : 'Bienvenido/a'}
                  </small>
                  <span>{displayName}</span>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 p-2">
                <li className="dropdown-header">
                  <strong>
                    {user?.nombre} {user?.apellido}
                  </strong>
                  <br />
                  <small className="text-muted">{user?.email}</small>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                {director ? (
                  <>
                    <li>
                      <Link className="dropdown-item rounded-3" to="/director">
                        <i className="bi bi-inbox me-2" />
                        Bandeja de revisión
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item rounded-3" to="/proyectos/repositorio">
                        <i className="bi bi-archive me-2" />
                        Repositorio aprobados
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link className="dropdown-item rounded-3" to="/perfil">
                        <i className="bi bi-person-circle me-2" />
                        Ver perfil
                      </Link>
                    </li>
                    {isDirector ? (
                      <li>
                        <Link className="dropdown-item rounded-3" to="/director">
                          <i className="bi bi-shield-check me-2" />
                          Portal Director
                        </Link>
                      </li>
                    ) : (
                      <li>
                        <Link className="dropdown-item rounded-3" to="/proyectos/mis-proyectos">
                          <i className="bi bi-folder2-open me-2" />
                          Mis proyectos
                        </Link>
                      </li>
                    )}
                  </>
                )}
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item rounded-3 text-danger"
                    onClick={onLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2" />
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Layout({ director = false }) {
  return (
    <>
      {director ? <DirectorSidebar /> : <PublicSidebar />}
      <div className="page-shell">
        <Navbar director={director} />
        <div className="app-wrapper">
          <main className="main-content">
            <div className="container-fluid app-page-container py-3 py-md-4">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

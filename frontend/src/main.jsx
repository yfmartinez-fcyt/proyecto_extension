import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/layout.css';

function Root() {
  useEffect(() => {
    const initPopovers = () => {
      const bootstrap = window.bootstrap;
      if (!bootstrap?.Popover) return;
      document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => {
        bootstrap.Popover.getOrCreateInstance(el);
      });
    };
    initPopovers();
    const t = setTimeout(initPopovers, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />);

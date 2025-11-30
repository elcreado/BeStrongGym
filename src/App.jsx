import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import IniciarSesion from './pages/IniciarSesion.jsx';
import Staff from './pages/Staff.jsx';

function Layout({ children }) {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  return (
    <>
      <header className="top-bar">
        <div className="container">
          <h1 className="brand">Be Strong Gym</h1>
          <nav className="top-nav" aria-label="Principal">
            <Link to="/#nosotros">Nosotros</Link>
            <Link to="/#planes">Planes</Link>
            <Link to="/#contacto">Contacto</Link>
            <Link to="/staff">Staff</Link>
            <Link to="/iniciar-sesion">Acceso</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="container footer__layout">
          <p>&copy; {currentYear} Be Strong Gym. Fuerza con proposito.</p>
          <div className="footer__links">
            <Link to="/#nosotros">Nosotros</Link>
            <Link to="/#planes">Planes</Link>
            <Link to="/#contacto">Contacto</Link>
            <a href="mailto:hola@bestronggym.com">Contacto directo</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function NotFound() {
  return (
    <section className="container" style={{ padding: '4rem 0' }}>
      <h2>Pagina no encontrada</h2>
      <p>La direccion solicitada no existe. Regresa al inicio para seguir explorando.</p>
      <Link className="btn btn--primary" to="/">
        Volver al inicio
      </Link>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

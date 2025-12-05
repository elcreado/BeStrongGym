import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { loadMemberships } from '../utils/dataStore.js';

const stats = [
  { label: 'Clases semanales', value: '+45' },
  { label: 'Acceso al gimnasio', value: '24/7' },
  { label: 'Entrenadores expertos', value: '12' },
];

const focusCards = [
  {
    title: 'Entrenamiento funcional',
    description: 'Sesiones variadas con pesas rusas, barras y peso corporal para desarrollar fuerza util y movilidad.',
  },
  {
    title: 'Plan nutricional',
    description: 'Asesoria de nutricionistas para potenciar tu rendimiento y recuperacion dia a dia.',
  },
  {
    title: 'Seguimiento inteligente',
    description: 'Reportes de progreso mensuales y ajustes de rutina basados en tus metricas reales.',
  },
];

const visitCards = [
  {
    title: 'Ubicacion',
    description: (
      <>
        Calle 45 #12-34, Local 5
        <br />
        Barrio Chapinero, Bogota D.C.
      </>
    ),
  },
  {
    title: 'Horarios',
    description: (
      <>
        Lunes a viernes: 5:00 a.m. - 10:00 p.m.
        <br />
        Sabados: 7:00 a.m. - 6:00 p.m.
        <br />
        Domingos y festivos: 8:00 a.m. - 2:00 p.m.
      </>
    ),
  },
  {
    title: 'Contacto',
    description: (
      <>
        Tel: (601) 456 7890
        <br />
        WhatsApp: +57 310 000 0000
        <br />
        Correo: hola@bestronggym.co
      </>
    ),
  },
];

function Home() {
  const [plans, setPlans] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const fetchPlans = async () => {
      const data = await loadMemberships();

      const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

      const mappedPlans = data.map(m => ({
        id: m.name,
        name: m.name,
        priceText: formatCurrency(m.price),
        badge: m.recommended ? 'Recomendado' : null,
        features: [
          `Vigencia de ${m.durationDays} dias`,
          'Acceso completo a instalaciones',
          'Seguimiento digital incluido'
        ],
        note: 'Solicita tu inscripcion en recepcion.'
      }));
      setPlans(mappedPlans);
    };
    fetchPlans();
  }, []);

  const handleNext = () => {
    if (plans.length <= 3) return;
    setStartIndex((prev) => {
      const nextIndex = prev + 3;
      // Clamp to show the last 3 items if steps go beyond
      if (nextIndex + 3 > plans.length) {
        return Math.max(0, plans.length - 3);
      }
      return nextIndex;
    });
  };

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 3, 0));
  };

  // Logic: We render ALL plans in a horizontal track, and transform the track to show the correct view.
  // View is 3 items wide.
  // Transform percentage: -1 * startIndex * (100% / 3).
  // Why? Because each item is 33.33% wide. Moving by 1 item moves 33.33%.
  const trackTransform = `translateX(-${startIndex * (100 / 3)}%)`;

  const isAtEnd = startIndex + 3 >= plans.length || (plans.length > 3 && startIndex >= plans.length - 3);

  return (
    <>
      <section className="hero" id="nosotros">
        <div className="container hero__content">
          <div className="hero__text">
            <h2>Entrena con proposito, progresa con disciplina.</h2>
            <p>
              En Be Strong Gym contamos con entrenadores certificados, rutinas personalizadas y una comunidad enfocada
              en ayudarte a alcanzar tus objetivos. La fuerza, la resistencia y el bienestar integral se construyen con
              habitos constantes, y aqui encuentras el espacio perfecto para lograrlos.
            </p>
            <div className="hero__cta">
              <Link className="btn btn--primary" to="/#planes">
                Explorar planes
              </Link>
              <Link className="btn btn--ghost" to="/#contacto">
                Visitanos
              </Link>
            </div>
          </div>
          <div className="hero__highlight">
            {stats.map((stat) => (
              <div className="highlight-card" key={stat.label}>
                <p className="highlight-card__number">{stat.value}</p>
                <p className="highlight-card__label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="focus" aria-label="Enfoque del gimnasio">
        <div className="container focus__grid">
          {focusCards.map((card) => (
            <article className="focus-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="plans" id="planes" aria-labelledby="planes-title">
        <div className="container">
          <div className="section-heading">
            <h2 id="planes-title">Planes de entrenamiento</h2>
            <p>
              Selecciona el plan que mejor se adapte a tu ritmo. Todos incluyen acceso total a las instalaciones,
              seguimiento digital y zona de recuperacion. La inscripcion se completa directamente en nuestras
              instalaciones.
            </p>
          </div>

          <div className="carousel-container">
            {plans.length > 3 && (
              <button
                className="carousel-btn"
                onClick={handlePrev}
                disabled={startIndex === 0}
                aria-label="Anterior"
              >
                &#8249;
              </button>
            )}

            <div className="carousel-viewport">
              <div className="plans__track" style={{ transform: trackTransform }}>
                {plans.map((plan) => (
                  <div className="plan-card-wrapper" key={plan.id}>
                    <article
                      className={`plan-card${plan.badge ? ' plan-card--featured' : ''}`}
                      data-plan={plan.name}
                      data-price={plan.priceText}
                    >
                      <header>
                        {plan.badge ? <div className="plan-card__badge">{plan.badge}</div> : null}
                        <h3>{plan.name}</h3>
                        <p className="plan-card__price">
                          {plan.priceText} <span>COP / mes</span>
                        </p>
                      </header>
                      <ul>
                        {plan.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                      <p className="plan-card__note">{plan.note}</p>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {plans.length > 3 && (
              <button
                className="carousel-btn"
                onClick={handleNext}
                disabled={isAtEnd}
                aria-label="Siguiente"
              >
                &#8250;
              </button>
            )}
          </div>

        </div>
      </section>

      <section className="visit" id="contacto" aria-labelledby="contacto-title">
        <div className="container visit__layout">
          <div className="section-heading">
            <h2 id="contacto-title">Visitanos para inscribirte</h2>
            <p>
              El proceso de inscripcion se realiza de forma presencial para garantizar un acompanamiento personalizado.
              Nuestro equipo estara listo para evaluar tus objetivos y ayudarte a elegir el plan ideal.
            </p>
          </div>
          <div className="visit__details">
            {visitCards.map((card) => (
              <article className="visit-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="acceso-title">
        <div className="container">
          <div className="section-heading">
            <h2 id="acceso-title">Registro y acceso</h2>
            <p>
              Para registrarte a cualquiera de nuestros planes acercate a la recepcion del gimnasio y solicita tu alta
              con el equipo de Be Strong Gym.
            </p>
            <div className="access__cta">
              <p>Si ya estas registrado puedes ver tu plan iniciando sesion con tu nombre.</p>
              <Link className="btn btn--primary" to="/iniciar-sesion">
                Iniciar sesion
              </Link>
            </div>
            <p className="form-note">
              El equipo de recepcion te ayudara a completar el proceso y resolver cualquier duda que tengas.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;

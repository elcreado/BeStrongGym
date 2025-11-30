import { Link } from 'react-router-dom';

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

const plans = [
  {
    id: 'esencial',
    name: 'Plan Esencial',
    priceText: '$45.000',
    badge: null,
    features: ['Acceso ilimitado a sala de pesas', '2 evaluaciones fisicas al anio', 'Clases grupales base'],
    note: 'Solicita tu inscripcion en recepcion.',
  },
  {
    id: 'avanzado',
    name: 'Plan Avanzado',
    priceText: '$65.000',
    badge: 'Recomendado',
    features: ['Clases ilimitadas de alta intensidad', 'Plan nutricional personalizado', 'Evaluacion mensual con entrenador'],
    note: 'El equipo de recepcion completara tu registro.',
  },
  {
    id: 'elite',
    name: 'Plan Elite',
    priceText: '$90.000',
    badge: null,
    features: ['Entrenador personal dedicado', 'Sesiones premium de fisioterapia', 'Acceso VIP a eventos especiales'],
    note: 'Reserva tu cupo directamente en nuestras instalaciones.',
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
          <div className="plans__grid">
            {plans.map((plan) => (
              <article
                className={`plan-card${plan.badge ? ' plan-card--featured' : ''}`}
                key={plan.id}
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
            ))}
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

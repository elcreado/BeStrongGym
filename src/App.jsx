import { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const plans = [
  {
    id: 'esencial',
    name: 'Plan Esencial',
    price: 29,
    description: 'Perfecto para dar tus primeros pasos y mantenerte activo con supervisión experta.',
    features: ['Acceso ilimitado a sala de musculación', 'Clases grupales básicas', 'Evaluación física inicial'],
  },
  {
    id: 'intenso',
    name: 'Plan Intenso',
    price: 49,
    description: 'Eleva tu rendimiento con entrenamientos personalizados y seguimiento continuo.',
    features: [
      'Todo lo incluido en Plan Esencial',
      'Rutinas personalizadas por objetivos',
      'Seguimiento nutricional mensual',
      'Reservas prioritarias en clases especiales',
    ],
    badge: 'Más popular',
  },
  {
    id: 'elite',
    name: 'Plan Elite',
    price: 79,
    description: 'La experiencia Be Strong definitiva con acompañamiento total y beneficios VIP.',
    features: [
      'Acceso ilimitado 24/7 y zonas premium',
      'Sesiones semanales con entrenador personal',
      'Plan nutricional avanzado y biometría',
      'Invitaciones exclusivas a eventos Be Strong',
    ],
  },
];

function PlanCard({ plan, onSelect }) {
  return (
    <article className="plan-card">
      {plan.badge ? <span className="plan-badge">{plan.badge}</span> : null}
      <h3>{plan.name}</h3>
      <p>{plan.description}</p>
      <p className="plan-price">
        <span style={{ fontSize: '1rem', color: '#a1a1a1' }}>€</span>
        {plan.price}
        <span style={{ fontSize: '1rem', color: '#a1a1a1' }}>/mes</span>
      </p>
      <ul className="plan-features">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button className="primary-btn" onClick={() => onSelect(plan)}>
        Elegir este plan
      </button>
    </article>
  );
}

function CurrentSubscription({ subscription }) {
  if (!subscription) {
    return (
      <div className="subscription-card">
        <span className="status-tag">Sin suscripción</span>
        <div className="subscription-summary">
          <strong>Aún no te has unido a la familia Be Strong</strong>
          <p>
            Elige uno de nuestros planes para disfrutar de entrenamientos diseñados para superar tus límites,
            clases dinámicas y el acompañamiento del equipo Be Strong Gym.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-card">
      <span className="status-tag">Activa</span>
      <div className="subscription-summary">
        <strong>{subscription.name}</strong>
        <p>
          Tu cuota mensual es de <span style={{ color: 'var(--color-accent)' }}>€{subscription.price}</span> e
          incluye:
        </p>
        <ul className="plan-features">
          {subscription.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p>
          Puedes cambiar de plan en cualquier momento. Nuestro equipo está listo para ayudarte a alcanzar tu mejor
          versión.
        </p>
      </div>
    </div>
  );
}

function FakePayment({ plan, onConfirm, onCancel }) {
  if (!plan) return null;

  return (
    <div className="payment-placeholder">
      <div>
        <h3>Simulador de pago Be Strong</h3>
        <p>
          Este es un paso de demostración para validar el flujo de suscripción. No se realizará ningún cargo real.
          Puedes continuar para activar el plan <strong>{plan.name}</strong> o cancelar para seguir explorando.
        </p>
      </div>
      <div className="payment-actions">
        <button className="primary-btn" onClick={() => onConfirm(plan)}>
          Confirmar pago ficticio
        </button>
        <button className="secondary-btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function App() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  const planHighlights = useMemo(
    () => [
      {
        title: 'Entrena sin límites',
        description:
          'Instalaciones renovadas con equipamiento de última generación, zonas funcionales y espacios para cada objetivo.',
      },
      {
        title: 'Estrategia personalizada',
        description:
          'Evaluaciones periódicas, seguimiento profesional y rutinas adaptadas para que avances con seguridad.',
      },
      {
        title: 'Comunidad Be Strong',
        description:
          'Eventos exclusivos, workshops y retos mensuales que te mantienen motivado rodeado de la mejor energía.',
      },
    ],
    [],
  );

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleConfirmPayment = (plan) => {
    setCurrentSubscription(plan);
    setSelectedPlan(null);
  };

  const handleCancelPayment = () => {
    setSelectedPlan(null);
  };

  return (
    <BrowserRouter>
      {/* <Layout> es opcional, si no existe, quítalo */}
      <Layout> 
        <Routes>
          {/* Asegúrate de que los nombres de los componentes coincidan con tus importaciones */}
          <Route path="/" element={<Home />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/iniciarSesion" element={<IniciarSesion />} />
          <Route path="*" element={<div>Página no encontrada (404)</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

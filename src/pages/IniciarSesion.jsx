import { useState } from 'react';
import { loadClients } from '../utils/dataStore.js';

const planPrices = {
  Esencial: 45000,
  Avanzado: 65000,
  Elite: 90000,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Sin fecha registrada';

const normalizeName = (value) => value.trim().toLowerCase();

function IniciarSesion() {
  const [clientName, setClientName] = useState('');
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = clientName.trim();
    if (!value) {
      setError('Ingresa el nombre con el que te registro el staff en recepcion.');
      setClient(null);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const clients = await loadClients({ refresh: true });
      const found = clients.find((entry) => normalizeName(entry.name || '') === normalizeName(value));
      if (!found) {
        setClient(null);
        setError('No encontramos tu nombre en el archivo local. Solicita tu registro en recepcion.');
        return;
      }
      setClient(found);
    } catch (loadError) {
      console.error(loadError);
      setClient(null);
      setError('No se pudo validar tu informacion. Intenta de nuevo en unos segundos.');
    } finally {
      setIsLoading(false);
    }
  };

  const weightText = Number.isFinite(client?.weight) ? `${client.weight} kg` : 'Sin registrar';
  const heightText = Number.isFinite(client?.height) ? `${client.height} cm` : 'Sin registrar';
  const validityText = client?.validityMonths
    ? `${client.validityMonths} ${client.validityMonths === 1 ? 'mes' : 'meses'}`
    : 'Sin vigencia definida';
  const expirationText = formatDate(client?.paymentExpiration);

  return (
    <section className="access" id="acceso" aria-labelledby="acceso-title">
      <div className="container access__layout">
        <div className="access__intro">
          <h2 id="acceso-title">Registro y acceso</h2>
          <p>
            Para registrarte a cualquiera de nuestros planes acercate a la recepcion del gimnasio y solicita tu alta con
            el equipo de Be Strong Gym.
          </p>
          <div className="access__cta">
            <p>Si ya estas registrado puedes ver tu plan ingresando sesion con tu nombre.</p>
          </div>
          <p className="form-note">
            El equipo de recepcion te ayudara a completar el proceso y resolver cualquier duda que tengas.
          </p>
        </div>
        <div className="access__panel">
          <form className="user-login" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <span>Nombre registrado</span>
              <input
                type="text"
                name="user-name"
                autoComplete="name"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                required
              />
            </div>
            <button className="btn btn--primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Buscando...' : 'Ver mi plan'}
            </button>
            <p className="form-note" id="login-helper">
              La sesion se valida con el archivo local de clientes registrado por el staff.
            </p>
            {error ? (
              <p className="form-note form-note--error" role="alert" aria-live="polite">
                {error}
              </p>
            ) : null}
          </form>
          {client ? (
            <article className="user-plan" aria-live="polite">
              <p className="form-note">Hola {client.name}, estos son los datos encontrados en el archivo local.</p>
              <div className="user-plan__header">
                <h3>{client.plan || 'Plan no asignado'}</h3>
                <span className="user-plan__price">{formatCurrency(planPrices[client.plan] ?? 0)}</span>
              </div>
              <dl className="user-plan__details">
                <div>
                  <dt>Peso</dt>
                  <dd>{weightText}</dd>
                </div>
                <div>
                  <dt>Altura</dt>
                  <dd>{heightText}</dd>
                </div>
                <div>
                  <dt>Vigencia</dt>
                  <dd>{validityText}</dd>
                </div>
                <div>
                  <dt>Caducidad</dt>
                  <dd>{expirationText}</dd>
                </div>
              </dl>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default IniciarSesion;

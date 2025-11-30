import { useMemo, useState } from 'react';
import { loadClients, upsertClient } from '../utils/dataStore.js';

const STAFF_USERNAME = 'staff';
const STAFF_PASSWORD = 'admin123';

const planPrices = {
  Esencial: 45000,
  Avanzado: 65000,
  Elite: 90000,
};

const normalizeName = (value) => value.trim().toLowerCase();

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
    : 'Sin fecha';

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayISO = today.toISOString().split('T')[0];

function Staff() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    plan: '',
    weight: '',
    height: '',
    validityMonths: '',
    paymentExpiration: '',
  });

  const sortedClients = useMemo(
    () => clients.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [clients],
  );

  const fetchClients = async () => {
    const data = await loadClients({ refresh: true });
    setClients(data);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (normalizeName(username) === STAFF_USERNAME && password.trim() === STAFF_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      setUsername('');
      setPassword('');
      setRegistrationError('');
      await fetchClients();
    } else {
      setIsAuthenticated(false);
      setLoginError('Credenciales incorrectas. Usa el usuario STAFF y la contrasena establecida.');
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleValidityChange = (value) => {
    const months = Number(value);
    let paymentExpiration = '';
    if (Number.isFinite(months) && months > 0) {
      const baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);
      baseDate.setMonth(baseDate.getMonth() + months);
      paymentExpiration = baseDate.toISOString().split('T')[0];
    }
    setFormData((prev) => ({
      ...prev,
      validityMonths: value,
      paymentExpiration,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      plan: '',
      weight: '',
      height: '',
      validityMonths: '',
      paymentExpiration: '',
    });
  };

  const handleRegistration = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setRegistrationError('Inicia sesion como STAFF para registrar clientes.');
      setRegistrationMessage('');
      return;
    }

    const name = formData.name.trim();
    const plan = formData.plan.trim();
    const validityMonths = Number(formData.validityMonths);
    const paymentExpiration = formData.paymentExpiration.trim();
    if (!name || !plan || !validityMonths || !paymentExpiration) {
      setRegistrationError('Completa los campos obligatorios para guardar el registro.');
      setRegistrationMessage('');
      return;
    }

    setRegistrationError('');
    try {
      await upsertClient({
        name,
        plan,
        weight: Number.isFinite(Number(formData.weight)) ? Number(formData.weight) : undefined,
        height: Number.isFinite(Number(formData.height)) ? Number(formData.height) : undefined,
        validityMonths,
        paymentExpiration,
        createdAt: new Date().toISOString(),
      });
      setRegistrationMessage('Cliente guardado en el archivo local.');
      resetForm();
      await fetchClients();
    } catch (error) {
      console.error(error);
      setRegistrationError('No se pudo guardar el registro. Intenta de nuevo.');
      setRegistrationMessage('');
    }
  };

  const handleRefresh = async () => {
    if (!isAuthenticated) {
      setRegistrationError('Primero inicia sesion como STAFF.');
      setRegistrationMessage('');
      return;
    }

    setRegistrationError('');
    await fetchClients();
  };

  return (
    <section className="staff staff--page" id="panel">
      <div className="container staff__container">
          <div className="section-heading">
            <p className="form-note">Acceso restringido</p>
            <h2>Area administrativa</h2>
            <p>
              El apartado Staff solo es visible cuando inicias sesion como <strong>STAFF</strong>. Introduce las
              credenciales para gestionar el archivo local de clientes y registrar nuevas inscripciones.
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="staff-card" id="staff-access">
              <form className="staff-login" onSubmit={handleLogin}>
                <div className="form-row">
                  <label className="form-field">
                    <span>Usuario</span>
                    <input
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Contrasena</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </label>
                </div>
                <button className="btn btn--primary" type="submit">
                  Ingresar como STAFF
                </button>
                {loginError ? (
                  <p className="form-note staff-login__error" role="alert" aria-live="polite">
                    {loginError}
                  </p>
                ) : null}
              </form>
            </div>
          ) : (
            <div className="staff-card staff-card--workspace" id="staff-workspace">
              <div className="staff-unlocked">
                <form className="staff-registration" onSubmit={handleRegistration} noValidate>
                  <div className="form-row">
                    <label className="form-field">
                      <span>Nombre del cliente</span>
                      <input
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        onChange={(event) => handleFieldChange('name', event.target.value)}
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Tipo de plan pagado</span>
                      <select
                        value={formData.plan}
                        onChange={(event) => handleFieldChange('plan', event.target.value)}
                        required
                      >
                        <option value="">Selecciona una opcion</option>
                        <option value="Esencial">Plan Esencial</option>
                        <option value="Avanzado">Plan Avanzado</option>
                        <option value="Elite">Plan Elite</option>
                      </select>
                    </label>
                  </div>
                  <div className="form-row">
                    <label className="form-field">
                      <span>Peso (kg)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        placeholder="Opcional"
                        value={formData.weight}
                        onChange={(event) => handleFieldChange('weight', event.target.value)}
                      />
                    </label>
                    <label className="form-field">
                      <span>Altura (cm)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Opcional"
                        value={formData.height}
                        onChange={(event) => handleFieldChange('height', event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="form-row">
                    <label className="form-field">
                      <span>Vigencia (meses)</span>
                      <select
                        value={formData.validityMonths}
                        onChange={(event) => handleValidityChange(event.target.value)}
                        required
                      >
                        <option value="">Selecciona una opcion</option>
                        <option value="1">1 mes</option>
                        <option value="3">3 meses</option>
                        <option value="6">6 meses</option>
                        <option value="12">12 meses</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Fecha de caducidad de pago</span>
                      <input
                        type="date"
                        min={todayISO}
                        value={formData.paymentExpiration}
                        onChange={(event) => handleFieldChange('paymentExpiration', event.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <button className="btn btn--primary" type="submit">
                    Registrar inscripcion
                  </button>
                  {registrationError ? (
                    <p className="form-note staff-registration__error" role="alert" aria-live="polite">
                      {registrationError}
                    </p>
                  ) : null}
                  {registrationMessage ? <p className="form-note">{registrationMessage}</p> : null}
                </form>

                <div className="staff-log">
                  <div className="staff-log__header">
                    <div>
                      <p className="form-note">Archivo local</p>
                      <h3>Clientes registrados</h3>
                    </div>
                    <button className="btn btn--ghost" type="button" onClick={handleRefresh}>
                      Actualizar lista
                    </button>
                  </div>
                  {sortedClients.length === 0 ? (
                    <p className="staff-log__empty">Aun no hay inscripciones registradas.</p>
                  ) : (
                    <ul className="staff-log__list" aria-live="polite">
                      {sortedClients.map((client) => {
                        const weight = Number.isFinite(client.weight) ? `${client.weight} kg` : 'Sin registrar';
                        const height = Number.isFinite(client.height) ? `${client.height} cm` : 'Sin registrar';
                        const validity = client.validityMonths
                          ? `${client.validityMonths} ${client.validityMonths === 1 ? 'mes' : 'meses'}`
                          : 'Sin vigencia';
                        return (
                          <li
                            className="staff-log__item"
                            key={`${client.name ?? 'cliente'}-${client.createdAt ?? 'nuevo'}`}
                          >
                            <div className="staff-log__header">
                              <h4>{client.name}</h4>
                              <span className="staff-log__plan">
                                {client.plan ?? 'Plan sin registrar'} - {formatCurrency(planPrices[client.plan] ?? 0)}
                              </span>
                            </div>
                            <dl className="staff-log__details">
                              <div>
                                <dt>Peso</dt>
                                <dd>{weight}</dd>
                              </div>
                              <div>
                                <dt>Altura</dt>
                                <dd>{height}</dd>
                              </div>
                              <div>
                                <dt>Vigencia</dt>
                                <dd>{validity}</dd>
                              </div>
                              <div>
                                <dt>Caducidad</dt>
                                <dd>{formatDate(client.paymentExpiration)}</dd>
                              </div>
                            </dl>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}

export default Staff;

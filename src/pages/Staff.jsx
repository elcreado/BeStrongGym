import { useMemo, useState } from 'react';
import { loadClients, upsertClient, deleteClient, loadMemberships, upsertMembership, deleteMembership, setRecommendedMembership } from '../utils/dataStore.js';

const STAFF_USERNAME = 'staff';
const STAFF_PASSWORD = 'admin123';

// Constants removed in favor of dynamic state

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

const formatValidity = (client) => {
  if (client?.validityLabel) {
    return client.validityLabel;
  }

  if (Number.isFinite(client?.validityDays)) {
    const days = client.validityDays;
    if (days % 7 === 0) {
      const weeks = days / 7;
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }
    return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  if (Number.isFinite(client?.validityMonths)) {
    return `${client.validityMonths} ${client.validityMonths === 1 ? 'mes' : 'meses'}`;
  }

  return 'Sin vigencia';
};

function Staff() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    plan: '',
    weight: '',
    height: '',
  });

  const [membershipForm, setMembershipForm] = useState({
    name: '',
    durationDays: '',
    price: '',
  });
  const [membershipMessage, setMembershipMessage] = useState('');

  const planPrices = useMemo(() => {
    const map = {};
    memberships.forEach((m) => {
      map[m.name] = m.price;
      // Also store normalized version for robust lookup
      map[m.name.trim().toLowerCase()] = m.price;
    });
    return map;
  }, [memberships]);

  const PLAN_DURATION = useMemo(() => {
    const map = {};
    memberships.forEach((m) => {
      map[m.name] = { days: m.durationDays, label: m.label || `${m.durationDays} dias` };
    });
    return map;
  }, [memberships]);

  const sortedClients = useMemo(
    () => clients.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [clients],
  );

  const fetchClients = async () => {
    const data = await loadClients({ refresh: true });
    setClients(data);
  };

  const fetchMemberships = async () => {
    const data = await loadMemberships({ refresh: true });
    setMemberships(data);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (normalizeName(username) === STAFF_USERNAME && password.trim() === STAFF_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      setUsername('');
      setPassword('');
      setRegistrationError('');
      setRegistrationError('');
      await fetchClients();
      await fetchMemberships();
    } else {
      setIsAuthenticated(false);
      setLoginError('Credenciales incorrectas. Usa el usuario STAFF y la contrasena establecida.');
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      plan: '',
      weight: '',
      height: '',
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
    const duration = PLAN_DURATION[plan];
    const weight = Number(formData.weight);
    const height = Number(formData.height);

    if (!name || !plan) {
      setRegistrationError('Completa los campos obligatorios para guardar el registro.');
      setRegistrationMessage('');
      return;
    }

    if (!duration) {
      setRegistrationError('Selecciona un plan valido.');
      setRegistrationMessage('');
      return;
    }

    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(height) || height <= 0) {
      setRegistrationError('Peso y Altura son obligatorios y deben ser valores validos.');
      setRegistrationMessage('');
      return;
    }

    setRegistrationError('');
    try {
      const createdAt = new Date();
      const expirationDate = new Date(createdAt);
      expirationDate.setDate(expirationDate.getDate() + duration.days);

      await upsertClient({
        name,
        plan,
        weight,
        height,
        validityDays: duration.days,
        validityLabel: duration.label,
        paymentExpiration: expirationDate.toISOString(),
        createdAt: createdAt.toISOString(),
      });
      setRegistrationMessage(
        `Cliente guardado. Vigencia: ${duration.label}. Caduca el ${formatDate(expirationDate.toISOString())}.`,
      );
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
    setRegistrationError('');
    await fetchClients();
    await fetchMemberships();
  };

  const handleMembershipChange = (field, value) => {
    setMembershipForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMembership = async (event) => {
    event.preventDefault();
    const { name, durationDays, price } = membershipForm;
    if (!name || !durationDays || !price) {
      setMembershipMessage('Todos los campos de la membresia son obligatorios.');
      return;
    }

    try {
      await upsertMembership({
        name: name.trim(),
        durationDays: Number(durationDays),
        price: Number(price),
        label: `${durationDays} dias`, // Auto-generated label for simplicity
      });
      setMembershipMessage('Membresia agregada/actualizada correctamente.');
      setMembershipForm({ name: '', durationDays: '', price: '' });
      await fetchMemberships();
    } catch (error) {
      console.error(error);
      setMembershipMessage('Error al guardar la membresia.');
    }
  };

  const handleDeleteClient = async (name) => {
    if (window.confirm(`¿Estas seguro de eliminar al cliente ${name}?`)) {
      await deleteClient(name);
      await fetchClients();
    }
  };

  const handleDeleteMembership = async (name) => {
    if (window.confirm(`¿Estas seguro de eliminar la membresia ${name}?`)) {
      await deleteMembership(name);
      await fetchMemberships();
    }
  };

  const handleSetRecommended = async (name) => {
    await setRecommendedMembership(name);
    await fetchMemberships();
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
          <>
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
                        {memberships.map((m) => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
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
                        value={formData.weight}
                        onChange={(event) => handleFieldChange('weight', event.target.value)}
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Altura (cm)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={formData.height}
                        onChange={(event) => handleFieldChange('height', event.target.value)}
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
                        const validity = formatValidity(client);
                        return (
                          <li
                            className="staff-log__item"
                            key={`${client.name ?? 'cliente'}-${client.createdAt ?? 'nuevo'}`}
                          >
                            <div className="staff-log__header">
                              <h4>{client.name}</h4>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span className="staff-log__plan">
                                  {client.plan ?? 'Plan sin registrar'} - {formatCurrency(planPrices[client.plan] ?? planPrices[client.plan?.trim().toLowerCase()] ?? 0)}
                                </span>
                                <button
                                  className="btn btn--ghost"
                                  style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', color: '#dc2626', borderColor: '#dc2626' }}
                                  onClick={() => handleDeleteClient(client.name)}
                                  type="button"
                                >
                                  Eliminar
                                </button>
                              </div>
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

            <div className="staff-card staff-card--workspace" style={{ marginTop: '2rem' }}>
              <h3>Gestion de Membresias</h3>
              <form className="staff-registration" onSubmit={handleAddMembership}>
                <div className="form-row">
                  <label className="form-field">
                    <span>Nombre de Membresia</span>
                    <input
                      type="text"
                      value={membershipForm.name}
                      onChange={(e) => handleMembershipChange('name', e.target.value)}
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Duracion (dias)</span>
                    <input
                      type="number"
                      min="1"
                      value={membershipForm.durationDays}
                      onChange={(e) => handleMembershipChange('durationDays', e.target.value)}
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Precio</span>
                    <input
                      type="number"
                      min="0"
                      value={membershipForm.price}
                      onChange={(e) => handleMembershipChange('price', e.target.value)}
                      required
                    />
                  </label>
                </div>
                <button className="btn btn--primary" type="submit">
                  Agregar Membresia
                </button>
                {membershipMessage && <p className="form-note">{membershipMessage}</p>}
              </form>

              <div className="staff-log" style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Membresias Activas</h4>
                {memberships.length === 0 ? (
                  <p className="staff-log__empty">No hay membresias registradas.</p>
                ) : (
                  <ul className="staff-log__list">
                    {memberships.map((m) => (
                      <li className={`staff-log__item${m.recommended ? ' staff-log__item--recommended' : ''}`} key={m.name}>
                        <div className="staff-log__header">
                          <h4>{m.name}</h4>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {m.recommended ? (
                              <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.9rem' }}>★ Recomendado</span>
                            ) : (
                              <button
                                className="btn btn--ghost"
                                style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                                onClick={() => setRecommendedMembership(m.name)}
                                type="button"
                              >
                                Destacar
                              </button>
                            )}
                            <span style={{ fontWeight: 600 }}>{formatCurrency(m.price)}</span>
                            <span className="form-note">({m.durationDays} dias)</span>
                            <button
                              className="btn btn--ghost"
                              style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', color: '#dc2626', borderColor: '#dc2626' }}
                              onClick={() => handleDeleteMembership(m.name)}
                              type="button"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section >
  );
}

export default Staff;

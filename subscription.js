const DB_KEY = 'bestronggym-clients';

const loadDatabase = () => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    localStorage.setItem(DB_KEY, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    localStorage.setItem(DB_KEY, JSON.stringify([]));
    return [];
  }
};

const saveDatabase = (records) => {
  localStorage.setItem(DB_KEY, JSON.stringify(records));
};

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

const planPrices = {
  Esencial: 45000,
  Avanzado: 65000,
  Elite: 90000,
};

const role = sessionStorage.getItem('bestronggym-session-role');
const sessionUser = sessionStorage.getItem('bestronggym-session-user');

const adminPanel = document.getElementById('admin-panel');
const clientPanel = document.getElementById('client-panel');
const registryPanel = document.getElementById('registry-panel');
const registryList = document.getElementById('registry-list');
const clientSummary = document.getElementById('client-summary');
const clientPanelNote = document.getElementById('client-panel-note');
const logoutButton = document.getElementById('logout-button');

const adminForm = document.getElementById('admin-form');
const adminClientName = document.getElementById('admin-client-name');
const adminClientPlan = document.getElementById('admin-client-plan');
const adminClientValidity = document.getElementById('admin-client-validity');
const adminClientWeight = document.getElementById('admin-client-weight');
const adminClientHeight = document.getElementById('admin-client-height');
const adminExpirationInput = document.getElementById('admin-expiration');
const adminFormFeedback = document.getElementById('admin-form-feedback');

let records = loadDatabase();

const renderRegistry = () => {
  if (!registryList) return;

  registryList.innerHTML = '';

  records
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((record) => {
      const item = document.createElement('li');
      item.className = 'staff-log__item';
      item.innerHTML = `
        <div class="staff-log__header">
          <h4>${record.name}</h4>
          <span class="staff-log__plan">${record.plan} · ${formatCOP(planPrices[record.plan] ?? 0)}</span>
        </div>
        <dl class="staff-log__details">
          <div><dt>Vigencia</dt><dd>${record.validity} ${record.validity === '1' ? 'mes' : 'meses'}</dd></div>
          <div><dt>Caducidad</dt><dd>${
            record.expiration
              ? new Date(record.expiration).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Sin fecha'
          }</dd></div>
          <div><dt>Peso</dt><dd>${
            Number.isFinite(record.weight) && record.weight > 0 ? `${record.weight.toFixed(1)} kg` : 'Sin registrar'
          }</dd></div>
          <div><dt>Altura</dt><dd>${
            Number.isFinite(record.height) && record.height > 0 ? `${record.height.toFixed(0)} cm` : 'Sin registrar'
          }</dd></div>
        </dl>
      `;
      registryList.appendChild(item);
    });
};

const renderClientSummary = (record) => {
  if (!clientSummary || !clientPanelNote) return;

  if (!record) {
    clientPanelNote.textContent = 'No encontramos tu registro en la base local. Consulta en recepción.';
    clientSummary.innerHTML = '';
    return;
  }

  clientPanelNote.textContent = 'Información tomada del archivo local de suscripciones.';
  clientSummary.innerHTML = `
    <div class="summary-row"><dt>Cliente</dt><dd>${record.name}</dd></div>
    <div class="summary-row"><dt>Plan</dt><dd>${record.plan} (${formatCOP(planPrices[record.plan] ?? 0)})</dd></div>
    <div class="summary-row"><dt>Vigencia</dt><dd>${record.validity} ${
    record.validity === '1' ? 'mes' : 'meses'
  }</dd></div>
    <div class="summary-row"><dt>Caducidad</dt><dd>${
      record.expiration
        ? new Date(record.expiration).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'Sin fecha'
    }</dd></div>
    <div class="summary-row"><dt>Peso</dt><dd>${
      Number.isFinite(record.weight) && record.weight > 0 ? `${record.weight.toFixed(1)} kg` : 'Sin registrar'
    }</dd></div>
    <div class="summary-row"><dt>Altura</dt><dd>${
      Number.isFinite(record.height) && record.height > 0 ? `${record.height.toFixed(0)} cm` : 'Sin registrar'
    }</dd></div>
  `;
};

const ensureExpirationForAdmin = () => {
  if (!adminClientValidity || !adminExpirationInput) return;

  const months = Number(adminClientValidity.value);

  if (!Number.isFinite(months) || months <= 0) {
    adminExpirationInput.value = '';
    return;
  }

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setMonth(baseDate.getMonth() + months);
  adminExpirationInput.value = baseDate.toISOString().split('T')[0];
};

if (adminExpirationInput) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  adminExpirationInput.setAttribute('min', today.toISOString().split('T')[0]);
  adminExpirationInput.setAttribute('readonly', '');
}

adminClientValidity?.addEventListener('change', ensureExpirationForAdmin);

adminForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!adminClientName || !adminClientPlan || !adminClientValidity || !adminExpirationInput) {
    return;
  }

  const name = adminClientName.value.trim();
  const plan = adminClientPlan.value;
  const validity = adminClientValidity.value;
  const expiration = adminExpirationInput.value;
  const weight = Number(adminClientWeight?.value ?? 0);
  const height = Number(adminClientHeight?.value ?? 0);

  if (!name || !plan || !validity || !expiration) {
    if (adminFormFeedback) {
      adminFormFeedback.textContent = 'Completa todos los campos obligatorios.';
    }
    return;
  }

  const existingIndex = records.findIndex((record) => record.name.trim().toLowerCase() === name.toLowerCase());
  const newRecord = {
    id: existingIndex >= 0 ? records[existingIndex].id : generateId(),
    name,
    plan,
    validity,
    expiration,
    weight,
    height,
    createdAt: existingIndex >= 0 ? records[existingIndex].createdAt : Date.now(),
  };

  if (existingIndex >= 0) {
    records.splice(existingIndex, 1, newRecord);
    if (adminFormFeedback) {
      adminFormFeedback.textContent = 'Suscripción actualizada correctamente.';
    }
  } else {
    records = [newRecord, ...records];
    if (adminFormFeedback) {
      adminFormFeedback.textContent = 'Suscripción registrada y guardada en el archivo local.';
    }
  }

  saveDatabase(records);
  renderRegistry();
  ensureExpirationForAdmin();
});

logoutButton?.addEventListener('click', () => {
  sessionStorage.removeItem('bestronggym-session-role');
  sessionStorage.removeItem('bestronggym-session-user');
  sessionStorage.removeItem('bestronggym-session-client-id');
  window.location.href = 'index.html#suscripciones';
});

const bootstrap = () => {
  if (!role) {
    window.location.replace('index.html#suscripciones');
    return;
  }

  if (role === 'admin') {
    adminPanel?.removeAttribute('hidden');
    registryPanel?.removeAttribute('hidden');
    renderRegistry();
    ensureExpirationForAdmin();
    return;
  }

  clientPanel?.removeAttribute('hidden');
  const clientId = sessionStorage.getItem('bestronggym-session-client-id');
  let record = null;

  if (clientId) {
    record = records.find((item) => item.id === clientId) ?? null;
  }

  if (!record && sessionUser) {
    record = records.find((item) => item.name.trim().toLowerCase() === sessionUser.toLowerCase()) ?? null;
  }

  renderClientSummary(record);
};

bootstrap();

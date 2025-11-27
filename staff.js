import { loadClients, upsertClient } from './dataStore.js';

const STAFF_USERNAME = 'staff';
const STAFF_PASSWORD = 'admin123';

const yearElement = document.getElementById('current-year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const loginForm = document.getElementById('staff-login-form');
const staffWorkspace = document.getElementById('staff-workspace');
const loginError = document.getElementById('staff-login-error');
const usernameInput = document.getElementById('staff-username');
const passwordInput = document.getElementById('staff-password');
const staffAccess = document.getElementById('staff-access');
let isAuthenticated = false;

const registrationForm = document.getElementById('registration-form');
const registrationList = document.getElementById('registration-log');
const registrationEmpty = document.getElementById('registration-empty');
const planValiditySelect = document.getElementById('plan-validity');
const expirationInput = document.getElementById('payment-expiration');
const registrationError = document.getElementById('registration-error');
const refreshButton = document.getElementById('refresh-clients');

const normalizeName = (value) => value.trim().toLowerCase();

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

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayISO = today.toISOString().split('T')[0];

if (expirationInput) {
  expirationInput.setAttribute('min', todayISO);
}

const updateExpirationDate = () => {
  if (!planValiditySelect || !expirationInput) return;

  const months = Number(planValiditySelect.value);
  if (!Number.isFinite(months) || months <= 0) {
    expirationInput.value = '';
    return;
  }

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setMonth(baseDate.getMonth() + months);
  expirationInput.value = baseDate.toISOString().split('T')[0];
};

planValiditySelect?.addEventListener('change', updateExpirationDate);

const renderList = async () => {
  if (!registrationList) return;

  const clients = await loadClients({ refresh: true });
  registrationList.innerHTML = '';

  if (!clients.length) {
    registrationEmpty?.removeAttribute('hidden');
    return;
  }

  registrationEmpty?.setAttribute('hidden', '');

  clients
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .forEach((client) => {
      const weightText = Number.isFinite(client.weight) ? `${client.weight} kg` : 'Sin registrar';
      const heightText = Number.isFinite(client.height) ? `${client.height} cm` : 'Sin registrar';
      const validityText = client.validityMonths
        ? `${client.validityMonths} ${client.validityMonths === 1 ? 'mes' : 'meses'}`
        : 'Sin vigencia';
      const expirationDate = client.paymentExpiration
        ? new Date(client.paymentExpiration).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
        : 'Sin fecha';

      const entry = document.createElement('li');
      entry.className = 'staff-log__item';
      entry.innerHTML = `
        <div class="staff-log__header">
          <h4>${client.name}</h4>
          <span class="staff-log__plan">${client.plan ?? 'Plan sin registrar'} · ${formatCOP(
        planPrices[client.plan] ?? 0,
      )}</span>
        </div>
        <dl class="staff-log__details">
          <div>
            <dt>Peso</dt>
            <dd>${weightText}</dd>
          </div>
          <div>
            <dt>Altura</dt>
            <dd>${heightText}</dd>
          </div>
          <div>
            <dt>Vigencia</dt>
            <dd>${validityText}</dd>
          </div>
          <div>
            <dt>Caducidad</dt>
            <dd>${expirationDate}</dd>
          </div>
        </dl>
      `;

      registrationList.appendChild(entry);
    });
};

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!usernameInput || !passwordInput) return;

  const username = normalizeName(usernameInput.value);
  const password = passwordInput.value.trim();

  if (username === STAFF_USERNAME && password === STAFF_PASSWORD) {
    isAuthenticated = true;
    loginError.textContent = '';
    staffAccess?.setAttribute('hidden', '');
    staffWorkspace?.removeAttribute('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
    registrationError.textContent = '';
    renderList();
  } else {
    isAuthenticated = false;
    staffWorkspace?.setAttribute('hidden', '');
    loginError.textContent = 'Credenciales incorrectas. Usa el usuario STAFF y la contraseña establecida.';
    passwordInput.focus();
    passwordInput.select();
  }
});

registrationForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isAuthenticated) {
    registrationError.textContent = 'Inicia sesión como STAFF para registrar clientes.';
    return;
  }

  const formData = new FormData(registrationForm);
  const clientName = String(formData.get('client-name') ?? '').trim();
  const plan = String(formData.get('client-plan') ?? '').trim();
  const weight = Number(formData.get('client-weight'));
  const height = Number(formData.get('client-height'));
  const validityMonths = Number(formData.get('plan-validity'));
  const paymentExpiration = String(formData.get('payment-expiration') ?? '').trim();

  if (!clientName || !plan || !validityMonths || !paymentExpiration) {
    registrationError.textContent = 'Completa los campos obligatorios para guardar el registro.';
    return;
  }

  registrationError.textContent = '';

  await upsertClient({
    name: clientName,
    plan,
    weight: Number.isFinite(weight) ? weight : undefined,
    height: Number.isFinite(height) ? height : undefined,
    validityMonths,
    paymentExpiration,
    createdAt: new Date().toISOString(),
  });

  registrationForm.reset();
  if (expirationInput) {
    expirationInput.value = '';
  }
  registrationError.textContent = 'Cliente guardado en el archivo local.';
  renderList();
});

refreshButton?.addEventListener('click', () => {
  if (!isAuthenticated) {
    registrationError.textContent = 'Primero inicia sesión como STAFF.';
    return;
  }
  registrationError.textContent = '';
  renderList();
});

if (isAuthenticated) {
  renderList();
}

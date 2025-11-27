const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

const yearElement = document.getElementById('current-year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const planPrices = {
  Esencial: 45000,
  Avanzado: 65000,
  Elite: 90000,
};

const DB_KEY = 'bestronggym-clients';

const ensureDatabase = () => {
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

const loginForm = document.getElementById('staff-login-form');
const passwordInput = document.getElementById('staff-password');
const loginError = document.getElementById('staff-login-error');
const staffAccessCard = document.getElementById('staff-access');
const staffWorkspace = document.getElementById('staff-workspace');
const staffIntro = document.getElementById('staff-intro');
let isStaffAuthenticated = false;
let clientRecords = ensureDatabase();

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!passwordInput) {
    return;
  }

  const password = passwordInput.value.trim();
  if (password === 'admin123') {
    if (loginError) {
      loginError.textContent = '';
    }
    isStaffAuthenticated = true;
    staffAccessCard?.setAttribute('hidden', '');
    staffWorkspace?.removeAttribute('hidden');
    staffIntro?.removeAttribute('hidden');
    renderRegistrationList();
    if (registrationError) {
      registrationError.textContent = '';
      registrationError.setAttribute('hidden', '');
    }
    loginForm.reset();
    passwordInput.value = '';
    document.getElementById('client-name')?.focus();
  } else {
    if (loginError) {
      loginError.textContent = 'Clave incorrecta. Inténtalo nuevamente.';
    }
    isStaffAuthenticated = false;
    passwordInput.focus();
    passwordInput.select();
  }
});

const registrationForm = document.getElementById('registration-form');
const registrationList = document.getElementById('registration-log');
const registrationEmpty = document.getElementById('registration-empty');
const planValiditySelect = document.getElementById('plan-validity');
const expirationInput = document.getElementById('payment-expiration');
const registrationError = document.getElementById('registration-error');

const renderRegistrationList = () => {
  if (!registrationList || !registrationEmpty) {
    return;
  }

  registrationList.innerHTML = '';

  if (!clientRecords.length) {
    registrationEmpty.removeAttribute('hidden');
    return;
  }

  registrationEmpty.setAttribute('hidden', '');

  clientRecords
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((record) => {
      const weightText =
        Number.isFinite(record.weight) && record.weight > 0
          ? `${record.weight.toFixed(1)} kg`
          : 'Sin registrar';
      const heightText =
        Number.isFinite(record.height) && record.height > 0
          ? `${record.height.toFixed(0)} cm`
          : 'Sin registrar';
      const planPrice = formatCOP(planPrices[record.plan] ?? 0);
      const expirationDate = record.expiration
        ? new Date(record.expiration).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
        : 'Sin fecha';
      const validityText = `${record.validity} ${record.validity === '1' ? 'mes' : 'meses'}`;

      const entry = document.createElement('li');
      entry.className = 'staff-log__item';
      entry.innerHTML = `
        <div class="staff-log__header">
          <h4>${record.name}</h4>
          <span class="staff-log__plan">${record.plan} · ${planPrice}</span>
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

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayISO = today.toISOString().split('T')[0];

if (expirationInput) {
  expirationInput.setAttribute('readonly', '');
  expirationInput.setAttribute('min', todayISO);
}

const updateExpirationDate = () => {
  if (!planValiditySelect || !expirationInput) {
    return;
  }

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

registrationForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!registrationForm || !registrationList) {
    return;
  }

  const formData = new FormData(registrationForm);
  const clientName = String(formData.get('client-name') ?? '').trim();
  const plan = String(formData.get('client-plan') ?? '');
  const weight = Number(formData.get('client-weight') ?? 0);
  const height = Number(formData.get('client-height') ?? 0);
  const validity = String(formData.get('plan-validity') ?? '');

  if (!expirationInput?.value) {
    updateExpirationDate();
  }

  if (!isStaffAuthenticated) {
    if (registrationError) {
      registrationError.textContent = 'Debes autenticarte para registrar inscripciones.';
      registrationError.removeAttribute('hidden');
    }
    return;
  }

  if (registrationError) {
    registrationError.textContent = '';
    registrationError.setAttribute('hidden', '');
  }

  if (!clientName || !plan || !validity || !expirationInput?.value) {
    return;
  }

  const record = {
    id: generateId(),
    name: clientName,
    plan,
    weight,
    height,
    validity,
    expiration: expirationInput.value,
    createdAt: Date.now(),
  };

  clientRecords = [record, ...clientRecords];
  saveDatabase(clientRecords);
  renderRegistrationList();
  registrationForm.reset();
  if (expirationInput) {
    expirationInput.value = '';
  }
});

const subscriptionLoginForm = document.getElementById('subscription-login-form');
const subscriptionUsernameInput = document.getElementById('subscription-username');
const subscriptionLoginError = document.getElementById('subscription-login-error');

const findClientByName = (name) => {
  const normalized = name.trim().toLowerCase();
  return clientRecords.find((record) => record.name.trim().toLowerCase() === normalized);
};

subscriptionLoginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!subscriptionUsernameInput) {
    return;
  }

  if (subscriptionLoginError) {
    subscriptionLoginError.textContent = '';
  }

  const username = subscriptionUsernameInput.value.trim();

  if (!username) {
    return;
  }

  if (username === 'admin123') {
    sessionStorage.setItem('bestronggym-session-role', 'admin');
    sessionStorage.removeItem('bestronggym-session-user');
    window.location.href = 'subscription.html';
    return;
  }

  const client = findClientByName(username);

  if (!client) {
    if (subscriptionLoginError) {
      subscriptionLoginError.textContent = 'Usuario no encontrado en la base local.';
    }
    return;
  }

  sessionStorage.setItem('bestronggym-session-role', 'client');
  sessionStorage.setItem('bestronggym-session-user', client.name);
  sessionStorage.setItem('bestronggym-session-client-id', client.id);
  if (subscriptionLoginError) {
    subscriptionLoginError.textContent = '';
  }
  window.location.href = 'subscription.html';
});

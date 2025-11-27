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

const STORAGE_KEY = 'bestrong_subscriptions';

loadSubscriptions();

const loadSubscriptions = () => {
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) {
    localStorage.setItem(STORAGE_KEY, '[]');
    return [];
  }

  try {
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('No se pudo leer el archivo local de suscripciones', error);
    return [];
  }
};

const saveSubscriptions = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const loginForm = document.getElementById('staff-login-form');
const passwordInput = document.getElementById('staff-password');
const loginError = document.getElementById('staff-login-error');
const staffAccessCard = document.getElementById('staff-access');
const staffWorkspace = document.getElementById('staff-workspace');
const staffIntro = document.getElementById('staff-intro');
let isStaffAuthenticated = false;

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
    if (registrationError) {
      registrationError.textContent = '';
      registrationError.setAttribute('hidden', '');
    }
    loginForm.reset();
    passwordInput.value = '';
    document.getElementById('client-name')?.focus();
    const storedEntries = loadSubscriptions();
    renderRegistrationLog(storedEntries);
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

const renderRegistrationLog = (entries) => {
  if (!registrationList || !registrationEmpty) {
    return;
  }

  registrationList.innerHTML = '';

  if (!entries.length) {
    registrationEmpty.removeAttribute('hidden');
    return;
  }

  registrationEmpty.setAttribute('hidden', '');

  entries
    .slice()
    .reverse()
    .forEach((entry) => {
      const item = document.createElement('li');
      item.className = 'staff-log__item';
      item.innerHTML = `
        <div class="staff-log__header">
          <h4>${entry.name}</h4>
          <span class="staff-log__plan">${entry.plan} · ${formatCOP(planPrices[entry.plan] ?? 0)}</span>
        </div>
        <dl class="staff-log__details">
          <div>
            <dt>Peso</dt>
            <dd>${entry.weightText}</dd>
          </div>
          <div>
            <dt>Altura</dt>
            <dd>${entry.heightText}</dd>
          </div>
          <div>
            <dt>Vigencia</dt>
            <dd>${entry.validityText}</dd>
          </div>
          <div>
            <dt>Caducidad</dt>
            <dd>${entry.expirationDate}</dd>
          </div>
        </dl>
      `;

      registrationList.appendChild(item);
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

  const weightText = Number.isFinite(weight) && weight > 0 ? `${weight.toFixed(1)} kg` : 'Sin registrar';
  const heightText = Number.isFinite(height) && height > 0 ? `${height.toFixed(0)} cm` : 'Sin registrar';
  const planPrice = formatCOP(planPrices[plan] ?? 0);

  const expirationDate = expirationInput.value
    ? new Date(expirationInput.value).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Sin fecha';

  const validityText = `${validity} ${validity === '1' ? 'mes' : 'meses'}`;

  const entry = document.createElement('li');
  entry.className = 'staff-log__item';
  entry.innerHTML = `
    <div class="staff-log__header">
      <h4>${clientName}</h4>
      <span class="staff-log__plan">${plan} · ${planPrice}</span>
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

  registrationList.prepend(entry);
  registrationEmpty?.setAttribute('hidden', '');

  const storedEntries = loadSubscriptions();
  storedEntries.push({
    name: clientName,
    plan,
    weightText,
    heightText,
    validityText,
    expirationDate,
  });
  saveSubscriptions(storedEntries);
  registrationForm.reset();
  if (expirationInput) {
    expirationInput.value = '';
  }
});

const publicLoginForm = document.getElementById('public-login-form');
const publicNameInput = document.getElementById('public-name');
const publicPasswordInput = document.getElementById('public-password');
const publicLoginFeedback = document.getElementById('public-login-feedback');

publicLoginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!publicNameInput || !publicLoginFeedback) {
    return;
  }

  const username = publicNameInput.value.trim();
  const password = (publicPasswordInput?.value ?? '').trim();

  if (!username) {
    publicLoginFeedback.textContent = 'Ingresa tu nombre para continuar.';
    return;
  }

  if (password === 'admin123') {
    publicLoginFeedback.textContent = 'Acceso de administrador concedido. Redirigiendo…';
    localStorage.setItem('bestrong_admin_session', 'true');
    setTimeout(() => {
      window.location.href = 'suscripciones.html';
    }, 300);
    return;
  }

  localStorage.removeItem('bestrong_admin_session');
  const existingClients = loadSubscriptions();
  const foundClient = existingClients.find(
    (entry) => entry.name?.toLowerCase() === username.toLowerCase(),
  );

  if (foundClient) {
    publicLoginFeedback.textContent = `${username} encontrado. Tu plan registrado es ${foundClient.plan}.`;
  } else {
    publicLoginFeedback.textContent = `No se encontró el usuario ${username}. Solicita apoyo en recepción.`;
  }
});

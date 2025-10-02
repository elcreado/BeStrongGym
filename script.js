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

const loginToggleButton = document.getElementById('staff-login-toggle');
const loginForm = document.getElementById('staff-login-form');
const passwordInput = document.getElementById('staff-password');
const loginError = document.getElementById('staff-login-error');
const lockedPanel = document.getElementById('staff-locked');
const unlockedPanel = document.getElementById('staff-unlocked');

loginToggleButton?.addEventListener('click', () => {
  if (!loginForm) {
    return;
  }

  const isHidden = loginForm.hasAttribute('hidden');
  if (isHidden) {
    loginForm.removeAttribute('hidden');
    passwordInput?.focus();
  } else {
    loginForm.setAttribute('hidden', '');
    if (loginError) {
      loginError.textContent = '';
    }
    if (passwordInput) {
      passwordInput.value = '';
    }
  }
});

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
    loginForm.setAttribute('hidden', '');
    lockedPanel?.setAttribute('hidden', '');
    unlockedPanel?.removeAttribute('hidden');
    loginForm.reset();
    passwordInput.value = '';
    document.getElementById('client-name')?.focus();
  } else {
    if (loginError) {
      loginError.textContent = 'Clave incorrecta. Inténtalo nuevamente.';
    }
    passwordInput.focus();
    passwordInput.select();
  }
});

const registrationForm = document.getElementById('registration-form');
const registrationList = document.getElementById('registration-log');
const registrationEmpty = document.getElementById('registration-empty');

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
  const expiration = String(formData.get('payment-expiration') ?? '');

  if (!clientName || !plan || !validity || !expiration) {
    return;
  }

  const weightText = Number.isFinite(weight) && weight > 0 ? `${weight.toFixed(1)} kg` : 'Sin registrar';
  const heightText = Number.isFinite(height) && height > 0 ? `${height.toFixed(0)} cm` : 'Sin registrar';
  const planPrice = formatCOP(planPrices[plan] ?? 0);

  const expirationDate = expiration
    ? new Date(expiration).toLocaleDateString('es-CO', {
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
  registrationForm.reset();
});

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

const STORAGE_KEY = 'bestrong_subscriptions';

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

const isAdminSession = localStorage.getItem('bestrong_admin_session') === 'true';
if (!isAdminSession) {
  window.location.replace('index.html#suscripciones');
}

const logoutButton = document.getElementById('admin-logout');
logoutButton?.addEventListener('click', () => {
  localStorage.removeItem('bestrong_admin_session');
  window.location.replace('index.html#suscripciones');
});

const adminForm = document.getElementById('admin-subscription-form');
const adminList = document.getElementById('admin-subscription-list');
const adminEmptyState = document.getElementById('admin-empty');
const validitySelect = document.getElementById('admin-plan-validity');
const expirationInput = document.getElementById('admin-payment-expiration');

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayISO = today.toISOString().split('T')[0];
expirationInput?.setAttribute('readonly', '');
expirationInput?.setAttribute('min', todayISO);

const updateExpirationDate = () => {
  if (!validitySelect || !expirationInput) {
    return;
  }

  const months = Number(validitySelect.value);
  if (!Number.isFinite(months) || months <= 0) {
    expirationInput.value = '';
    return;
  }

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setMonth(baseDate.getMonth() + months);
  expirationInput.value = baseDate.toISOString().split('T')[0];
};

validitySelect?.addEventListener('change', updateExpirationDate);

const renderSubscriptions = (entries) => {
  if (!adminList || !adminEmptyState) {
    return;
  }

  adminList.innerHTML = '';

  if (!entries.length) {
    adminEmptyState.removeAttribute('hidden');
    return;
  }

  adminEmptyState.setAttribute('hidden', '');

  entries
    .slice()
    .reverse()
    .forEach((entry, index) => {
      const item = document.createElement('li');
      item.className = 'staff-log__item admin-log__item';
      item.innerHTML = `
        <div class="staff-log__header">
          <h4>${entry.name}</h4>
          <span class="staff-log__plan">${entry.plan} · ${formatCOP(planPrices[entry.plan] ?? 0)}</span>
        </div>
        <dl class="staff-log__details admin-log__details">
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
        <button class="btn btn--ghost admin-log__remove" type="button" data-index="${index}">Eliminar</button>
      `;

      adminList.appendChild(item);
    });
};

adminList?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches('.admin-log__remove')) {
    const index = Number(target.dataset.index);
    const entries = loadSubscriptions();
    const reversedEntries = entries.slice().reverse();
    if (Number.isInteger(index) && index >= 0 && index < reversedEntries.length) {
      reversedEntries.splice(index, 1);
      const restoredOrder = reversedEntries.reverse();
      saveSubscriptions(restoredOrder);
      renderSubscriptions(restoredOrder);
    }
  }
});

adminForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!adminForm || !adminList) {
    return;
  }

  const formData = new FormData(adminForm);
  const clientName = String(formData.get('client-name') ?? '').trim();
  const plan = String(formData.get('client-plan') ?? '');
  const weight = Number(formData.get('client-weight') ?? 0);
  const height = Number(formData.get('client-height') ?? 0);
  const validity = String(formData.get('plan-validity') ?? '');

  if (!clientName || !plan || !validity) {
    return;
  }

  if (!expirationInput?.value) {
    updateExpirationDate();
  }

  const weightText = Number.isFinite(weight) && weight > 0 ? `${weight.toFixed(1)} kg` : 'Sin registrar';
  const heightText = Number.isFinite(height) && height > 0 ? `${height.toFixed(0)} cm` : 'Sin registrar';
  const expirationDate = expirationInput?.value
    ? new Date(expirationInput.value).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Sin fecha';
  const validityText = `${validity} ${validity === '1' ? 'mes' : 'meses'}`;

  const newEntry = {
    name: clientName,
    plan,
    weightText,
    heightText,
    validityText,
    expirationDate,
  };

  const storedEntries = loadSubscriptions();
  storedEntries.push(newEntry);
  saveSubscriptions(storedEntries);
  renderSubscriptions(storedEntries);
  adminForm.reset();
  if (expirationInput) {
    expirationInput.value = '';
  }
});

const storedEntries = loadSubscriptions();
renderSubscriptions(storedEntries);

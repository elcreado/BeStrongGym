import { loadClients } from './dataStore.js';

const yearElement = document.getElementById('current-year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const loginToggleButton = document.getElementById('login-toggle');
const loginPanel = document.getElementById('login-panel');
const userLoginForm = document.getElementById('user-login-form');
const userNameInput = document.getElementById('user-name');
const userPlanCard = document.getElementById('user-plan');
const userLoginError = document.getElementById('user-login-error');

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

loginToggleButton?.addEventListener('click', () => {
  loginPanel?.removeAttribute('hidden');
  userLoginError.textContent = '';
  userPlanCard?.setAttribute('hidden', '');
  userNameInput?.focus();
});

const renderPlan = (client) => {
  if (!userPlanCard) return;

  const price = formatCOP(planPrices[client.plan] ?? 0);
  const weightText = Number.isFinite(client.weight) ? `${client.weight} kg` : 'Sin registrar';
  const heightText = Number.isFinite(client.height) ? `${client.height} cm` : 'Sin registrar';
  const validityText = client.validityMonths
    ? `${client.validityMonths} ${client.validityMonths === 1 ? 'mes' : 'meses'}`
    : 'Sin vigencia definida';
  const expirationText = client.paymentExpiration
    ? new Date(client.paymentExpiration).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Sin fecha registrada';

  userPlanCard.innerHTML = `
    <p class="form-note">Hola ${client.name}, estos son los datos encontrados en el archivo local.</p>
    <div class="user-plan__header">
      <h3>${client.plan ?? 'Plan no asignado'}</h3>
      <span class="user-plan__price">${price}</span>
    </div>
    <dl class="user-plan__details">
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
        <dd>${expirationText}</dd>
      </div>
    </dl>
  `;

  userPlanCard.removeAttribute('hidden');
};

userLoginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!userNameInput) return;

  const name = userNameInput.value.trim();
  if (!name) {
    userLoginError.textContent = 'Ingresa el nombre con el que te registró el staff en recepción.';
    userPlanCard?.setAttribute('hidden', '');
    return;
  }

  userLoginError.textContent = '';

  const clients = await loadClients({ refresh: true });
  const client = clients.find((entry) => normalizeName(entry.name) === normalizeName(name));

  if (!client) {
    userPlanCard?.setAttribute('hidden', '');
    userLoginError.textContent = 'No encontramos tu nombre en el archivo local. Solicita tu registro en recepción.';
    return;
  }

  renderPlan(client);
});

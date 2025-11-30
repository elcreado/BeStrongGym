const STORAGE_KEY = 'bestronggym.clients';
const DATA_URL = '/data/clients.json';
let cachedClients = null;

const normalizeName = (value) => value?.trim().toLowerCase() ?? '';

const readFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('No se pudo leer el archivo local de clientes', error);
    return null;
  }
};

const fetchFromFile = async () => {
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('No se pudo cargar data/clients.json', error);
    return [];
  }
};

export const loadClients = async ({ refresh = false } = {}) => {
  if (cachedClients && !refresh) {
    return cachedClients;
  }

  const stored = readFromStorage();
  if (stored && !refresh) {
    cachedClients = stored;
    return stored;
  }

  const data = stored && refresh ? stored : await fetchFromFile();
  cachedClients = data;
  return data;
};

export const saveClients = (clients) => {
  try {
    cachedClients = clients;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    console.error('No se pudo guardar el archivo de clientes', error);
  }
};

export const upsertClient = async (clientPayload) => {
  const clients = await loadClients({ refresh: true });
  const incomingName = normalizeName(clientPayload.name);
  const updatedClient = {
    ...clientPayload,
    name: clientPayload.name.trim(),
  };

  const existingIndex = clients.findIndex((client) => normalizeName(client.name) === incomingName);

  if (existingIndex >= 0) {
    clients[existingIndex] = { ...clients[existingIndex], ...updatedClient };
  } else {
    clients.push(updatedClient);
  }

  saveClients(clients);
  return clients;
};

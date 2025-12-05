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

export const deleteClient = async (name) => {
  const clients = await loadClients({ refresh: true });
  const normalizedName = normalizeName(name);
  const updatedClients = clients.filter((c) => normalizeName(c.name) !== normalizedName);

  if (updatedClients.length !== clients.length) {
    saveClients(updatedClients);
  }
  return updatedClients;
};

// --- Memberships Logic ---

const MEMBERSHIPS_STORAGE_KEY = 'bestronggym.memberships';
const MEMBERSHIPS_URL = '/data/memberships.json';
let cachedMemberships = null;

const readMembershipsFromStorage = () => {
  try {
    const raw = localStorage.getItem(MEMBERSHIPS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('No se pudo leer el archivo local de membresias', error);
    return null;
  }
};

const fetchMembershipsFromFile = async () => {
  try {
    const response = await fetch(MEMBERSHIPS_URL, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('No se pudo cargar data/memberships.json', error);
    return [];
  }
};

export const loadMemberships = async ({ refresh = false } = {}) => {
  if (cachedMemberships && !refresh) {
    return cachedMemberships;
  }

  const stored = readMembershipsFromStorage();
  if (stored && !refresh) {
    cachedMemberships = stored;
    return stored;
  }

  const fileData = await fetchMembershipsFromFile();
  const data = stored && refresh ? stored : (stored || fileData);
  cachedMemberships = data;
  return data;
};

export const saveMemberships = (memberships) => {
  try {
    cachedMemberships = memberships;
    localStorage.setItem(MEMBERSHIPS_STORAGE_KEY, JSON.stringify(memberships));
  } catch (error) {
    console.error('No se pudo guardar el archivo de membresias', error);
  }
};

export const upsertMembership = async (membershipPayload) => {
  const memberships = await loadMemberships({ refresh: true });
  const incomingName = normalizeName(membershipPayload.name);

  const updatedMembership = {
    ...membershipPayload,
    name: membershipPayload.name.trim(),
  };

  const existingIndex = memberships.findIndex(
    (m) => normalizeName(m.name) === incomingName
  );

  if (existingIndex >= 0) {
    memberships[existingIndex] = { ...memberships[existingIndex], ...updatedMembership };
  } else {
    memberships.push(updatedMembership);
  }

  saveMemberships(memberships);
  return memberships;
};

export const deleteMembership = async (name) => {
  const memberships = await loadMemberships({ refresh: true });
  const normalizedName = normalizeName(name);
  const updatedMemberships = memberships.filter((m) => normalizeName(m.name) !== normalizedName);

  if (updatedMemberships.length !== memberships.length) {
    saveMemberships(updatedMemberships);
  }
  saveMemberships(updatedMemberships);
  return updatedMemberships;
};

export const setRecommendedMembership = async (name) => {
  const memberships = await loadMemberships({ refresh: true });
  const normalizedName = normalizeName(name);

  // Set the target as recommended, others as false
  const updatedMemberships = memberships.map((m) => ({
    ...m,
    recommended: normalizeName(m.name) === normalizedName,
  }));

  saveMemberships(updatedMemberships);
  return updatedMemberships;
};

/** Application API helpers (used by main.js) */
async function apiCreateApplication(body) {
  return api('/applications', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function apiPatchApplication(id, body) {
  await api('/applications/' + id, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  await refreshAllData();
}

async function apiDeleteApplication(id) {
  await api('/applications/' + id, { method: 'DELETE' });
  await refreshAllData();
}

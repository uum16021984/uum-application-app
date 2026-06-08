/** Job advertisements — API-backed */

// ── Image helpers ──────────────────────────────────────────────────────────

function previewJobImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('jobImagePreviewImg');
    const box = document.getElementById('jobImagePreview');
    if (img) img.src = e.target.result;
    if (box) box.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function clearJobImage() {
  const inp  = document.getElementById('jobImage');
  const img  = document.getElementById('jobImagePreviewImg');
  const box  = document.getElementById('jobImagePreview');
  if (inp) inp.value = '';
  if (img) img.src   = '';
  if (box) box.style.display = 'none';
}

function getJobImageBase64() {
  return new Promise((resolve) => {
    const input = document.getElementById('jobImage');
    const file  = input && input.files && input.files[0];
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// ── Open modal for CREATE ──────────────────────────────────────────────────

function showJobAdModal() {
  document.getElementById('jobAdModalTitle').textContent = 'Create Job Advertisement';
  document.getElementById('jobAdSubmitBtn').textContent  = 'Create';
  document.getElementById('jobEditId').value = '';
  document.getElementById('jobAdForm').reset();
  clearJobImage();
  document.getElementById('jobAdModal').classList.add('active');
}

// ── Open modal for EDIT ───────────────────────────────────────────────────

function editJobAd(jobId) {
  const job = jobOpenings.find(j => String(j.id) === String(jobId));
  if (!job) { showToast('Job not found.', 'error'); return; }

  document.getElementById('jobAdModalTitle').textContent = 'Edit Job Advertisement';
  document.getElementById('jobAdSubmitBtn').textContent  = 'Save Changes';
  document.getElementById('jobEditId').value             = job.id;
  document.getElementById('jobTitle').value              = job.title       || '';
  document.getElementById('jobGrade').value              = job.grade       || 'DS11';
  document.getElementById('jobSchool').value             = job.school      || '';
  document.getElementById('jobDescription').value        = job.description || '';
  document.getElementById('jobDeadline').value           = job.deadline    || '';
  document.getElementById('jobVacancies').value          = job.vacancies   || 1;

  clearJobImage();

  if (job.image) {
    const img = document.getElementById('jobImagePreviewImg');
    const box = document.getElementById('jobImagePreview');
    if (img) img.src = job.image;
    if (box) box.style.display = 'block';
  }

  document.getElementById('jobAdModal').classList.add('active');
}

// ── Close modal ────────────────────────────────────────────────────────────

function closeJobAdModal() {
  document.getElementById('jobAdModal').classList.remove('active');
  document.getElementById('jobAdForm').reset();
  document.getElementById('jobEditId').value = '';
  clearJobImage();
}

// ── Save (create or update) ────────────────────────────────────────────────

async function saveJobAd() {
  const editId      = document.getElementById('jobEditId').value;
  const title       = document.getElementById('jobTitle').value.trim();
  const grade       = document.getElementById('jobGrade').value;
  const school      = document.getElementById('jobSchool').value;
  const description = document.getElementById('jobDescription').value.trim();
  const deadline    = document.getElementById('jobDeadline').value;
  const vacancies   = parseInt(document.getElementById('jobVacancies').value, 10) || 1;

  if (!title || !grade || !school || !description || !deadline) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  // New file takes priority; for edits keep the existing image if no new file chosen
  let image = await getJobImageBase64();
  if (image === null && editId) {
    const existing = jobOpenings.find(j => String(j.id) === String(editId));
    image = existing ? (existing.image || '') : '';
  }
  if (image === null) image = '';

  const payload = { title, grade, school, description, deadline, vacancies, image, postedBy: currentUser.name };

  try {
    if (editId) {
      await api('/jobs/' + editId, { method: 'PATCH', body: JSON.stringify(payload) });
      showToast('Job advertisement updated!', 'success');
    } else {
      await api('/jobs', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Job advertisement created!', 'success');
    }
    await refreshAllData();
    closeJobAdModal();
    loadJobAds();
  } catch (e) {
    showToast(e.message || 'Failed to save job', 'error');
  }
}

async function createJobAd() { return saveJobAd(); }

// ── Delete ─────────────────────────────────────────────────────────────────

async function deleteJobAd(jobId) {
  if (!confirm('Are you sure you want to delete this job advertisement?')) return;
  try {
    await api('/jobs/' + jobId, { method: 'DELETE' });
    await refreshAllData();
    showToast('Job advertisement deleted!', 'success');
    loadJobAds();
  } catch (e) {
    showToast(e.message || 'Failed to delete', 'error');
  }
}

/** Job advertisements — API-backed */
async function createJobAd() {
  const title = document.getElementById('jobTitle').value;
  const grade = document.getElementById('jobGrade').value;
  const school = document.getElementById('jobSchool').value;
  const description = document.getElementById('jobDescription').value;
  const deadline = document.getElementById('jobDeadline').value;

  if (!title || !grade || !school || !description || !deadline) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  try {
    await api('/jobs', {
      method: 'POST',
      body: JSON.stringify({
        title,
        grade,
        school,
        description,
        deadline,
        postedBy: currentUser.name,
      }),
    });
    await refreshAllData();
    showToast('Job advertisement created successfully!', 'success');
    document.getElementById('jobTitle').value = '';
    document.getElementById('jobGrade').value = '';
    document.getElementById('jobSchool').value = '';
    document.getElementById('jobDescription').value = '';
    document.getElementById('jobDeadline').value = '';
    closeJobAdModal();
    loadJobAds();
  } catch (e) {
    showToast(e.message || 'Failed to create job', 'error');
  }
}

async function deleteJobAd(jobId) {
  if (!confirm('Are you sure you want to delete this job advertisement?')) {
    return;
  }
  try {
    await api('/jobs/' + jobId, { method: 'DELETE' });
    await refreshAllData();
    showToast('Job advertisement deleted successfully!', 'success');
    loadJobAds();
  } catch (e) {
    showToast(e.message || 'Failed to delete', 'error');
  }
}

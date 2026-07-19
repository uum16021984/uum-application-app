/** Admin JSM quick actions — only called from openAdminViewForm (Evaluate flow) */

async function adminApprove(appId) {
  if (!confirm('Approve this application?')) return;
  try {
    await apiPatchApplication(appId, { status: 'approved' });
    showToast('Permohonan DILULUSKAN!', 'success');
    await loadAdminJSMDashboard();
  } catch (e) {
    showToast(e.message || 'Failed to approve', 'error');
  }
}

async function adminReject(appId) {
  const reason = prompt('Please provide a reason for rejection (required):');
  if (reason === null) return; // cancelled
  if (!reason.trim()) {
    showToast('Rejection reason is required', 'error');
    return;
  }
  try {
    await apiPatchApplication(appId, { status: 'rejected', rejectionReason: reason.trim() });
    showToast('Permohonan DITOLAK.', 'info');
    await loadAdminJSMDashboard();
  } catch (e) {
    showToast(e.message || 'Failed to reject', 'error');
  }
}

/** Admin School actions — called from openSchoolViewForm */

async function schoolApprove(appId) {
  if (!confirm('Approve this application?')) return;
  try {
    await apiPatchApplication(appId, { status: 'approved' });
    showToast('Permohonan DILULUSKAN!', 'success');
    await refreshAllData();
    loadSchoolEvaluatePage();
  } catch (e) {
    showToast(e.message || 'Failed to approve', 'error');
  }
}

async function schoolReject(appId) {
  const reason = prompt('Please provide a reason for rejection (required):');
  if (reason === null) return; // cancelled
  if (!reason.trim()) {
    showToast('Rejection reason is required', 'error');
    return;
  }
  try {
    await apiPatchApplication(appId, { status: 'rejected', rejectionReason: reason.trim() });
    showToast('Permohonan DITOLAK.', 'info');
    await refreshAllData();
    loadSchoolEvaluatePage();
  } catch (e) {
    showToast(e.message || 'Failed to reject', 'error');
  }
}

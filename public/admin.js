/** Admin JSM quick actions (Evaluate flow) */
async function adminApprove(appId) {
  try {
    await apiPatchApplication(appId, { status: 'approved' });
    showToast('Permohonan DILULUSKAN!', 'success');
    openAdminViewForm(appId);
  } catch (e) {
    showToast(e.message || 'Failed to approve', 'error');
  }
}

async function adminReject(appId) {
  try {
    await apiPatchApplication(appId, { status: 'rejected' });
    showToast('Permohonan DITOLAK.', 'info');
    openAdminViewForm(appId);
  } catch (e) {
    showToast(e.message || 'Failed to reject', 'error');
  }
}

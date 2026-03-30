async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    currentUser = data.user;
    currentRole = currentUser.role;
    closeAuthModal();
    await refreshAllData();
    showDashboard();
    showToast('Login successful!', 'success');
  } catch (e) {
    showToast(e.message || 'Invalid email or password', 'error');
  }
}

async function register() {
  const role = document.getElementById('registerRole').value;
  let payload;
  if (role === 'calon') {
    const name = document.getElementById('registerName').value;
    const phone = document.getElementById('registerPhone').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const grade = document.getElementById('registerGrade').value;
    const school = document.getElementById('registerSchool').value;
    if (!name || !phone || !email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    payload = { email, password, name, phone, role: 'calon', grade, school };
  } else {
    const name = document.getElementById('adminRegisterName').value;
    const email = document.getElementById('adminRegisterEmail').value;
    const password = document.getElementById('adminRegisterPassword').value;
    let school = '';
    if (role === 'adminSchool') {
      school = document.getElementById('adminRegisterSchool').value;
    }
    if (!name || !email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    payload = { email, password, name, phone: '', role, grade: '', school };
  }
  try {
    await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showToast('Registration successful! Please login.', 'success');
    showLoginForm();
  } catch (e) {
    showToast(e.message || 'Registration failed', 'error');
  }
}

function logout() {
  setToken(null);
  currentUser = null;
  currentRole = null;
  applications = [];
  jobOpenings = [];
  notifications = [];
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('landingPage').style.display = 'flex';
  showToast('Logged out successfully', 'success');
}

async function restoreSession() {
  if (!getToken()) return;
  try {
    const { user } = await api('/auth/me');
    currentUser = user;
    currentRole = user.role;
    await refreshAllData();
    showDashboard();
  } catch {
    setToken(null);
    currentUser = null;
  }
}

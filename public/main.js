// ============================================================
// ADMIN JSM: VIEW FULL FORM + APPROVE / REJECT + DOWNLOAD .docx
// ============================================================
function openAdminViewForm(appId) {
    const app = applications.find(a => String(a.id) === String(appId));
    if (!app) { showToast('Application not found', 'error'); return; }

    document.getElementById('pageTitle').textContent = 'Evaluate – ' + app.applicantName;
    const contentArea = document.getElementById('contentArea');
    const d = app.details || {};

    contentArea.innerHTML = `
        <!-- Top action bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <button onclick="loadEvaluatePage()" style="background:#eee; border:1px solid #ccc; padding:6px 14px; border-radius:5px; cursor:pointer; font-size:13px;"><i class="fas fa-arrow-left mr-1"></i> Back</button>
                <h2 style="color:#003087; margin:0; font-size:18px;">Full Application Form</h2>
            </div>
                        <div style="display:flex; gap:8px;">
                <button onclick="downloadApplicationWord(${app.id})" style="background:#28a745; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer; font-size:13px; font-weight:600;">
                    <i class="fas fa-file-word mr-1"></i> Download Word
                </button>
             
        <!-- ===== UUM Header ===== -->
        <div class="card" style="padding:18px; margin-bottom:0;">
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #003087; padding-bottom:12px; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:50px; height:50px; background:#003087; border-radius:50%; display:flex; align-items:center; justify-content:center;"><span style="color:white; font-weight:bold; font-size:15px;">UUM</span></div>
                    <div><div style="font-weight:700; font-size:13px; color:#003087;">BORANG PERMOHONAN JAWATAN AKADEMIK</div><div style="font-size:10px; color:#888; font-style:italic;">APPLICATION FORM FOR ACADEMIC POST</div></div>
                </div>
                <div style="width:80px; height:90px; border:2px solid #999; display:flex; align-items:center; justify-content:center; background:#fafafa; border-radius:4px;"><span style="font-size:9px; color:#999; text-align:center;">Passport Size<br>Photograph</span></div>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <tr style="background:#f0f4f8;"><td style="padding:6px 9px; border:1px solid #ccc; width:42%;"><strong>JAWATAN / Position</strong></td><td style="padding:6px 9px; border:1px solid #ccc; font-weight:500;">${app.position}</td></tr>
                <tr style="background:#f0f4f8;"><td style="padding:6px 9px; border:1px solid #ccc;"><strong>GRED JAWATAN / Grade</strong></td><td style="padding:6px 9px; border:1px solid #ccc; font-weight:500;">${app.grade}</td></tr>
                <tr style="background:#f0f4f8;"><td style="padding:6px 9px; border:1px solid #ccc;"><strong>BIDANG PENGKHUSUSAN / Specialization</strong></td><td style="padding:6px 9px; border:1px solid #ccc;">${d.specialization || '–'}</td></tr>
                <tr style="background:#f0f4f8;"><td style="padding:6px 9px; border:1px solid #ccc;"><strong>PUSAT PENGAJIAN / School</strong></td><td style="padding:6px 9px; border:1px solid #ccc; font-weight:500;">${app.school}</td></tr>
            </table>
        </div>

        <!-- ===== Section A: Personal Details (READ-ONLY) ===== -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 14px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(A) BUTIRAN PERIBADI / <span style="font-weight:400; font-style:italic;">PERSONAL DETAILS</span></div>
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; width:35%; color:#666; font-weight:600;">Nama Penuh / Full Name</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${app.applicantName}</td></tr>
                <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">No. K/P Baru / New IC</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.newIC || '–'}</td></tr>
                <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">Tarikh Lahir / DOB</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.dob || '–'}</td></tr>
                <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">Agama / Religion</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.religion || '–'}</td></tr>
                <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">Jantina / Gender</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.gender || '–'}</td></tr>
                <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">Telefon / Phone</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.phone || '–'}</td></tr>
                <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">Emel / Email</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.email || '–'}</td></tr>
                <tr><td style="padding:5px 8px; color:#666; font-weight:600;">Alamat Tetap / Address</td><td style="padding:5px 8px;">${d.permAddress || '–'}</td></tr>
            </table>
        </div>

        <!-- Sections B–L placeholder (read-only labels) -->
        ${['(B) MAKLUMAT PENGAJIAN PENDAH & MENENGAH','(C) MAKLUMAT PENGAJIAN TINGGI','(D) PENDAFTARAN PROFESIONAL','(E) PEMEGANG BIASISWA, PINJAMAN','(F) PEKERJAAN SEKARANG','(G) PENGALAMAN KERJA','(H) KEGIATAN KOKURIKULUM & SOSIAL','(I) PENERBITAN / PUBLICATION','(J) PENYELIDIKAN / RESEARCH','(K) PERAKUAN / REFERENCE','(L) PENGAKUAN PEMOHON / DECLARATION'].map(sec => `
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">${sec}</div>
            <p style="color:#888; font-size:12px; font-style:italic;">– Data dari borang calon –</p>
64: </div>`).join('')}
65:
66: }

// adminApprove / adminReject — see admin.js (API)

// ── Download application as .docx (Word) using Blob ──
function downloadApplicationWord(appId) {
    const app = applications.find(a => String(a.id) === String(appId));
    if (!app) return;
    const d = app.details || {};

    // Simple .docx is actually a ZIP. We'll generate a basic WordprocessingML document.
    // For simplicity we create a plain-text .docx-compatible RTF-style approach using Blob.
    // A real .docx needs JSZip + XML. We'll use a simple approach: generate an HTML file that Word can open as .doc

    const htmlContent = `
    <html><head><meta charset="utf-8"><style>
        body { font-family: Arial, sans-serif; font-size: 11pt; margin: 40px; }
        h1 { text-align:center; color:#003087; font-size:16pt; }
        h2 { color:#003087; font-size:13pt; border-bottom:2px solid #003087; padding-bottom:4px; }
        table { width:100%; border-collapse:collapse; margin-bottom:16px; }
        td, th { border:1px solid #ccc; padding:6px 8px; font-size:10pt; }
        th { background:#f0f4f8; font-weight:600; color:#003087; }
        .label { width:38%; background:#f7fafc; font-weight:600; color:#444; }
        .section-header { background:#003087; color:white; padding:6px 10px; font-weight:600; font-size:11pt; }
        .uum-header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #003087; padding-bottom:12px; margin-bottom:16px; }
        .logo-box { width:70px; height:70px; border:2px solid #003087; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#003087; font-size:18pt; }
    </style></head><body>
        <div class="uum-header">
            <div style="display:flex; align-items:center; gap:14px;">
                <div class="logo-box">UUM</div>
                <div><h1 style="text-align:left; margin:0;">BORANG PERMOHONAN JAWATAN AKADEMIK</h1><div style="font-style:italic; color:#666;">APPLICATION FORM FOR ACADEMIC POST</div></div>
            </div>
            <div style="width:80px; height:90px; border:2px solid #999; display:flex; align-items:center; justify-content:center; text-align:center; font-size:9pt; color:#888;">Passport Size<br>Photograph</div>
        </div>

        <table><tr><td class="label">JAWATAN / Position</td><td>${app.position}</td></tr><tr><td class="label">GRED JAWATAN / Grade</td><td>${app.grade}</td></tr><tr><td class="label">BIDANG PENGKHUSUSAN / Specialization</td><td>${d.specialization||''}</td></tr><tr><td class="label">PUSAT PENGAJIAN / School</td><td>${app.school}</td></tr></table>

        <div class="section-header">(A) BUTIRAN PERIBADI / PERSONAL DETAILS</div>
        <table><tr><td class="label">Nama Penuh / Full Name</td><td>${app.applicantName}</td></tr><tr><td class="label">No. K/P Baru / New IC</td><td>${d.newIC||''}</td></tr><tr><td class="label">Tarikh Lahir / Date of Birth</td><td>${d.dob||''}</td></tr><tr><td class="label">Agama / Religion</td><td>${d.religion||''}</td></tr><tr><td class="label">Jantina / Gender</td><td>${d.gender||''}</td></tr><tr><td class="label">Telefon / Phone</td><td>${d.phone||''}</td></tr><tr><td class="label">Emel / Email</td><td>${d.email||''}</td></tr><tr><td class="label">Alamat Tetap / Permanent Address</td><td>${d.permAddress||''}</td></tr></table>

        <div class="section-header">(B) MAKLUMAT PENGAJIAN PENDAH &amp; MENENGAH</div>
        <table><tr><th>Peringkat / Level</th><th>Institusi / Institution</th><th>Tahun / Year</th><th>Bidang / Area</th></tr><tr><td>Sekolah Rendah / Primary</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>Sekolah Menengah / Secondary</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(C) MAKLUMAT PENGAJIAN TINGGI / HIGHER EDUCATION</div>
        <table><tr><th>Tahap / Level</th><th>Institusi</th><th>Tahun Tamat</th><th>CGPA</th><th>Bidang</th></tr><tr><td>PhD</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>Master</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>Degree</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>Diploma</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(D) PENDAFTARAN PROFESIONAL / PROFESSIONAL AFFILIATION</div>
        <table><tr><th>Nama Badan Profesional</th><th>Tarikh Keahlian</th><th>No. Siri Pendaftaran</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(E) PEMEGANG BIASISWA, PINJAMAN / SCHOLARSHIP, LOAN</div>
        <table><tr><th>Badan yang Memberi</th><th>Tempoh</th><th>Terikat / Tidak Terikat</th><th>Biasiswa / Pinjaman</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(F) PEKERJAAN SEKARANG / CURRENT JOB</div>
        <table><tr><th>Nama Jawatan</th><th>Nama Majikan</th><th>Gaji &amp; Gred</th><th>Tarikh Mula</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(G) PENGALAMAN KERJA / WORKING EXPERIENCES</div>
        <table><tr><th>Nama Jawatan</th><th>Majikan</th><th>Gaji</th><th>Dari</th><th>Hingga</th><th>Sebab Berhenti</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(H) KEGIATAN KOKURIKULUM &amp; SOSIAL</div>
        <table><tr><th>Peringkat Sekolah / Kolej / Universiti</th><th>Peringkat Luar Sekolah</th></tr><tr><td style="height:60px;">&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(I) PENERBITAN / PUBLICATION</div>
        <table><tr><th>Pengarang</th><th>Tajuk / Title</th><th>Jurnal / Journal</th><th>Tarikh</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(J) PENYELIDIKAN / RESEARCH</div>
        <table><tr><th>Tajuk / Title</th><th>Bidang / Field</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>

        <div class="section-header">(K) PERAKUAN / REFERENCE</div>
        <table><tr><th style="width:50%;">Rujukan 1</th><th>Rujukan 2</th></tr><tr><td>Nama: &nbsp;<br>Alamat: &nbsp;<br>No Tel: &nbsp;<br>Pekerjaan: &nbsp;</td><td>Nama: &nbsp;<br>Alamat: &nbsp;<br>No Tel: &nbsp;<br>Pekerjaan: &nbsp;</td></tr></table>

        <div class="section-header">(L) PENGAKUAN PEMOHON / APPLICANT'S DECLARATION</div>
        <p style="font-size:10pt; color:#444;">☐ Saya akui bahawa maklumat yang diberi serta lampirannya adalah lengkap, betul dan benar...</p>
        <div style="display:flex; justify-content:space-between; margin-top:50px;">
            <div style="width:45%; border-bottom:1px solid #000; padding-top:40px; text-align:center; font-size:10pt; color:#666;">Tandatangan Pemohon / Applicant's Signature</div>
            <div style="width:30%; border-bottom:1px solid #000; padding-top:40px; text-align:center; font-size:10pt; color:#666;">Tarikh / Date</div>
        </div>

        <div style="margin-top:30px; border-top:2px solid #003087; padding-top:10px; text-align:center; font-size:10pt; color:#888;">
            Status: <strong>${app.status.toUpperCase()}</strong> &nbsp;|&nbsp; Evaluated by Admin JSM &nbsp;|&nbsp; Date: ${new Date().toISOString().split('T')[0]}
        </div>
    </body></html>`;

    // Create blob and download as .doc (Word-compatible HTML)
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Application_${app.applicantName.replace(/\s+/g,'_')}_${app.position.replace(/\s+/g,'_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded! Buka dalam Microsoft Word.', 'success');
}

        // ============================================================
// ADMIN JSM: EVALUATE PAGE – list all pending applications
// ============================================================
function loadEvaluatePage() {

    document.getElementById('pageTitle').textContent = 'Evaluate Applications';
    const contentArea = document.getElementById('contentArea');

    const pendingApps = applications.filter(app => app.status === 'pending');

    if (pendingApps.length === 0) {
        contentArea.innerHTML = `
            <div class="card">
                <p>No applications to evaluate.</p>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = pendingApps.map(app => `
        <div class="card mb-4">
            <h3 class="font-bold text-lg">${app.position}</h3>
            <p><strong>Applicant:</strong> ${app.applicantName}</p>
            <p><strong>Status:</strong> ${app.status}</p>

            <div class="mt-3">
                <button onclick="adminApprove(${app.id})" 
                    class="bg-green-600 text-white px-3 py-1 rounded mr-2">
                    Approve
                </button>

                <button onclick="adminReject(${app.id})" 
                    class="bg-red-600 text-white px-3 py-1 rounded">
                    Reject
                </button>
            </div>
        </div>
    `).join("");
}
function calcAge() {
    const dob = new Date(document.getElementById('dob').value);
    if (isNaN(dob)) {
        document.getElementById('ageField').value = '';
        return;
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    document.getElementById('ageField').value = age;
}
function formatIC(input) {
    // Remove non-numbers
    let value = input.value.replace(/\D/g, '');

    // Limit to 12 digits only
    if (value.length > 12) {
        value = value.slice(0, 12);
    }

    // Format into 6-2-4
    if (value.length > 6 && value.length <= 8) {
        value = value.replace(/(\d{6})(\d+)/, '$1-$2');
    } 
    else if (value.length > 8) {
        value = value.replace(/(\d{6})(\d{2})(\d+)/, '$1-$2-$3');
    }

    input.value = value;
}
function formatPassport(input) {
    let value = input.value.toUpperCase();

    // Remove everything except letters and numbers
    value = value.replace(/[^A-Z0-9]/g, '');

    // First character must be letter
    if (value.length > 0) {
        value = value[0].replace(/[^A-Z]/g, '') + value.slice(1);
    }

    // After first character, allow digits only
    if (value.length > 1) {
        value = value[0] + value.slice(1).replace(/[^0-9]/g, '');
    }

    // Limit to 9 characters (1 letter + 8 digits)
    if (value.length > 9) {
        value = value.slice(0, 9);
    }

    input.value = value;
}
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');

    // Must start with 01
    if (value.length > 0 && !value.startsWith('01')) {
        value = '01' + value.replace(/^0+/, '');
    }

    // Limit to 11 digits max
    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    // Add dash after 3 digits
    if (value.length > 3) {
        value = value.replace(/(\d{3})(\d+)/, '$1-$2');
    }

    input.value = value;
}

function formatNumChildren(input) {
    // Keep only digits
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 2 digits
    if (value.length > 2) value = value.slice(0, 2);

    // Update input
    input.value = value;

    // Optional: display "X anak"
    const display = document.getElementById('displayChildren');
    if (display) display.textContent = value ? `${value} anak` : '';
}
// Passport photo preview
function previewPassport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        document.getElementById('passportPreview').innerHTML =
            `<img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
}

// Submit the full application (from calon side)
// ============================================================
// SUBMIT FULL APPLICATION (Gabungan Submit & Save Draft)
// ============================================================
async function submitFullApplication(isDraft = false) {
    const name = document.getElementById('fullName')?.value?.trim();

    if (!name) {
        showToast('Sila isi Nama Penuh terlebih dahulu.', 'error');
        return;
    }
    const declaration = document.getElementById('declCheck');
    if (!isDraft && declaration && !declaration.checked) {
        showToast('Sila tick kotak Declaration sebelum submit.', 'error');
        return;
    }

    const formData = {
        newIC: document.getElementById('newIC')?.value || '',
        oldIC: document.getElementById('oldIC')?.value || '',
        dob: document.getElementById('dob')?.value || '',
        religion: document.getElementById('religion')?.value || '',
        passportNo: document.getElementById('passportNo')?.value || '',
        citizenship: document.getElementById('citizenship')?.value || '',
        gender: document.getElementById('gender')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        permAddress: document.getElementById('permAddress')?.value || '',
        mailAddress: document.getElementById('mailAddress')?.value || '',
        maritalStatus: document.querySelector('input[name="maritalStatus"]:checked')?.value || '',
        numChildren: document.getElementById('numChildren')?.value || '0',
        spouseName: document.getElementById('spouseName')?.value || '',
        spouseEmployer: document.getElementById('spouseEmployer')?.value || '',
        parentName: document.getElementById('parentName')?.value || '',
        parentEmployer: document.getElementById('parentEmployer')?.value || '',
        specialization: document.querySelector('#applyFormPage input[placeholder*="Computer Science"]')?.value || ''
    };

    try {
        await apiCreateApplication({
            applicantName: name,
            position: document.getElementById('displayPosition')?.textContent || 'N/A',
            grade: document.getElementById('displayGrade')?.textContent || 'N/A',
            school: document.getElementById('displaySchool')?.textContent || 'N/A',
            status: isDraft ? 'draft' : 'pending',
            dateApplied: new Date().toISOString().split('T')[0],
            details: formData
        });
        await refreshAllData();
        showToast(isDraft ? 'Draft berjaya disimpan!' : 'Permohonan berjaya dihantar!', 'success');
        closeApplyFormPage();
        loadMyApplications();
    } catch (e) {
        showToast(e.message || 'Failed to save application', 'error');
    }
}

// ============================================================
// ADD ROW FUNCTIONS - Untuk tambah baris dalam jadual
// ============================================================

// Add row untuk Higher Education (Section C)
function addHigherEduRow() {
    const tbody = document.getElementById('higherEduBody');
    if (!tbody) return;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td style="border:1px solid #ccc; padding:8px; background:#fafafa;"><input type="text" placeholder="e.g. Certificate" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc; padding:4px; text-align:center;"><input type="file" accept=".pdf,.jpg,.jpeg,.png" style="font-size:11px; width:100%;" title="Upload SPM Certificate"></td>
        <td style="border:1px solid #ccc; padding:4px; text-align:center;"><input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="font-size:11px; width:100%;" title="Upload Transcript/CV"></td>
    `;
    tbody.appendChild(newRow);
    showToast('Baris baru ditambah!', 'success');
}

// Add row untuk Work Experience (Section G)
function addWorkExpRow() {
    const tbody = document.getElementById('workExpBody');
    if (!tbody) return;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
    `;
    tbody.appendChild(newRow);
    showToast('Baris baru ditambah!', 'success');
}

// Add row untuk Professional Affiliation (Section D)
function addProfAffRow() {
    const tbody = document.querySelector('#applyFormPage table tbody');
    if (!tbody) return;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
    `;
    tbody.appendChild(newRow);
    showToast('Baris baru ditambah!', 'success');
}

// Add row untuk Publication (Section I)
function addPublicationRow() {
    const tables = document.querySelectorAll('#applyFormPage table');
    let pubTable = null;
    
    // Cari table publication (yang ada header "Pengarang")
    for (let table of tables) {
        const headers = table.querySelectorAll('th');
        for (let header of headers) {
            if (header.textContent.includes('Pengarang')) {
                pubTable = table;
                break;
            }
        }
        if (pubTable) break;
    }
    
    if (!pubTable) return;
    
    const tbody = pubTable.querySelector('tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
    `;
    tbody.appendChild(newRow);
    showToast('Baris baru ditambah!', 'success');
}

// Add row untuk Research (Section J)
function addResearchRow() {
    const tables = document.querySelectorAll('#applyFormPage table');
    let resTable = null;
    
    // Cari table research (yang ada header dengan "PENYELIDIKAN")
    for (let table of tables) {
        const prevDiv = table.previousElementSibling;
        if (prevDiv && prevDiv.textContent.includes('PENYELIDIKAN')) {
            resTable = table;
            break;
        }
    }
    
    if (!resTable) return;
    
    const tbody = resTable.querySelector('tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
    `;
    tbody.appendChild(newRow);
    showToast('Baris baru ditambah!', 'success');
}

        // ── OPEN the Apply Form Page ──
function openApplyFormPage(position, grade, school) {
    // Isi position info yang auto-populated
    document.getElementById('displayPosition').textContent = position;
    document.getElementById('displayGrade').textContent = grade;
    document.getElementById('displaySchool').textContent = school;

    // Set today's date for declaration
    document.getElementById('declarationDate').valueAsDate = new Date();

    // Show the page
    document.getElementById('applyFormPage').style.display = 'block';

    // Scroll to top
    document.getElementById('applyFormPage').scrollTop = 0;
}

// ── CLOSE the Apply Form Page ──
function closeApplyFormPage() {
    document.getElementById('applyFormPage').style.display = 'none';
}

// (duplicate submitFullApplication removed — use async submitFullApplication(isDraft) above)

let applications = [];
let jobAds = [];

let currentUser = null;
let currentRole = null;
let notifications = [];
let jobOpenings = [];
let currentApplicationId = null;

async function refreshAllData() {
    if (!getToken()) {
        applications = [];
        jobOpenings = [];
        notifications = [];
        return;
    }
    try {
        const [apps, jobs, notes] = await Promise.all([
            api('/applications'),
            api('/jobs'),
            api('/notifications')
        ]);
        applications = apps;
        jobOpenings = jobs;
        notifications = notes;
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    await restoreSession();
    document.getElementById('registerLink').addEventListener('click', function (e) {
        e.preventDefault();
        showRegisterForm();
    });
    document.getElementById('loginLink').addEventListener('click', function (e) {
        e.preventDefault();
        showLoginForm();
    });
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    document.getElementById('notificationBtn').addEventListener('click', showNotifications);
});

        // Show login modal
        function showLoginModal() {
            document.getElementById('authModal').classList.add('active');
            document.getElementById('authModalTitle').textContent = 'Login';
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
        }

        // Close auth modal
        function closeAuthModal() {
            document.getElementById('authModal').classList.remove('active');
        }

        // Show register form
        function showRegisterForm() {
            document.getElementById('authModalTitle').textContent = 'Register';
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            
            // Show appropriate fields based on role
            updateRegisterForm();
        }

        // Update register form based on role selection
        function updateRegisterForm() {
            const role = document.getElementById('registerRole').value;
            
            if (role === 'calon') {
                document.getElementById('calonRegisterFields').style.display = 'block';
                document.getElementById('adminRegisterFields').style.display = 'none';
            } else {
                document.getElementById('calonRegisterFields').style.display = 'none';
                document.getElementById('adminRegisterFields').style.display = 'block';
                
                if (role === 'adminSchool') {
                    document.getElementById('adminSchoolField').style.display = 'block';
                } else {
                    document.getElementById('adminSchoolField').style.display = 'none';
                }
            }
        }

        // Show login form
        function showLoginForm() {
            document.getElementById('authModalTitle').textContent = 'Login';
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
        }

// login / register — see auth.js

async function applyForJob(jobId) {
    if (!currentUser) {
        alert('Please login first.');
        return;
    }
    const job = jobOpenings.find(j => String(j.id) === String(jobId));
    if (!job) {
        alert('Job not found.');
        return;
    }
    try {
        await apiCreateApplication({
            applicantName: currentUser.name,
            position: job.title,
            grade: job.grade,
            school: job.school,
            status: 'pending',
            dateApplied: new Date().toISOString().split('T')[0],
            jobId: job.id,
            jobTitle: job.title,
            applicant: currentUser.name
        });
        await refreshAllData();
        alert('Application submitted successfully!');
    } catch (e) {
        alert(e.message || 'Failed to submit');
    }
}
function loadAvailableJobs() {
    const contentArea = document.getElementById("contentArea");

    if (!contentArea) {
        console.error("contentArea not found!");
        return;
    }

    contentArea.innerHTML = "";

    if (!jobOpenings || jobOpenings.length === 0) {
        contentArea.innerHTML = `
            <div class="card">
                <p>No job openings available.</p>
            </div>
        `;
        return;
    }

    jobOpenings.forEach(job => {
        contentArea.innerHTML += createJobCard(job);
    });
};


function loadSchoolAdminApplications() {
    const contentArea = document.getElementById("contentArea");
    const pageTitle = document.getElementById("pageTitle");

    pageTitle.textContent = "School Applications";

    const schoolApps = applications.filter(app =>app.school === currentUser.school);

    if (schoolApps.length === 0) {
        contentArea.innerHTML = `
            <div class="card">
                <p>No applications for your school.</p>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = schoolApps.map(app => `
        <div class="card">
            <h3>${app.position || app.jobTitle || '—'}</h3>
            <p><strong>Applicant:</strong> ${app.applicantName || app.applicant || '—'}</p>
            <p><strong>Status:</strong> ${app.status}</p>
        </div>
    `).join("");
}

// register() — see auth.js

        // Show dashboard
        function showDashboard() {
            document.getElementById('landingPage').style.display = 'none';
            document.getElementById('dashboard').style.display = 'flex';
            void refreshAllData();

            // Set user info in sidebar
            document.getElementById('userName').textContent = currentUser.name;
            document.getElementById('userRole').textContent = getRoleDisplayName(currentUser.role);
            
            // Setup sidebar menu based on role
            setupSidebarMenu();
            
            // Load default content
            if (currentUser.role === 'calon') {
                loadCalonDashboard();
            } else if (currentUser.role === 'adminJSM') {
                loadAdminJSMDashboard();
            } else if (currentUser.role === 'adminSchool') {
                loadAdminSchoolDashboard();
            }
            
            // Update notification badge
            updateNotificationBadge();
        }

        // Get role display name
        function getRoleDisplayName(role) {
            switch (role) {
                case 'calon': return 'Applicant';
                case 'adminJSM': return 'Admin JSM';
                case 'adminSchool': return 'Admin School';
                default: return '';
            }
        }

        // Setup sidebar menu based on role
      function setupSidebarMenu() {
    const menuContainer = document.getElementById('sidebarMenu');
    menuContainer.innerHTML = '';

    let menuItems = [];

    if (currentUser.role === 'calon') {
        menuItems = [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', action: 'loadCalonDashboard' },
            { icon: 'fas fa-briefcase', text: 'Job Advertisements', action: 'loadAvailableJobs' },
            { icon: 'fas fa-bell', text: 'Notifications', action: 'loadNotifications' },
            { icon: 'fas fa-file-alt', text: 'My Applications', action: 'loadMyApplications' },
            { icon: 'fas fa-cog', text: 'Settings', action: 'loadSettings' }
        ];
    }

    else if (currentUser.role === 'adminJSM') {
        menuItems = [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', action: 'loadAdminJSMDashboard' },
            { icon: 'fas fa-bullhorn', text: 'Job Advertisements', action: 'loadJobAds' },
            { icon: 'fas fa-clipboard-check', text: 'Evaluate', action: 'loadEvaluatePage' },
            { icon: 'fas fa-file-alt', text: 'View Applications', action: 'loadViewApplications' },
            { icon: 'fas fa-user-graduate', text: 'DS11 Applications', action: 'loadDS11Applications' },
            { icon: 'fas fa-chalkboard-teacher', text: 'DS13 Applications', action: 'loadDS13Applications' },
            { icon: 'fas fa-history', text: 'History', action: 'loadHistory' },
            { icon: 'fas fa-eye', text: 'Monitor Schools', action: 'loadMonitorSchools' }
        ];
    }

    else if (currentUser.role === 'adminSchool') {
        menuItems = [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', action: 'loadAdminSchoolDashboard' },
            { icon: 'fas fa-file-alt', text: 'Applications', action: 'loadSchoolAdminApplications' }
        ];
    }

    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" onclick="${item.action}(); return false;" 
            class="flex items-center py-2 px-4 rounded hover:bg-blue-800 transition">
                <i class="${item.icon} mr-3"></i> ${item.text}
            </a>
        `;
        menuContainer.appendChild(li);
    });
}

        // Toggle sidebar
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('sidebar-closed');
        }

        // Load applicant dashboard
     function loadCalonDashboard() {
    document.getElementById('pageTitle').textContent = 'Dashboard';
    const contentArea = document.getElementById('contentArea');

    let jobOpeningsHTML = '';

    jobOpenings.forEach(job => {
        jobOpeningsHTML += `
            <div class="card job-ad">
                <h3 class="text-lg font-semibold primary-text mb-2">${job.title}</h3>
                <p class="text-gray-600 mb-2">${job.description}</p>

                <div class="flex justify-between items-center">
                    <div>
                        <span class="text-sm text-gray-500">Grade: ${job.grade}</span><br>
                        <span class="text-sm text-gray-500">School: ${job.school}</span><br>
                        <span class="text-sm text-gray-500">Deadline: ${job.deadline}</span><br>
                        <span class="text-sm text-gray-500">Posted by: ${job.postedBy}</span>
                    </div>

                    ${currentUser.role === 'calon' ? `
                        <button onclick="selectJobAndApply('${job.id}')"
                        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            <i class="fas fa-file-edit mr-1"></i> Apply Now
                        </button>
                    ` : ``}
                </div>
            </div>
        `;
    });

    contentArea.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold primary-text mb-4">
                Welcome, ${currentUser.name}!
            </h2>
            <p class="text-gray-600">
                Here are the current job openings at UUM:
            </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
            ${jobOpeningsHTML}
        </div>
    `;
}
function selectJobAndApply(jobId) {

    if (!currentUser || currentUser.role !== 'calon') {
        if (typeof showToast === 'function') {
            showToast("Only applicants can apply for jobs.", "error");
        } else {
            alert("Only applicants can apply for jobs.");
        }
        return;
    }
 if(currentUser.role === "adminJSM" || currentUser.role === "adminSchool"){
        showToast("Admin cannot apply for jobs.", "error");
        return;
}
    currentApplyJob = jobOpenings.find(j => String(j.id) === String(jobId));
    loadApplyFormPage();
}
        
        // Load job advertisements for Admin JSM
        function loadJobAds() {
            document.getElementById('pageTitle').textContent = 'Job Advertisements';
            const contentArea = document.getElementById('contentArea');
            
            let jobAdsHTML = '';
            jobOpenings.forEach(job => {
                jobAdsHTML += `
                    <div class="card">
                        <h3 class="text-lg font-semibold primary-text mb-2">${job.title}</h3>
                        <p class="text-gray-600 mb-2">${job.description}</p>
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-sm text-gray-500">Grade: ${job.grade}</span><br>
                                <span class="text-sm text-gray-500">School: ${job.school}</span><br>
                                <span class="text-sm text-gray-500">Deadline: ${job.deadline}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            contentArea.innerHTML = `
                <div class="mb-6 flex justify-between items-center">
                    <h2 class="text-2xl font-bold primary-text">Job Advertisements</h2>
                    <button onclick="showJobAdModal()" class="btn-primary">
                        <i class="fas fa-plus mr-2"></i> Create New Ad
                    </button>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    ${jobAdsHTML}
                </div>
            `;
        }

        // Show job ad modal
        function showJobAdModal() {
            document.getElementById('jobAdModal').classList.add('active');
        }

        // Close job ad modal
        function closeJobAdModal() {
            document.getElementById('jobAdModal').classList.remove('active');
            document.getElementById('jobAdForm').reset();
        }

        // createJobAd / deleteJobAd — see jobs.js (loads after this file)

function createJobCard(job) {

    const open = isJobOpen(job);

    return `
        <div class="bg-white p-4 rounded shadow mb-4">
            <h3 class="text-lg font-bold">${job.title}</h3>
            <p><b>School:</b> ${job.school}</p>
            <p><b>Grade:</b> ${job.grade}</p>
            <p><b>Deadline:</b> ${job.deadline}</p>

            ${open ? 
                (currentUser.role === 'calon' ? `
                <button onclick="selectJobAndApply('${job.id}')"
                class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Apply Now
                </button>
                ` : ``)
            :
                `<span class="text-red-600 font-bold">Closed</span>`
            }

        </div>
    `;
}
        // Load notifications
        async function loadNotifications() {
            document.getElementById('pageTitle').textContent = 'Notifications';
            const contentArea = document.getElementById('contentArea');
            
            const userNotifications = notifications.filter(n => String(n.userId) === String(currentUser.id));
            
            let notificationsHTML = '';
            if (userNotifications.length === 0) {
                notificationsHTML = '<p class="text-gray-600">You have no notifications.</p>';
            } else {
                userNotifications.forEach(notification => {
                    const readClass = notification.read ? '' : 'notification-unread';
                    notificationsHTML += `
                        <div class="notification-item ${readClass}">
                            <h3 class="font-semibold">${notification.title}</h3>
                            <p class="text-gray-600">${notification.message}</p>
                            <p class="text-sm text-gray-500 mt-2">${notification.date}</p>
                        </div>
                    `;
                });
            }
            
            contentArea.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold primary-text mb-4">Your Notifications</h2>
                </div>
                <div class="card">
                    ${notificationsHTML}
                </div>
            `;
            
            try {
                await api('/notifications/mark-read', { method: 'PATCH' });
                await refreshAllData();
            } catch (e) {
                console.error(e);
            }
            updateNotificationBadge();
        }

        // Load my applications
function loadMyApplications() {

    document.getElementById('pageTitle').textContent = "My Applications";
    const contentArea = document.getElementById('contentArea');

    const userApplications = applications.filter(
        app => app.applicantName === currentUser.name
    );

    if (userApplications.length === 0) {
        contentArea.innerHTML = `
        <div class="card">
            <p class="text-gray-600">You have not submitted any applications yet.</p>
        </div>
        `;
        return;
    }

    let applicationsHTML = `
    <table class="min-w-full table-auto border">
        <thead class="bg-gray-200">
            <tr>
                <th class="p-2">Position</th>
                <th class="p-2">Grade</th>
                <th class="p-2">School</th>
                <th class="p-2">Date Applied</th>
                <th class="p-2">Status</th>
                <th class="p-2">Actions</th>
            </tr>
        </thead>
        <tbody>
    `;

    userApplications.forEach(app => {

        const statusClass = `status-${app.status}`;

        applicationsHTML += `
        <tr class="border-t">
            <td class="p-2">${app.position}</td>
            <td class="p-2">${app.grade}</td>
            <td class="p-2">${app.school}</td>
            <td class="p-2">${app.dateApplied}</td>
            <td class="p-2">
                <span class="status-badge ${statusClass}">
                    ${app.status}
                </span>
            </td>

            <td class="p-2">
                <div class="flex gap-2">

                    <button onclick="viewApplicationDetail(${app.id})"
                    class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                    <i class="fas fa-eye"></i> View
                    </button>

                    <button onclick="editApplication(${app.id})"
                    class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    <i class="fas fa-edit"></i> Edit
                    </button>

                    <button onclick="deleteApplication(${app.id})"
                    class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                    <i class="fas fa-trash"></i> Delete
                    </button>

                </div>
            </td>
        </tr>
        `;
    });

    applicationsHTML += `
        </tbody>
    </table>
    `;

    contentArea.innerHTML = `
        <div class="card">
            ${applicationsHTML}
        </div>
    `;
}
function editApplication(_id) {
    showToast('Open “Job Advertisements” and use Apply Now to complete the full form.', 'info');
}

async function deleteApplication(id) {
    if (!confirm("Are you sure you want to delete this application?")) {
        return;
    }
    try {
        await apiDeleteApplication(id);
        showToast("Application deleted successfully", "success");
        if (currentUser.role === "calon") {
            loadMyApplications();
        } else if (currentUser.role === "adminJSM") {
            loadViewApplications();
        }
    } catch (e) {
        showToast(e.message || "Delete failed", "error");
    }
}

        // Load settings
        function loadSettings() {
            document.getElementById('pageTitle').textContent = 'Settings';
            const contentArea = document.getElementById('contentArea');
            
            contentArea.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold primary-text mb-4">Profile Settings</h2>
                </div>
                <div class="card max-w-2xl">
                    <form id="settingsForm">
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="settingsName">
                                Name
                            </label>
                            <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="settingsName" type="text" value="${currentUser.name}">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="settingsPhone">
                                Phone Number
                            </label>
                            <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="settingsPhone" type="tel" value="${currentUser.phone}">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="settingsEmail">
                                Email
                            </label>
                            <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="settingsEmail" type="email" value="${currentUser.email}" readonly>
                        </div>
                        ${currentUser.role === 'calon' ? `
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="settingsGrade">
                                Grade
                            </label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="settingsGrade">
                                <option value="DS11" ${currentUser.grade === 'DS11' ? 'selected' : ''}>DS11</option>
                                <option value="DS13" ${currentUser.grade === 'DS13' ? 'selected' : ''}>DS13</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="settingsSchool">
                                School/Department
                            </label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="settingsSchool">
                                <option value="Tunku Puteri Intan Safinaz School of Accountancy" ${currentUser.school === 'Tunku Puteri Intan Safinaz School of Accountancy' ? 'selected' : ''}>Tunku Puteri Intan Safinaz School of Accountancy</option>
                                <option value="School of Business Management" ${currentUser.school === 'School of Business Management' ? 'selected' : ''}>School of Business Management</option>
                                <option value="School of Economics, Finance and Banking" ${currentUser.school === 'School of Economics, Finance and Banking' ? 'selected' : ''}>School of Economics, Finance and Banking</option>
                                <option value="School of International Business" ${currentUser.school === 'School of International Business' ? 'selected' : ''}>School of International Business</option>
                                <option value="School of Technology Management and Logistics" ${currentUser.school === 'School of Technology Management and Logistics' ? 'selected' : ''}>School of Technology Management and Logistics</option>
                                <option value="School of Computing" ${currentUser.school === 'School of Computing' ? 'selected' : ''}>School of Computing</option>
                                <option value="School of Education" ${currentUser.school === 'School of Education' ? 'selected' : ''}>School of Education</option>
                                <option value="School of Languages, Civilisation and Philosophy" ${currentUser.school === 'School of Languages, Civilisation and Philosophy' ? 'selected' : ''}>School of Languages, Civilisation and Philosophy</option>
                                <option value="School of Multimedia Technology and Communication" ${currentUser.school === 'School of Multimedia Technology and Communication' ? 'selected' : ''}>School of Multimedia Technology and Communication</option>
                                <option value="School of Quantitative Sciences" ${currentUser.school === 'School of Quantitative Sciences' ? 'selected' : ''}>School of Quantitative Sciences</option>
                                <option value="School of Social Development" ${currentUser.school === 'School of Social Development' ? 'selected' : ''}>School of Social Development</option>
                                <option value="School of Creative Industry Management" ${currentUser.school === 'School of Creative Industry Management' ? 'selected' : ''}>School of Creative Industry Management</option>
                                <option value="School of Government" ${currentUser.school === 'School of Government' ? 'selected' : ''}>School of Government</option>
                                <option value="School of Law" ${currentUser.school === 'School of Law' ? 'selected' : ''}>School of Law</option>
                                <option value="School of International Studies" ${currentUser.school === 'School of International Studies' ? 'selected' : ''}>School of International Studies</option>
                                <option value="School of Tourism, Hospitality and Event Management" ${currentUser.school === 'School of Tourism, Hospitality and Event Management' ? 'selected' : ''}>School of Tourism, Hospitality and Event Management</option>
                                <option value="School of Applied Psychology, Social Work and Policy" ${currentUser.school === 'School of Applied Psychology, Social Work and Policy' ? 'selected' : ''}>School of Applied Psychology, Social Work and Policy</option>
                                <option value="School of Communication" ${currentUser.school === 'School of Communication' ? 'selected' : ''}>School of Communication</option>
                            </select>
                        </div>
                        ` : ''}
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="settingsPassword">
                                New Password (leave blank to keep current)
                            </label>
                            <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" id="settingsPassword" type="password" placeholder="New password">
                        </div>
                        <button type="button" onclick="updateProfile()" class="btn-primary">
                            Update Profile
                        </button>
                    </form>
                </div>
            `;
        }

        // Update profile
        async function updateProfile() {
            const name = document.getElementById('settingsName').value;
            const phone = document.getElementById('settingsPhone').value;
            const password = document.getElementById('settingsPassword').value;

            if (!name || !phone) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            const body = { name, phone };
            if (password) body.password = password;
            if (currentUser.role === 'calon') {
                body.grade = document.getElementById('settingsGrade').value;
                body.school = document.getElementById('settingsSchool').value;
            }

            try {
                const { user } = await api('/auth/me', {
                    method: 'PATCH',
                    body: JSON.stringify(body),
                });
                currentUser = user;
                document.getElementById('userName').textContent = currentUser.name;
                showToast('Profile updated successfully!', 'success');
            } catch (e) {
                showToast(e.message || 'Update failed', 'error');
            }
        }

        // Load Admin JSM Dashboard
        function loadAdminJSMDashboard() {
            document.getElementById('pageTitle').textContent = 'Dashboard';
            const contentArea = document.getElementById('contentArea');
            
            const ds11Applications = applications.filter(a => a.grade === 'DS11');
            const ds13Applications = applications.filter(a => a.grade === 'DS13');
            
            contentArea.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold primary-text mb-4">Admin JSM Dashboard</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="card text-center">
                            <div class="text-3xl font-bold primary-text">${applications.length}</div>
                            <div class="text-gray-600">Total Applications</div>
                        </div>
                        <div class="card text-center">
                            <div class="text-3xl font-bold text-yellow-600">${applications.filter(a => a.status === 'pending').length}</div>
                            <div class="text-gray-600">Pending Applications</div>
                        </div>
                        <div class="card text-center">
                            <div class="text-3xl font-bold text-green-600">${applications.filter(a => a.status === 'approved').length}</div>
                            <div class="text-gray-600">Approved Applications</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex">
                            <button class="tab-btn py-2 px-4 border-b-2 font-medium text-sm" onclick="showTab('ds11-tab')">
                                DS11 Applications (${ds11Applications.length})
                            </button>
                            <button class="tab-btn py-2 px-4 border-b-2 font-medium text-sm" onclick="showTab('ds13-tab')">
                                DS13 Applications (${ds13Applications.length})
                            </button>
                        </nav>
                    </div>
                    
                    <div id="ds11-tab" class="tab-content active">
                        ${generateApplicationsTable(ds11Applications)}
                    </div>
                    
                    <div id="ds13-tab" class="tab-content">
                        ${generateApplicationsTable(ds13Applications)}
                    </div>
                </div>
            `;
        }

        // Generate applications table
        function generateApplicationsTable(apps) {
            if (apps.length === 0) {
                return '<p class="text-gray-600 p-4">No applications found.</p>';
            }
            
            let tableHTML = `
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="Search applications..." onkeyup="filterApplications(this, 'adminJSM')">
                    <i class="fas fa-search search-icon"></i>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th onclick="sortTable(0)">Name <i class="fas fa-sort text-gray-400"></i></th>
                                <th onclick="sortTable(1)">Grade <i class="fas fa-sort text-gray-400"></i></th>
                                <th onclick="sortTable(2)">School <i class="fas fa-sort text-gray-400"></i></th>
                                <th onclick="sortTable(3)">Date Applied <i class="fas fa-sort text-gray-400"></i></th>
                                <th onclick="sortTable(4)">Status <i class="fas fa-sort text-gray-400"></i></th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            apps.forEach(app => {
                const statusClass = `status-${app.status}`;
                tableHTML += `
                    <tr>
                        <td>${app.applicantName}</td>
                        <td>${app.grade}</td>
                        <td>${app.school}</td>
                        <td>${app.dateApplied}</td>
                        <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                        <td>
                            <button onclick="viewApplicationDetail(${app.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                                <i class="fas fa-eye"></i> View
                            </button>
                            ${app.status === 'pending' ? `
                            <button onclick="approveApplication(${app.id})" class="text-green-600 hover:text-green-800 mr-2">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button onclick="rejectApplication(${app.id})" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-times"></i> Reject
                            </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += `
                        </tbody>
                    </table>
                </div>
            `;
            
            return tableHTML;
        }
		function loadViewApplications() {
    const contentArea = document.getElementById("contentArea");
    const pageTitle = document.getElementById("pageTitle");

    pageTitle.textContent = "All Applications";

    if (applications.length === 0) {
        contentArea.innerHTML = `
            <div class="card">
                <p>No applications yet.</p>
            </div>
        `;
        return;
    }
       
    contentArea.innerHTML = applications.map(app => `
<div class="card">
    <h3>${app.position}</h3>
    <p><strong>Applicant:</strong> ${app.applicantName}</p>
    <p><strong>Status:</strong> ${app.status}</p>

    <button onclick="viewApplicationDetail('${app._id}')"
        class="bg-blue-600 text-white px-3 py-1 rounded mr-2">
        <i class="fas fa-eye"></i> View
    </button>

</div>
`).join("");
}
        // Load DS11 Applications


        // Load History
        /*function loadHistory() {
            document.getElementById('pageTitle').textContent = 'History';
            const contentArea = document.getElementById('contentArea');
            
            let relevantApplications = [];
            
            if (currentUser.role === 'adminJSM') {
                relevantApplications = applications;
            } else if (currentUser.role === 'adminSchool') {
                relevantApplications = applications.filter(a => a.school === currentUser.school);
            }
            
            let historyHTML = '';
            if (relevantApplications.length === 0) {
                historyHTML = '<p class="text-gray-600">No application history found.</p>';
            } else {
                historyHTML = `
                    <div class="mb-4 flex justify-end">
                        <button onclick="exportToCSV()" class="btn-primary">
                            <i class="fas fa-download mr-2"></i> Export to CSV
                        </button>
                    </div>
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="Search history..." onkeyup="filterApplications(this, 'history')">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th onclick="sortTable(0)">Name <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(1)">Position <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(2)">Grade <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(3)">School <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(4)">Date Applied <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(5)">Status <i class="fas fa-sort text-gray-400"></i></th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                relevantApplications.forEach(app => {
                    const statusClass = `status-${app.status}`;
                    historyHTML += `
                        <tr>
                            <td>${app.applicantName}</td>
                            <td>${app.position}</td>
                            <td>${app.grade}</td>
                            <td>${app.school}</td>
                            <td>${app.dateApplied}</td>
                            <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                            <td>
                                <button onclick="viewApplicationDetail(${app.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button onclick="downloadForm(${app.id})" class="text-green-600 hover:text-green-800">
                                    <i class="fas fa-download"></i> Download
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                historyHTML += `
                            </tbody>
                        </table> 
                    </div>
                `;
            }
            
            contentArea.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold primary-text mb-4">Application History</h2>
                </div>
                <div class="card">
                    ${historyHTML}
                </div>
            `;
        }*/

        function loadHistory() {
    document.getElementById('pageTitle').textContent = 'History';
    const contentArea = document.getElementById('contentArea');

    // For admin JSM: show ALL applications (pending, approved, rejected)
    let relevantApps = [];
    if (currentUser.role === 'adminJSM') {
        relevantApps = applications; // semua
    } else if (currentUser.role === 'adminSchool') {
        relevantApps = applications.filter(a => a.school === currentUser.school);
    }

    let rows = relevantApps.map(app => `
        <tr>
            <td>${app.applicantName}</td>
            <td>${app.position}</td>
            <td>${app.grade}</td>
            <td>${app.school}</td>
            <td>${app.dateApplied}</td>
            <td><span class="status-badge status-${app.status}">${app.status}</span></td>
            <td>
                <button onclick="openAdminViewForm(${app.id})" style="color:#003087; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600;"><i class="fas fa-eye mr-1"></i>View</button>
                <button onclick="downloadApplicationWord(${app.id})" style="color:#28a745; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; margin-left:8px;"><i class="fas fa-file-word mr-1"></i>Word</button>
            </td>
        </tr>
    `).join('');

    contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <h2 style="color:#003087; margin:0;"><i class="fas fa-history mr-2"></i>History – All Applications</h2>
            <button onclick="exportToCSV()" class="btn-primary"><i class="fas fa-download mr-1"></i> Export CSV</button>
        </div>
        <div class="card">
            <div class="search-container"><input type="text" class="search-input" placeholder="Search..." onkeyup="filterApplications(this,'history')"><i class="fas fa-search search-icon"></i></div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Nama</th><th>Jawatan</th><th>Gred</th><th>Sekolah</th><th>Tarikh</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
}

        // Load Monitor Schools
        function loadMonitorSchools() {
            document.getElementById('pageTitle').textContent = 'Monitor Schools';
            const contentArea = document.getElementById('contentArea');
            
            const schools = [
                "Tunku Puteri Intan Safinaz School of Accountancy",
                "School of Business Management",
                "School of Economics, Finance and Banking",
                "School of International Business",
                "School of Technology Management and Logistics",
                "School of Computing",
                "School of Education",
                "School of Languages, Civilisation and Philosophy",
                "School of Multimedia Technology and Communication",
                "School of Quantitative Sciences",
                "School of Social Development",
                "School of Creative Industry Management",
                "School of Government",
                "School of Law",
                "School of International Studies",
                "School of Tourism, Hospitality and Event Management",
                "School of Applied Psychology, Social Work and Policy",
                "School of Communication"
            ];
            
            let monitorHTML = '';
            schools.forEach(school => {
                const schoolApplications = applications.filter(a => a.school === school);
                const pendingCount = schoolApplications.filter(a => a.status === 'pending').length;
                const approvedCount = schoolApplications.filter(a => a.status === 'approved').length;
                const rejectedCount = schoolApplications.filter(a => a.status === 'rejected').length;
                
                monitorHTML += `
                    <div class="card">
                        <h3 class="text-lg font-semibold primary-text mb-2">${school}</h3>
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold text-yellow-600">${pendingCount}</div>
                                <div class="text-sm text-gray-600">Pending</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-green-600">${approvedCount}</div>
                                <div class="text-sm text-gray-600">Approved</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-red-600">${rejectedCount}</div>
                                <div class="text-sm text-gray-600">Rejected</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            contentArea.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold primary-text mb-4">Monitor Schools</h2>
                    <p class="text-gray-600">Application statistics by school/department</p>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    ${monitorHTML}
                </div>
            `;
        }

        // Load Admin School Dashboard
        function loadAdminSchoolDashboard() {
            document.getElementById('pageTitle').textContent = 'Dashboard';
            const contentArea = document.getElementById('contentArea');
            
            const schoolApplications = applications.filter(a => a.school === currentUser.school && a.status === 'approved');
            
            let applicationsHTML = '';
            if (schoolApplications.length === 0) {
                applicationsHTML = '<p class="text-gray-600">No approved applications for your school yet.</p>';
            } else {
                applicationsHTML = `
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="Search applications..." onkeyup="filterApplications(this, 'adminSchool')">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th onclick="sortTable(0)">Name <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(1)">Position <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(2)">Grade <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(3)">Date Applied <i class="fas fa-sort text-gray-400"></i></th>
                                    <th onclick="sortTable(4)">Status <i class="fas fa-sort text-gray-400"></i></th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                schoolApplications.forEach(app => {
                    const statusClass = `status-${app.status}`;
                    applicationsHTML += `
                        <tr>
                            <td>${app.applicantName}</td>
                            <td>${app.position}</td>
                            <td>${app.grade}</td>
                            <td>${app.dateApplied}</td>
                            <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                            <td>
                                <button onclick="viewApplicationDetail(${app.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button onclick="approveApplicationBySchool(${app.id})" class="text-green-600 hover:text-green-800 mr-2">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button onclick="rejectApplicationBySchool(${app.id})" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                applicationsHTML += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            contentArea.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold primary-text mb-4">Admin School Dashboard</h2>
                    <p class="text-gray-600 mb-4">School: ${currentUser.school}</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="card text-center">
                            <div class="text-3xl font-bold primary-text">${schoolApplications.length}</div>
                            <div class="text-gray-600">Approved Applications</div>
                        </div>
                        <div class="card text-center">
                            <div class="text-3xl font-bold text-green-600">${schoolApplications.filter(a => a.status === 'approved' && a.schoolApproved).length}</div>
                            <div class="text-gray-600">School Approved</div>
                        </div>
                        <div class="card text-center">
                            <div class="text-3xl font-bold text-red-600">${schoolApplications.filter(a => a.status === 'rejected' || a.schoolRejected).length}</div>
                            <div class="text-gray-600">Rejected</div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    ${applicationsHTML}
                </div>
            `;
        }

        // Show application modal
        function showApplicationModal(position, grade, school) {
            document.getElementById('appPosition').value = position;
            document.getElementById('applicationModal').classList.add('active');
        }

        // Close application modal
        function closeApplicationModal() {
            document.getElementById('applicationModal').classList.remove('active');
            document.getElementById('applicationForm').reset();
        }

        // Submit application (quick modal)
        async function submitApplication() {
            const position = document.getElementById('appPosition').value;
            const resumeInput = document.getElementById('appResume');
            const resume = resumeInput.files && resumeInput.files[0] ? resumeInput.files[0].name : (resumeInput.value || '');
            const coverLetter = document.getElementById('appCoverLetter').value;
            const qualification = document.getElementById('appQualification').value;
            const experience = document.getElementById('appExperience').value;

            if (!resume || !coverLetter || !qualification || !experience) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            const job = jobOpenings.find(j => j.title === position);
            if (!job) {
                showToast('Job not found for this position', 'error');
                return;
            }

            try {
                await apiCreateApplication({
                    applicantName: currentUser.name,
                    position,
                    grade: job.grade,
                    school: job.school,
                    status: 'pending',
                    dateApplied: new Date().toISOString().split('T')[0],
                    resume,
                    coverLetter,
                    qualification,
                    experience,
                    jobId: job.id
                });
                await refreshAllData();
                closeApplicationModal();
                showToast('Application submitted successfully!', 'success');
                loadMyApplications();
            } catch (e) {
                showToast(e.message || 'Failed to submit', 'error');
            }
        }

        // View application detail
      function viewApplicationDetail(applicationId) {
           const application = applications.find(a => String(a._id) === String(applicationId));
            currentApplicationId = applicationId;
            
            if (!application) {
                showToast('Application not found', 'error');
                return;
            }
            
            let actionButtons = '';
           if (false) {
                actionButtons = `
                    <button onclick="approveApplication('${application._id}')" class="btn-primary mr-2">
                        <i class="fas fa-check mr-2"></i> Approve
                    </button>
                    <button onclick="rejectApplication('${application._id}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                        <i class="fas fa-times mr-2"></i> Reject
                    </button>
                `;
		   } else if (false) {
                actionButtons = `
                    <button onclick="approveApplicationBySchool('${application._id}')" class="btn-primary mr-2">
                        <i class="fas fa-check mr-2"></i> Approve
                    </button>
                    <button onclick="rejectApplicationBySchool('${application._id}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                        <i class="fas fa-times mr-2"></i> Reject
                    </button>
                `;
            }
            
            const detailHTML = `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold primary-text mb-2">Applicant Information</h3>
                    <p><strong>Name:</strong> ${application.applicantName}</p>
                    <p><strong>Position Applied:</strong> ${application.position}</p>
                    <p><strong>Grade:</strong> ${application.grade}</p>
                    <p><strong>School:</strong> ${application.school}</p>
                    <p><strong>Date Applied:</strong> ${application.dateApplied}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${application.status}">${application.status}</span></p>
                </div>
                
                <div class="mb-4">
                    <h3 class="text-lg font-semibold primary-text mb-2">Application Details</h3>
                    <p><strong>Highest Qualification:</strong> ${application.qualification}</p>
                    <p><strong>Years of Experience:</strong> ${application.experience}</p>
                    <p><strong>Resume:</strong> ${application.resume}</p>
                    <p><strong>Cover Letter:</strong> ${application.coverLetter}</p>
                </div>
                
                <div class="flex justify-end">
                    ${actionButtons}
                    <button onclick="downloadForm(${application.id})" class="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                        <i class="fas fa-download mr-2"></i> Download Form
                    </button>
                </div>
            `;
            
            document.getElementById('applicationDetailContent').innerHTML = detailHTML;
            document.getElementById('applicationDetailModal').classList.add('active');
        }

        // Close application detail modal
        function closeApplicationDetailModal() {
            document.getElementById('applicationDetailModal').classList.remove('active');
            currentApplicationId = null;
        }

        // Approve application (by Admin JSM)
        async function approveApplication(applicationId) {
            try {
                await apiPatchApplication(applicationId, { status: 'approved' });
                closeApplicationDetailModal();
                showToast('Application approved successfully!', 'success');
                if (currentUser.role === 'adminJSM') loadAdminJSMDashboard();
            } catch (e) {
                showToast(e.message || 'Failed', 'error');
            }
        }

        // Reject application (by Admin JSM)
        async function rejectApplication(applicationId) {
            try {
                await apiPatchApplication(applicationId, { status: 'rejected' });
                closeApplicationDetailModal();
                showToast('Application rejected', 'info');
                if (currentUser.role === 'adminJSM') loadAdminJSMDashboard();
            } catch (e) {
                showToast(e.message || 'Failed', 'error');
            }
        }

        // Approve application (by Admin School)
        async function approveApplicationBySchool(applicationId) {
            try {
                await apiPatchApplication(applicationId, { schoolApproved: true });
                closeApplicationDetailModal();
                showToast('Application approved by school!', 'success');
                if (currentUser.role === 'adminSchool') loadAdminSchoolDashboard();
            } catch (e) {
                showToast(e.message || 'Failed', 'error');
            }
        }

        // Reject application (by Admin School)
        async function rejectApplicationBySchool(applicationId) {
            const reason = prompt('Please provide a reason for rejection:');
            if (!reason) {
                showToast('Rejection reason is required', 'error');
                return;
            }
            try {
                await apiPatchApplication(applicationId, { schoolRejected: true, rejectionReason: reason });
                closeApplicationDetailModal();
                showToast('Application rejected by school', 'info');
                if (currentUser.role === 'adminSchool') loadAdminSchoolDashboard();
            } catch (e) {
                showToast(e.message || 'Failed', 'error');
            }
        }

        // Download form (placeholder)
        function downloadForm(applicationId) {
            showToast('Downloading application form...', 'info');
            // In a real application, this would generate and download a PDF
            console.log(`Download form for application ${applicationId}`);
        }

        // Export to CSV
        function exportToCSV() {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Name,Position,Grade,School,Date Applied,Status\n";
            
            let relevantApplications = [];
            
            if (currentUser.role === 'adminJSM') {
                relevantApplications = applications;
            } else if (currentUser.role === 'adminSchool') {
                relevantApplications = applications.filter(a => a.school === currentUser.school);
            }
            
            relevantApplications.forEach(app => {
                csvContent += `${app.applicantName},${app.position},${app.grade},${app.school},${app.dateApplied},${app.status}\n`;
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "application_history.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('Exported to CSV successfully!', 'success');
        }

           function isJobOpen(job) {
           const today = new Date();
           const deadlineDate = new Date(job.deadline);

           return today <= deadlineDate;
}
        // Show tab
        function showTab(tabId) {
            // Hide all tabs
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabId).classList.add('active');
            
            // Update tab buttons
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            
            event.target.classList.remove('border-transparent', 'text-gray-500');
            event.target.classList.add('border-blue-500', 'text-blue-600');
        }

        // Filter applications
        function filterApplications(input, context) {
            const filter = input.value.toUpperCase();
            const table = input.closest('.card').querySelector('table');
            const rows = table.getElementsByTagName('tr');
            
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                let found = false;
                
                for (let j = 0; j < cells.length - 1; j++) {
                    const cell = cells[j];
                    if (cell) {
                        const textValue = cell.textContent || cell.innerText;
                        if (textValue.toUpperCase().indexOf(filter) > -1) {
                            found = true;
                            break;
                        }
                    }
                }
                
                rows[i].style.display = found ? '' : 'none';
            }
        }

        // Sort table
        let sortDirection = {};
        function sortTable(columnIndex) {
            const table = event.target.closest('table');
            const tbody = table.getElementsByTagName('tbody')[0];
            const rows = Array.from(tbody.getElementsByTagName('tr'));
            
            // Toggle sort direction
            sortDirection[columnIndex] = sortDirection[columnIndex] === 'asc' ? 'desc' : 'asc';
            
            // Sort rows
            rows.sort((a, b) => {
                const aValue = a.getElementsByTagName('td')[columnIndex].textContent;
                const bValue = b.getElementsByTagName('td')[columnIndex].textContent;
                
                if (sortDirection[columnIndex] === 'asc') {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            });
            
            // Reorder rows in tbody
            rows.forEach(row => {
                tbody.appendChild(row);
            });
        }

        // Show notifications
        function showNotifications() {
            loadNotifications();
        }

        // Update notification badge
        function updateNotificationBadge() {
            if (!currentUser) return;
            const unreadCount = notifications.filter(n => String(n.userId) === String(currentUser.id) && !n.read).length;
            document.getElementById('notificationBadge').textContent = unreadCount;
        }

        // ============================================================
// CALON: LOAD APPLY FORM PAGE (Borang Penuh A–L)
// ============================================================
let currentApplyJob = null; // simpan job yang sedang di-apply

function loadApplyFormPage() {

    if (!currentUser || currentUser.role !== 'calon') {
        if (typeof showToast === 'function') {
            showToast("Only applicants can access the apply form.", "error");
        } else {
            alert("Only applicants can access the apply form.");
        }
        return;
    }
    document.getElementById('pageTitle').textContent = 'Apply Form';
    const contentArea = document.getElementById('contentArea');

    // If calon dah pilih a job via "Apply Now", show that job.
    // Otherwise show a dropdown to pick from jobOpenings.
    let jobPickerHTML = '';
    if (!currentApplyJob) {
        // Show job picker
        let options = jobOpenings.map(j =>
            `<option value="${j.id}">${j.title} (${j.grade} – ${j.school})</option>`
        ).join('');

        if (jobOpenings.length === 0) {
            jobPickerHTML = `
                <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:8px; padding:16px; margin-bottom:20px; text-align:center; color:#856404;">
                    <i class="fas fa-info-circle mr-2"></i>
                    Belum ada jawatan yang dibuka. Sila tunggu pengumuman dari Admin.
                </div>`;
        } else {
            jobPickerHTML = `
                <div class="card" style="margin-bottom:20px;">
                    <h3 style="color:#003087; margin-bottom:12px; font-size:15px;"><i class="fas fa-briefcase mr-2"></i> Pilih Jawatan / Select Position</h3>
                    <select id="jobPicker" onchange="pickJobForForm()" style="width:100%; padding:10px 14px; border:1px solid #ccc; border-radius:6px; font-size:14px; outline:none;">
                        <option value="">-- Pilih jawatan --</option>
                        ${options}
                    </select>
                </div>`;
        }
    }

    // If a job is already selected, show the full borang
    let borangHTML = '';
    if (currentApplyJob) {
        borangHTML = generateFullBorang(currentApplyJob);
    }

    contentArea.innerHTML = jobPickerHTML + borangHTML;
}

function generateFullBorang(job) {
    return `
    <!-- ===== UUM HEADER ===== -->
    <div class="card" style="padding:20px; margin-bottom:0;">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #003087; padding-bottom:14px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:14px;">
                <div style="width:56px; height:56px; background:#003087; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                    <span style="color:white; font-weight:bold; font-size:16px;">UUM</span>
                </div>
                <div>
                    <div style="font-weight:700; font-size:14px; color:#003087;">BORANG PERMOHONAN JAWATAN AKADEMIK</div>
                    <div style="font-size:11px; color:#888; font-style:italic;">APPLICATION FORM FOR ACADEMIC POST</div>
                </div>
            </div>
            <!-- Passport Photo Box -->
            <div style="width:90px; height:100px; border:2px solid #999; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; background:#fafafa; border-radius:4px;">
                <div id="passportPreview" style="width:100%; height:60px; display:flex; align-items:center; justify-content:center;">
                    <span style="font-size:10px; color:#999; font-style:italic;">Passport Size<br>Photograph</span>
                </div>
                <input type="file" id="passportPhoto" accept="image/*" style="display:none;" onchange="previewPassport(event)">
                <button onclick="document.getElementById('passportPhoto').click()" style="margin-top:2px; font-size:9px; background:#003087; color:white; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">Upload</button>
            </div>
        </div>

        <!-- Position Info (read-only, auto-filled) -->
        <table style="width:100%; border-collapse:collapse;">
            <tr style="background:#f0f4f8;">
                <td style="padding:7px 10px; border:1px solid #ccc; width:42%; font-size:12px;"><strong>JAWATAN</strong> <span style="color:#888; font-style:italic; font-size:11px;">/ Position</span></td>
                <td style="padding:7px 10px; border:1px solid #ccc; font-size:13px; font-weight:500;">${job.title}</td>
            </tr>
            <tr style="background:#f0f4f8;">
                <td style="padding:7px 10px; border:1px solid #ccc; font-size:12px;"><strong>GRED JAWATAN</strong> <span style="color:#888; font-style:italic; font-size:11px;">/ Grade</span></td>
                <td style="padding:7px 10px; border:1px solid #ccc; font-size:13px; font-weight:500;">${job.grade}</td>
            </tr>
            <tr style="background:#f0f4f8;">
                <td style="padding:7px 10px; border:1px solid #ccc; font-size:12px;"><strong>BIDANG PENGKHUSUSAN</strong> <span style="color:#888; font-style:italic; font-size:11px;">/ Area of Specialization</span></td>
                <td style="padding:7px 10px; border:1px solid #ccc;"><input type="text" id="specialization" style="width:100%; border:none; outline:none; font-size:13px;" placeholder="e.g. Computer Science"></td>
            </tr>
            <tr style="background:#f0f4f8;">
                <td style="padding:7px 10px; border:1px solid #ccc; font-size:12px;"><strong>PUSAT PENGAJIAN / KOLEJ</strong> <span style="color:#888; font-style:italic; font-size:11px;">/ School / College</span></td>
                <td style="padding:7px 10px; border:1px solid #ccc; font-size:13px; font-weight:500;">${job.school}</td>
            </tr>
        </table>
    </div>

    <!-- ===== SECTION A: PERSONAL DETAILS ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (A) BUTIRAN PERIBADI / <span style="font-weight:400; font-style:italic;">PERSONAL DETAILS</span>
        </div>

        <!-- Nama Penuh -->
        <div style="display:flex; align-items:center; margin-bottom:9px;">
            <div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Nama Penuh</strong><br><span style="color:#888; font-style:italic;">Full Name</span></div>
            <input type="text" id="fullName" value="${currentUser.name}" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
        </div>

        <!-- New IC + Old IC -->
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:110px; font-size:11px; flex-shrink:0;"><strong>No. K/P Baru</strong><br><span style="color:#888; font-style:italic;">New I/C No.</span></div>
                <input type="text" id="newIC" maxlength="14" inputmode="numeric" placeholder="e.g. 990101-01-1234" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" oninput="formatIC(this)">
            </div>
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:100px; font-size:11px; flex-shrink:0;"><strong>No. K/P Lama</strong><br><span style="color:#888; font-style:italic;">Old I/C No.</span></div>
                <input type="text" id="oldIC" maxlength="14" inputmode="numeric" placeholder="e.g. 990101-01-1234" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" oninput="formatIC(this)">
            </div>
        </div>

        <!-- DOB + Age -->
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:110px; font-size:11px; flex-shrink:0;"><strong>Tarikh Lahir</strong><br><span style="color:#888; font-style:italic;">Date of Birth</span></div>
                <input type="date" id="dob" onchange="calcAge()" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
            </div>
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:60px; font-size:11px; flex-shrink:0;"><strong>Umur</strong><br><span style="color:#888; font-style:italic;">Age</span></div>
                <input type="text" id="ageField" readonly style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none; background:#fafafa; color:#666;" placeholder="Auto">
            </div>
        </div>

        <!-- Religion + Passport -->
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:110px; font-size:11px; flex-shrink:0;"><strong>Agama</strong><br><span style="color:#888; font-style:italic;">Religion</span></div>
                <input type="text" id="religion" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
            </div>
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:100px; font-size:11px; flex-shrink:0;"><strong>No. Pasport</strong><br><span style="color:#888; font-style:italic;">Passport No.</span></div>
                <input type="text" id="passportNo"maxlength="9" inputmode="text" placeholder="e.g. A12345678" oninput="formatPassport(this)" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
        </div>

        <!-- Citizenship + Gender -->
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:110px; font-size:11px; flex-shrink:0;"><strong>Warganegara</strong><br><span style="color:#888; font-style:italic;">Citizenship</span></div>
                <input type="text" id="citizenship" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
            </div>
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:80px; font-size:11px; flex-shrink:0;"><strong>Jantina</strong><br><span style="color:#888; font-style:italic;">Gender</span></div>
                <select id="gender" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none; background:transparent;">
                    <option value="">– Pilih –</option>
                    <option>Lelaki / Male</option>
                    <option>Perempuan / Female</option>
                </select>
            </div>
        </div>

        <!-- Phone + Email -->
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:110px; font-size:11px; flex-shrink:0;"><strong>Telefon</strong><br><span style="color:#888; font-style:italic;">Phone No.</span></div>
                <input type="text" id="phoneNo" maxlength="12" inputmode="numeric" placeholder="e.g. 012-3456789" oninput="formatPhone(this)" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:70px; font-size:11px; flex-shrink:0;"><strong>Emel</strong><br><span style="color:#888; font-style:italic;">Email</span></div>
                <input type="email" id="emailField" value="${currentUser.email||''}" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
            </div>
        </div>

        <!-- Permanent Address -->
        <div style="margin-bottom:9px;">
            <div style="font-size:11px; margin-bottom:3px;"><strong>Alamat Tetap</strong> <span style="color:#888; font-style:italic;">/ Permanent Address</span></div>
            <textarea id="permAddress" rows="2" style="width:100%; border:1px solid #ccc; border-radius:4px; padding:5px 8px; font-size:12px; outline:none; resize:none;"></textarea>
        </div>

        <!-- Mailing Address -->
        <div style="margin-bottom:9px;">
            <div style="font-size:11px; margin-bottom:3px;"><strong>Alamat Surat Menyurat</strong> <span style="color:#888; font-style:italic;">/ Mailing Address</span></div>
            <textarea id="mailAddress" rows="2" style="width:100%; border:1px solid #ccc; border-radius:4px; padding:5px 8px; font-size:12px; outline:none; resize:none;"></textarea>
        </div>

        <!-- Marital Status -->
        <div style="display:flex; align-items:center; gap:18px; margin-bottom:9px;">
            <div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Taraf Perkahwinan</strong><br><span style="color:#888; font-style:italic;">Marital Status</span></div>
            <label style="font-size:12px; cursor:pointer;"><input type="radio" name="marital" value="Bujang"> Bujang <em style="color:#888;">(Single)</em></label>
            <label style="font-size:12px; cursor:pointer;"><input type="radio" name="marital" value="Berkahwin"> Berkahwin <em style="color:#888;">(Married)</em></label>
            <label style="font-size:12px; cursor:pointer;"><input type="radio" name="marital" value="Duda/Janda"> Duda/Janda <em style="color:#888;">(Widowed)</em></label>
        </div>

        <!-- No. of Children -->
        <div style="display:flex; align-items:center; margin-bottom:9px;">
            <div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Bil. Anak</strong><br><span style="color:#888; font-style:italic;">No. of Children</span></div>
            <input type="text" id="numChildren" maxlength="2" inputmode="numeric" placeholder="Enter number of children" class="w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"oninput="formatNumChildren(this)"> <p id="displayChildren" class="mt-2 text-gray-700"></p>
        </div>

        <!-- Spouse -->
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1.4; display:flex; align-items:center;">
                <div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Nama Suami / Isteri</strong><br><span style="color:#888; font-style:italic;">Name of Spouse</span></div>
                <input type="text" id="spouseName" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
            </div>
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:80px; font-size:11px; flex-shrink:0;"><strong>Majikan</strong><br><span style="color:#888; font-style:italic;">Employer</span></div>
                <input type="text" id="spouseEmp" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
            </div>
        </div>

        <!-- Parent -->
        <div style="display:flex; gap:14px;">
            <div style="flex:1.4; display:flex; align-items:center;">
                <div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Nama Ibu Bapa</strong><br><span style="color:#888; font-style:italic;">Name of Parent</span></div>
                <input type="text" id="parentName" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
            </div>
            <div style="flex:1; display:flex; align-items:center;">
                <div style="width:80px; font-size:11px; flex-shrink:0;"><strong>Majikan</strong><br><span style="color:#888; font-style:italic;">Employer</span></div>
                <input type="text" id="parentEmp" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;">
            </div>
        </div>
    </div>


    <!-- ===== SECTION C: HIGHER EDUCATION ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (C) MAKLUMAT PENGAJIAN TINGGI / <span style="font-weight:400; font-style:italic;">HIGHER EDUCATION DETAILS</span>
        </div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
           <thead><tr style="background:#f0f4f8;">
            <th style="border:1px solid #ccc; padding:7px; text-align:left; width:14%;">Tahap<br><em style="color:#888;">Level</em></th>
            <th style="border:1px solid #ccc; padding:7px; text-align:left; width:20%;">Nama Institusi<br><em style="color:#888;">Institution</em></th>
            <th style="border:1px solid #ccc; padding:7px; text-align:left; width:12%;">Tahun Tamat<br><em style="color:#888;">Year</em></th>
            <th style="border:1px solid #ccc; padding:7px; text-align:left; width:10%;">CGPA</th>
            <th style="border:1px solid #ccc; padding:7px; text-align:left; width:16%;">Bidang<br><em style="color:#888;">Specialisation</em></th>
            <th style="border:1px solid #ccc; padding:7px; text-align:left; width:14%;">Sijil SPM<br><em style="color:#888;">SPM Cert</em></th>
            <th style="border:1px solid #ccc; padding:7px; text-align:left; width:14%;">Transkrip/CV<br><em style="color:#888;">Transcript/CV</em></th>
        </tr></thead>
          <tbody>
                ${['PhD','Ijazah Sarjana<br><em style="color:#888; font-weight:400;">Master</em>','Ijazah Sarjana Muda<br><em style="color:#888; font-weight:400;">Degree</em>','Diploma'].map(lvl => `
                <tr>
                    <td style="border:1px solid #ccc; padding:7px; background:#fafafa; font-weight:600;">${lvl}</td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc; padding:3px; text-align:center;">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style="font-size:10px; width:100%;" title="Upload SPM Certificate">
                    </td>
                    <td style="border:1px solid #ccc; padding:3px; text-align:center;">
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="font-size:10px; width:100%;" title="Upload Transcript/CV">
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>

        <div style="margin-top:10px; text-align:right;">
        <button onclick="addHigherEduRow()" style="background:#28a745; color:white; border:none; padding:6px 14px; border-radius:4px; font-size:12px; cursor:pointer;">
            <i class="fas fa-plus mr-1"></i> Add Row
        </button>
    </div>
</div>


    <!-- ===== SECTION D: PROFESSIONAL AFFILIATION ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (D) PENDAFTARAN PROFESIONAL / <span style="font-weight:400; font-style:italic;">PROFESSIONAL AFFILIATION</span>
        </div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:42%;">Nama Badan Profesional<br><em style="color:#888;">Name of Professional Body</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:30%;">Tarikh Keahlian<br><em style="color:#888;">Date of Membership</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:28%;">No. Siri Pendaftaran<br><em style="color:#888;">Registration No</em></th>
            </tr></thead>
            <tbody>
                <tr><td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td><td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td><td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td></tr>
                <tr><td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td><td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td><td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td></tr>
            </tbody>
        </table>
        </div>
    </div>

    <!-- ===== SECTION E: SCHOLARSHIP / LOAN ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (E) PEMEGANG BIASISWA, PINJAMAN / <span style="font-weight:400; font-style:italic;">RECIPIENT OF SCHOLARSHIP, LOAN</span>
        </div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:30%;">Badan yang Memberi<br><em style="color:#888;">Awarding Body</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:20%;">Tempoh<br><em style="color:#888;">Duration</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Terikat / Tidak Terikat<br><em style="color:#888;">Bonded / Not Bonded</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Biasiswa / Pinjaman<br><em style="color:#888;">Scholarship / Loan</em></th>
            </tr></thead>
            <tbody>
                <tr>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><select style="width:100%; border:none; padding:3px; font-size:11px; outline:none; background:transparent;"><option value="">– Pilih –</option><option>Terikat / Bonded</option><option>Tidak Terikat / Not Bonded</option></select></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>

    <!-- ===== SECTION F: CURRENT JOB ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (F) PEKERJAAN SEKARANG / <span style="font-weight:400; font-style:italic;">CURRENT JOB</span>
        </div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Nama Jawatan<br><em style="color:#888;">Position</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Nama Majikan<br><em style="color:#888;">Employer</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Gaji &amp; Gred<br><em style="color:#888;">Salary &amp; Grade</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Tarikh Mula<br><em style="color:#888;">Commencement</em></th>
            </tr></thead>
            <tbody>
                <tr>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>

    <!-- ===== SECTION G: WORKING EXPERIENCES ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (G) PENGALAMAN KERJA / <span style="font-weight:400; font-style:italic;">WORKING EXPERIENCES</span>
        </div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:18%;">Nama Jawatan<br><em style="color:#888;">Position</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:20%;">Nama Majikan<br><em style="color:#888;">Employer</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:14%;">Gaji<br><em style="color:#888;">Salary</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:14%;">Dari<br><em style="color:#888;">From</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:14%;">Hingga<br><em style="color:#888;">To</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:20%;">Sebab Berhenti<br><em style="color:#888;">Reason</em></th>
            </tr></thead>
            <tbody>
                ${[1,2,3,4].map(() => `<tr>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>`).join('')}
            </tbody>
        </table>
        </div>
    </div>

    <!-- ===== SECTION H: CURRICULAR & SOCIAL ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (H) KEGIATAN KOKURIKULUM &amp; SOSIAL / <span style="font-weight:400; font-style:italic;">CURRICULAR &amp; SOCIAL ACTIVITIES</span>
        </div>
        <div style="display:flex; gap:14px;">
            <div style="flex:1;">
                <div style="background:#f0f4f8; border:1px solid #ccc; padding:7px; font-size:10px; font-weight:600; text-align:center; border-radius:4px 4px 0 0;">Peringkat Sekolah / Kolej / Universiti / Komuniti<br><em style="color:#888; font-weight:400;">School / College / University / Community Level</em></div>
                <textarea rows="4" style="width:100%; border:1px solid #ccc; border-top:none; padding:7px; font-size:11px; outline:none; resize:none; border-radius:0 0 4px 4px;"></textarea>
            </div>
            <div style="flex:1;">
                <div style="background:#f0f4f8; border:1px solid #ccc; padding:7px; font-size:10px; font-weight:600; text-align:center; border-radius:4px 4px 0 0;">Peringkat Luar Sekolah / Kolej / Universiti / Komuniti<br><em style="color:#888; font-weight:400;">Outside School / College / University / Community Level</em></div>
                <textarea rows="4" style="width:100%; border:1px solid #ccc; border-top:none; padding:7px; font-size:11px; outline:none; resize:none; border-radius:0 0 4px 4px;"></textarea>
            </div>
        </div>
    </div>

    <!-- ===== SECTION I: PUBLICATION ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (I) PENERBITAN / <span style="font-weight:400; font-style:italic;">PUBLICATION</span> <span style="color:#FFD700;">*</span>
        </div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:22%;">Pengarang<br><em style="color:#888;">Author</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:32%;">Tajuk<br><em style="color:#888;">Title</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:28%;">Jurnal<br><em style="color:#888;">Journal</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:18%;">Tarikh<br><em style="color:#888;">Date</em></th>
            </tr></thead>
            <tbody>
                ${[1,2,3].map(() => `<tr>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>`).join('')}
            </tbody>
        </table>
        </div>
    </div>

    <!-- ===== SECTION J: RESEARCH ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (J) PENYELIDIKAN / <span style="font-weight:400; font-style:italic;">RESEARCH</span> <span style="color:#FFD700;">*</span>
        </div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:65%;">Tajuk<br><em style="color:#888;">Title</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:35%;">Bidang<br><em style="color:#888;">Field</em></th>
            </tr></thead>
            <tbody>
                ${[1,2,3].map(() => `<tr>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>`).join('')}
            </tbody>
        </table>
        </div>
        <p style="font-size:10px; color:#888; font-style:italic; margin-top:6px;">*Jika ruang tidak mencukupi sila lampirkan dokumen berasingan / *Please provide attachments if space is insufficient</p>
    </div>

    <!-- ===== SECTION K: REFERENCE ===== -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
            (K) PERAKUAN / <span style="font-weight:400; font-style:italic;">REFERENCE</span>
        </div>
        <div style="display:flex; gap:20px;">
            ${[1,2].map(n => `
            <div style="flex:1; border:1px solid #ddd; border-radius:6px; padding:12px; background:#fafafa;">
                <div style="font-weight:600; font-size:11px; color:#003087; margin-bottom:10px; text-align:center; border-bottom:1px solid #ddd; padding-bottom:6px;">Rujukan ${n} / Reference ${n}</div>
                <div style="margin-bottom:7px;"><div style="font-size:10px; font-weight:600;">Nama / <em style="color:#888;">Name</em></div><input type="text" style="width:100%; border:none; border-bottom:1px solid #ccc; padding:3px 0; font-size:12px; outline:none;"></div>
                <div style="margin-bottom:7px;"><div style="font-size:10px; font-weight:600;">Alamat / <em style="color:#888;">Address</em></div><input type="text" style="width:100%; border:none; border-bottom:1px solid #ccc; padding:3px 0; font-size:12px; outline:none;"></div>
                <div style="margin-bottom:7px;"><div style="font-size:10px; font-weight:600;">No Tel / <em style="color:#888;">Phone No</em></div><input type="tel" style="width:100%; border:none; border-bottom:1px solid #ccc; padding:3px 0; font-size:12px; outline:none;"></div>
                <div><div style="font-size:10px; font-weight:600;">Pekerjaan / <em style="color:#888;">Occupation</em></div><input type="text" style="width:100%; border:none; border-bottom:1px solid #ccc; padding:3px 0; font-size:12px; outline:none;"></div>
            </div>`).join('')}
        </div>
    </div>

   <!-- ===== SECTION L: DECLARATION ===== -->
<div class="card" style="margin-top:14px;">
    <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">
        (L) PENGAKUAN PEMOHON / <span style="font-weight:400; font-style:italic;">APPLICANT'S DECLARATION</span> <span style="color:#FFD700;">*</span>
    </div>
    <div style="display:flex; align-items:flex-start; gap:10px; padding:14px; background:#fff8e1; border:1px solid #ffe082; border-radius:6px;">
        <input type="checkbox" id="declCheck" style="margin-top:2px; width:20px; height:20px; flex-shrink:0; cursor:pointer;">
        <div style="font-size:11px; line-height:1.6; color:#444;">
            <strong style="color:#003087;">Malay:</strong> Saya akui bahawa maklumat yang diberi serta lampirannya adalah lengkap, betul dan benar. Saya faham bahawa sekiranya ada di antara maklumat itu didapati palsu, maka permohonan saya akan dibatalkan dan sekiranya saya telah diberi tawaran jawatan atau telah pun berkhidmat, maka maklumat palsu itu akan menjadi bukti dan alasan membatalkan tawaran jawatan atau memberhentikan saya dengan serta-merta. Saya mengakui bahawa sekiranya tiada maklumbalas dalam tempoh 3 bulan, permohonan saya ini dianggap tidak berjaya.<br><br>
            <strong style="color:#003087;">English:</strong> I certify that the above information is correct and I understand that any false information in this application, or its supporting documents, will become sufficient grounds for refusal of employment or termination of employment immediately, without notice. I certify that my application will consider unsuccessful after 3 months without any feedback from the University.
        </div>
    </div>
</div>

   <!-- ===== ACTION BUTTONS ===== -->
<div style="margin-top:28px; text-align:center; padding-bottom:20px; display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
    <button onclick="submitFullApplication(true)" style="background:#6c757d; color:white; border:none; padding:14px 36px; border-radius:6px; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 3px 8px rgba(108,117,125,0.35); transition:all 0.2s;">
        <i class="fas fa-save mr-2"></i> Save as Draft
    </button>
    <button onclick="downloadAsWord()" style="background:#28a745; color:white; border:none; padding:14px 36px; border-radius:6px; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 3px 8px rgba(40,167,69,0.35); transition:all 0.2s;">
        <i class="fas fa-file-word mr-2"></i> Download Word
    </button>
    <button onclick="submitFullApplication(false)" style="background:#003087; color:white; border:none; padding:14px 48px; border-radius:6px; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 3px 8px rgba(0,48,135,0.35); transition:all 0.2s;">
        <i class="fas fa-paper-plane mr-2"></i> Submit Application
    </button>
</div>`;
}

// When user picks a job from dropdown
function pickJobForForm() {
    const jobId = document.getElementById('jobPicker').value;
    if (!jobId) return;
    currentApplyJob = jobOpenings.find(j => String(j.id) === String(jobId));
    loadApplyFormPage();
}

        // logout() — see auth.js

        // Show toast notification
        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Toggle dark mode
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeIcon');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        // ============================================================
// SAVE DRAFT FUNCTION
// ============================================================
async function saveDraft() {
    if (!currentApplyJob) {
        showToast('Sila pilih jawatan terlebih dahulu.', 'error');
        return;
    }

    const name = document.getElementById('fullName').value.trim();
    if (!name) {
        showToast('Sila isi Nama Penuh untuk save draft.', 'error');
        return;
    }

    try {
        await apiCreateApplication({
            applicantName: name,
            position: currentApplyJob.title,
            grade: currentApplyJob.grade,
            school: currentApplyJob.school,
            status: 'draft',
            dateApplied: new Date().toISOString().split('T')[0],
            jobId: currentApplyJob.id,
            details: {
                newIC: document.getElementById('newIC')?.value || '',
                dob: document.getElementById('dob')?.value || '',
                religion: document.getElementById('religion')?.value || '',
                gender: document.getElementById('gender')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                email: document.getElementById('emailField')?.value || '',
                permAddress: document.getElementById('permAddress')?.value || '',
                specialization: document.getElementById('specialization')?.value || ''
            }
        });
        await refreshAllData();
        showToast('Draft berjaya disimpan!', 'success');
        currentApplyJob = null;
        loadMyApplications();
    } catch (e) {
        showToast(e.message || 'Failed to save draft', 'error');
    }
}

// ============================================================
// DOWNLOAD AS WORD FUNCTION
// ============================================================
function downloadAsWord() {
    if (!currentApplyJob) {
        showToast('Sila pilih jawatan terlebih dahulu.', 'error');
        return;
    }

    const name = document.getElementById('fullName')?.value || 'Applicant';
    const newIC = document.getElementById('newIC')?.value || '';
    const dob = document.getElementById('dob')?.value || '';
    const religion = document.getElementById('religion')?.value || '';
    const gender = document.getElementById('gender')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const email = document.getElementById('emailField')?.value || '';
    const permAddress = document.getElementById('permAddress')?.value || '';
    const specialization = document.getElementById('specialization')?.value || '';

    const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset="utf-8">
        <title>Application Form - ${name}</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 11pt; margin: 40px; }
            h1 { text-align:center; color:#003087; font-size:16pt; margin-bottom:8px; }
            h2 { color:#003087; font-size:13pt; border-bottom:2px solid #003087; padding-bottom:4px; margin-top:20px; }
            table { width:100%; border-collapse:collapse; margin-bottom:16px; }
            td, th { border:1px solid #ccc; padding:8px; font-size:10pt; }
            th { background:#f0f4f8; font-weight:600; color:#003087; }
            .label { width:38%; background:#f7fafc; font-weight:600; color:#444; }
            .section-header { background:#003087; color:white; padding:8px 10px; font-weight:600; font-size:11pt; margin-top:16px; }
        </style>
    </head>
    <body>
        <h1>BORANG PERMOHONAN JAWATAN AKADEMIK</h1>
        <p style="text-align:center; font-style:italic; color:#666; margin-top:0;">APPLICATION FORM FOR ACADEMIC POST</p>
        
        <table>
            <tr><td class="label">JAWATAN / Position</td><td>${currentApplyJob.title}</td></tr>
            <tr><td class="label">GRED JAWATAN / Grade</td><td>${currentApplyJob.grade}</td></tr>
            <tr><td class="label">BIDANG PENGKHUSUSAN / Specialization</td><td>${specialization}</td></tr>
            <tr><td class="label">PUSAT PENGAJIAN / School</td><td>${currentApplyJob.school}</td></tr>
        </table>

        <div class="section-header">(A) BUTIRAN PERIBADI / PERSONAL DETAILS</div>
        <table>
            <tr><td class="label">Nama Penuh / Full Name</td><td>${name}</td></tr>
            <tr><td class="label">No. K/P Baru / New IC</td><td>${newIC}</td></tr>
            <tr><td class="label">Tarikh Lahir / Date of Birth</td><td>${dob}</td></tr>
            <tr><td class="label">Agama / Religion</td><td>${religion}</td></tr>
            <tr><td class="label">Jantina / Gender</td><td>${gender}</td></tr>
            <tr><td class="label">Telefon / Phone</td><td>${phone}</td></tr>
            <tr><td class="label">Emel / Email</td><td>${email}</td></tr>
            <tr><td class="label">Alamat Tetap / Permanent Address</td><td>${permAddress}</td></tr>
        </table>

        <div class="section-header">(C) MAKLUMAT PENGAJIAN TINGGI / HIGHER EDUCATION</div>
        <table>
            <tr><th>Tahap</th><th>Institusi</th><th>Tahun</th><th>CGPA</th><th>Bidang</th></tr>
            <tr><td>PhD</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
            <tr><td>Master</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
            <tr><td>Degree</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
            <tr><td>Diploma</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table>

        <div class="section-header">(D) PENDAFTARAN PROFESIONAL</div>
        <table>
            <tr><th>Nama Badan Profesional</th><th>Tarikh Keahlian</th><th>No. Siri</th></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table>

        <div class="section-header">(E) PEMEGANG BIASISWA, PINJAMAN</div>
        <table>
            <tr><th>Badan yang Memberi</th><th>Tempoh</th><th>Terikat/Tidak</th><th>Biasiswa/Pinjaman</th></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table>

        <div class="section-header">(F) PEKERJAAN SEKARANG</div>
        <table>
            <tr><th>Jawatan</th><th>Majikan</th><th>Gaji & Gred</th><th>Tarikh Mula</th></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table>

        <div class="section-header">(G) PENGALAMAN KERJA</div>
        <table>
            <tr><th>Jawatan</th><th>Majikan</th><th>Gaji</th><th>Dari</th><th>Hingga</th><th>Sebab Berhenti</th></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table>

        <div class="section-header">(H) KEGIATAN KOKURIKULUM & SOSIAL</div>
        <table>
            <tr><th>Peringkat Sekolah/Universiti</th><th>Peringkat Luar</th></tr>
            <tr><td style="height:60px;">&nbsp;</td><td>&nbsp;</td></tr>
        </table>

        <div class="section-header">(I) PENERBITAN / PUBLICATION</div>
        <table>
            <tr><th>Pengarang</th><th>Tajuk</th><th>Jurnal</th><th>Tarikh</th></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table>

        <div class="section-header">(J) PENYELIDIKAN / RESEARCH</div>
        <table>
            <tr><th>Tajuk</th><th>Bidang</th></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table>

        <div class="section-header">(K) PERAKUAN / REFERENCE</div>
        <table>
            <tr><th>Rujukan 1</th><th>Rujukan 2</th></tr>
            <tr><td>Nama:<br>Alamat:<br>No Tel:<br>Pekerjaan:</td><td>Nama:<br>Alamat:<br>No Tel:<br>Pekerjaan:</td></tr>
        </table>

        <div class="section-header">(L) PENGAKUAN PEMOHON</div>
        <p style="font-size:10pt;">☐ Saya akui bahawa maklumat yang diberi adalah lengkap, betul dan benar...</p>
        
        <div style="margin-top:50px; display:flex; justify-content:space-between;">
            <div style="width:45%; border-bottom:1px solid #000; padding-top:40px; text-align:center;">Tandatangan Pemohon</div>
            <div style="width:30%; border-bottom:1px solid #000; padding-top:40px; text-align:center;">Tarikh</div>
        </div>

        <p style="margin-top:30px; text-align:center; font-size:10pt; color:#888;">
            Downloaded on ${new Date().toISOString().split('T')[0]} from UUM Application System
        </p>
    </body>
    </html>`;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Application_${name.replace(/\s+/g, '_')}_${currentApplyJob.title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Document downloaded! Buka dengan Microsoft Word.', 'success');
}



/* Jobs are loaded from the API (see refreshAllData). Sample data is seeded on the server if the collection is empty. */


// ===== FIXED DS11 =====
function loadDS11Applications() {
    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return;

    const title = document.getElementById('pageTitle');
    if (title) title.textContent = 'DS11 Applications';

    const ds11Apps = applications.filter(app => app.grade === "DS11");

    if (ds11Apps.length === 0) {
        contentArea.innerHTML = `<div class="card"><p>No DS11 applications found.</p></div>`;
        return;
    }

    contentArea.innerHTML = ds11Apps.map(app => `
        <div class="card">
            <h3>${app.position}</h3>
            <p><strong>Applicant:</strong> ${app.applicantName}</p>
            <p><strong>Status:</strong> ${app.status}</p>
            <button onclick="viewApplicationDetail('${app.id}')">View</button>
        </div>
    `).join("");
}

// ===== FIXED DS13 =====
function loadDS13Applications() {
    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return;

    const title = document.getElementById('pageTitle');
    if (title) title.textContent = 'DS13 Applications';

    const ds13Apps = applications.filter(app => app.grade === "DS13");

    if (ds13Apps.length === 0) {
        contentArea.innerHTML = `<div class="card"><p>No DS13 applications found.</p></div>`;
        return;
    }

    contentArea.innerHTML = ds13Apps.map(app => `
        <div class="card">
            <h3>${app.position}</h3>
            <p><strong>Applicant:</strong> ${app.applicantName}</p>
            <p><strong>Status:</strong> ${app.status}</p>
            <button onclick="viewApplicationDetail('${app.id}')">View</button>
        </div>
    `).join("");
}

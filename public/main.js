// ============================================================
// CLOUDINARY FILE UPLOAD
// ============================================================
const CLOUDINARY_CLOUD = 'dsbkvddwh';
const CLOUDINARY_PRESET = 'UUM_APPLICATION_SYSTEM';

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) throw new Error('File upload failed. Please try again.');
    const data = await res.json();
    if (!data.secure_url) throw new Error('Upload succeeded but no URL returned. Check your Cloudinary preset settings (must be unsigned and allow all file types).');
    return { url: data.secure_url, name: file.name, type: file.type };
}


// ============================================================
// ADMIN JSM: VIEW FULL FORM + APPROVE / REJECT + DOWNLOAD .docx
// ============================================================
async function openAdminViewForm(appId) {
    // Always fetch fresh from server so full details (including uploadedFiles) are present
    let app;
    try {
        app = await api('/applications/' + appId);
    } catch(e) {
        app = applications.find(a => String(a.id) === String(appId));
    }
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
                ${app.status === 'pending' ? `
                <button onclick="adminApprove('${app.id}')" style="background:#28a745; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer; font-size:13px; font-weight:600;">
                    <i class="fas fa-check mr-1"></i> Approve
                </button>
                <button onclick="adminReject('${app.id}')" style="background:#dc3545; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer; font-size:13px; font-weight:600;">
                    <i class="fas fa-times mr-1"></i> Reject
                </button>
                ` : `<span style="font-weight:600; font-size:13px; color:${app.status==='approved'?'#28a745':'#dc3545'};">${app.status.toUpperCase()}</span>`}
                <button onclick="downloadApplicationExcel('${app.id}')" style="background:#17a2b8; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer; font-size:13px; font-weight:600;">
                    <i class="fas fa-file-excel mr-1"></i> Download Excel
                </button>
            </div>
        </div>
        <!-- ===== UUM Header ===== -->
        <div class="card" style="padding:18px; margin-bottom:0;">
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #003087; padding-bottom:12px; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:50px; height:50px; background:#003087; border-radius:50%; display:flex; align-items:center; justify-content:center;"><span style="color:white; font-weight:bold; font-size:15px;">UUM</span></div>
                    <div><div style="font-weight:700; font-size:13px; color:#003087;">BORANG PERMOHONAN JAWATAN AKADEMIK</div><div style="font-size:10px; color:#888; font-style:italic;">APPLICATION FORM FOR ACADEMIC POST</div></div>
                </div>
                <div style="width:80px; height:90px; border:2px solid #999; display:flex; align-items:center; justify-content:center; background:#fafafa; border-radius:4px; overflow:hidden;">
                    ${d.passportPhoto
                        ? `<img src="${d.passportPhoto}" style="width:100%; height:100%; object-fit:cover;">`
                        : `<span style="font-size:9px; color:#999; text-align:center;">Passport Size<br>Photograph</span>`
                    }
                </div>
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


        <!-- SECTION C: HIGHER EDUCATION -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(C) MAKLUMAT PENGAJIAN TINGGI / HIGHER EDUCATION DETAILS</div>
            <div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead><tr style="background:#f0f4f8;">
                    <th style="border:1px solid #ccc; padding:6px;">Tahap / Level</th>
                    <th style="border:1px solid #ccc; padding:6px;">Institusi / Institution</th>
                    <th style="border:1px solid #ccc; padding:6px;">Tahun / Year</th>
                    <th style="border:1px solid #ccc; padding:6px;">CGPA</th>
                    <th style="border:1px solid #ccc; padding:6px;">Bidang / Field</th>
                    <th style="border:1px solid #ccc; padding:6px;">Certificate</th>
                </tr></thead>
                <tbody>
                    ${(d.edu || []).map(e => {
                        const spmFile = d.uploadedFiles?.['edu_'+e.level+'_spm'];
                        function renderFile(f) {
                            if (!f) return '–';
                            const src = f.url || f.data;
                            if (!src) return '–';
                            const isImage = f.type && f.type.startsWith('image/');
                            const icon = isImage ? '🖼️' : '📄';
                            const label = f.name || (isImage ? 'View Image' : 'View File');
                            return '<a href="' + src + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;padding:4px 8px;background:#e8f0fe;border:1px solid #4a90d9;border-radius:4px;color:#003087;font-size:11px;font-weight:600;text-decoration:none;" title="Click to view">'
                                + icon + ' ' + label
                                + '</a>';
                        }
                        return '<tr>' +
                            '<td style="border:1px solid #ccc;padding:5px;font-weight:600;background:#fafafa;">' + (e.level ? e.level.toUpperCase() : '–') + '</td>' +
                            '<td style="border:1px solid #ccc;padding:5px;">' + (e.institution || '–') + '</td>' +
                            '<td style="border:1px solid #ccc;padding:5px;">' + (e.year || '–') + '</td>' +
                            '<td style="border:1px solid #ccc;padding:5px;">' + (e.cgpa || '–') + '</td>' +
                            '<td style="border:1px solid #ccc;padding:5px;">' + (e.field || '–') + '</td>' +
                            '<td style="border:1px solid #ccc;padding:5px;">' + renderFile(spmFile) + '</td>' +
                        '</tr>';
                    }).join('')}
                </tbody>
            </table></div>
        </div>

        <!-- TRANSCRIPT / CV -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">TRANSKRIP / CV</div>
            <div style="padding:6px 0;">
                ${d.uploadedFiles?.['transcriptCV']
                    ? renderFile(d.uploadedFiles['transcriptCV'])
                    : '<span style="color:#999; font-size:12px;">No Transcript/CV uploaded</span>'}
            </div>
        </div>

        <!-- SECTION D: PROFESSIONAL -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(D) PENDAFTARAN PROFESIONAL / PROFESSIONAL AFFILIATION</div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead><tr style="background:#f0f4f8;"><th style="border:1px solid #ccc; padding:6px;">Nama Badan Profesional</th><th style="border:1px solid #ccc; padding:6px;">Tarikh Keahlian</th><th style="border:1px solid #ccc; padding:6px;">No. Pendaftaran</th></tr></thead>
                <tbody>${(d.professional || []).map(p => `<tr><td style="border:1px solid #ccc; padding:5px;">${p.body || '–'}</td><td style="border:1px solid #ccc; padding:5px;">${p.date || '–'}</td><td style="border:1px solid #ccc; padding:5px;">${p.regno || '–'}</td></tr>`).join('')}</tbody>
            </table>
        </div>

        <!-- SECTION E: SCHOLARSHIP -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(E) PEMEGANG BIASISWA, PINJAMAN / SCHOLARSHIP, LOAN</div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead><tr style="background:#f0f4f8;"><th style="border:1px solid #ccc; padding:6px;">Badan yang Memberi</th><th style="border:1px solid #ccc; padding:6px;">Tempoh</th><th style="border:1px solid #ccc; padding:6px;">Terikat/Tidak</th><th style="border:1px solid #ccc; padding:6px;">Jenis</th></tr></thead>
                <tbody>${(d.scholarship || []).map(s => `<tr><td style="border:1px solid #ccc; padding:5px;">${s.body || '–'}</td><td style="border:1px solid #ccc; padding:5px;">${s.duration || '–'}</td><td style="border:1px solid #ccc; padding:5px;">${s.bonded || '–'}</td><td style="border:1px solid #ccc; padding:5px;">${s.type || '–'}</td></tr>`).join('')}</tbody>
            </table>
        </div>

        <!-- SECTION F: CURRENT JOB -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(F) PEKERJAAN SEKARANG / CURRENT JOB</div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead><tr style="background:#f0f4f8;"><th style="border:1px solid #ccc; padding:6px;">Jawatan</th><th style="border:1px solid #ccc; padding:6px;">Majikan</th><th style="border:1px solid #ccc; padding:6px;">Gaji & Gred</th><th style="border:1px solid #ccc; padding:6px;">Tarikh Mula</th></tr></thead>
                <tbody><tr>
                    <td style="border:1px solid #ccc; padding:5px;">${d.currentJob?.position || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${d.currentJob?.employer || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${d.currentJob?.salary || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${d.currentJob?.date || '–'}</td>
                </tr></tbody>
            </table>
        </div>

        <!-- SECTION G: WORK EXPERIENCE -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(G) PENGALAMAN KERJA / WORKING EXPERIENCES</div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead><tr style="background:#f0f4f8;"><th style="border:1px solid #ccc; padding:6px;">Jawatan</th><th style="border:1px solid #ccc; padding:6px;">Majikan</th><th style="border:1px solid #ccc; padding:6px;">Gaji</th><th style="border:1px solid #ccc; padding:6px;">Dari</th><th style="border:1px solid #ccc; padding:6px;">Hingga</th><th style="border:1px solid #ccc; padding:6px;">Sebab Berhenti</th></tr></thead>
                <tbody>${(d.workExp || []).filter(w => w.position || w.employer).map(w => `<tr>
                    <td style="border:1px solid #ccc; padding:5px;">${w.position || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${w.employer || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${w.salary || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${w.from || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${w.to || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${w.reason || '–'}</td>
                </tr>`).join('') || '<tr><td colspan="6" style="border:1px solid #ccc; padding:8px; text-align:center; color:#888;">–</td></tr>'}</tbody>
            </table>
        </div>

        <!-- SECTION H: CO-CURRICULUM -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(H) KEGIATAN KOKURIKULUM & SOSIAL / CURRICULAR & SOCIAL ACTIVITIES</div>
            <div style="display:flex; gap:14px;">
                <div style="flex:1;"><div style="font-size:11px; font-weight:600; margin-bottom:4px;">Peringkat Sekolah / Universiti</div><div style="border:1px solid #ccc; padding:8px; border-radius:4px; font-size:11px; min-height:60px; white-space:pre-wrap;">${d.cocurriculumSchool || '–'}</div></div>
                <div style="flex:1;"><div style="font-size:11px; font-weight:600; margin-bottom:4px;">Peringkat Luar</div><div style="border:1px solid #ccc; padding:8px; border-radius:4px; font-size:11px; min-height:60px; white-space:pre-wrap;">${d.cocurriculumOutside || '–'}</div></div>
            </div>
        </div>

        <!-- SECTION I: PUBLICATION -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(I) PENERBITAN / PUBLICATION</div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead><tr style="background:#f0f4f8;"><th style="border:1px solid #ccc; padding:6px;">Pengarang</th><th style="border:1px solid #ccc; padding:6px;">Tajuk</th><th style="border:1px solid #ccc; padding:6px;">Jurnal</th><th style="border:1px solid #ccc; padding:6px;">Tarikh</th></tr></thead>
                <tbody>${(d.publications || []).filter(p => p.title || p.author).map(p => `<tr>
                    <td style="border:1px solid #ccc; padding:5px;">${p.author || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${p.title || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${p.journal || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${p.date || '–'}</td>
                </tr>`).join('') || '<tr><td colspan="4" style="border:1px solid #ccc; padding:8px; text-align:center; color:#888;">–</td></tr>'}</tbody>
            </table>
        </div>

        <!-- SECTION J: RESEARCH -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(J) PENYELIDIKAN / RESEARCH</div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead><tr style="background:#f0f4f8;"><th style="border:1px solid #ccc; padding:6px;">Tajuk / Title</th><th style="border:1px solid #ccc; padding:6px;">Bidang / Field</th></tr></thead>
                <tbody>${(d.research || []).filter(r => r.title).map(r => `<tr>
                    <td style="border:1px solid #ccc; padding:5px;">${r.title || '–'}</td>
                    <td style="border:1px solid #ccc; padding:5px;">${r.field || '–'}</td>
                </tr>`).join('') || '<tr><td colspan="2" style="border:1px solid #ccc; padding:8px; text-align:center; color:#888;">–</td></tr>'}</tbody>
            </table>
        </div>

        <!-- SECTION K: REFERENCE -->
        <div class="card" style="margin-top:12px;">
            <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 12px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(K) PERAKUAN / REFERENCE</div>
            <div style="display:flex; gap:20px;">
                ${(d.references || []).map((r, i) => `
                <div style="flex:1; border:1px solid #ddd; border-radius:6px; padding:12px; background:#fafafa;">
                    <div style="font-weight:600; font-size:11px; color:#003087; margin-bottom:8px; text-align:center; border-bottom:1px solid #ddd; padding-bottom:6px;">Rujukan ${i+1} / Reference ${i+1}</div>
                    <div style="font-size:11px; margin-bottom:4px;"><strong>Nama:</strong> ${r.name || '–'}</div>
                    <div style="font-size:11px; margin-bottom:4px;"><strong>Alamat:</strong> ${r.address || '–'}</div>
                    <div style="font-size:11px; margin-bottom:4px;"><strong>Tel:</strong> ${r.phone || '–'}</div>
                    <div style="font-size:11px;"><strong>Pekerjaan:</strong> ${r.occupation || '–'}</div>
                </div>`).join('')}
            </div>
        </div>
        `
 }

// adminApprove / adminReject — see admin.js (API)

// ── Download application as .xlsx (Excel) using SheetJS ──
async function downloadApplicationExcel(appId) {
    let app;
    try {
        app = await api('/applications/' + appId);
    } catch(e) {
        app = applications.find(a => String(a.id) === String(appId));
    }
    if (!app) return;
    const d = app.details || {};

    const rows = [];
    const addHeader = (text) => rows.push([text]);
    const addRow = (...cells) => rows.push(cells);
    const addBlank = () => rows.push([]);

    addHeader('BORANG PERMOHONAN JAWATAN AKADEMIK / APPLICATION FORM FOR ACADEMIC POST');
    addBlank();
    addRow('JAWATAN / Position', app.position);
    addRow('GRED JAWATAN / Grade', app.grade);
    addRow('BIDANG PENGKHUSUSAN / Specialization', d.specialization || '');
    addRow('PUSAT PENGAJIAN / School', app.school);
    addBlank();

    addHeader('(A) BUTIRAN PERIBADI / PERSONAL DETAILS');
    addRow('Nama Penuh / Full Name', app.applicantName || '');
    addRow('No. K/P Baru / New IC', d.newIC || '');
    addRow('No. K/P Lama / Old IC', d.oldIC || '');
    addRow('Tarikh Lahir / Date of Birth', d.dob || '');
    addRow('Agama / Religion', d.religion || '');
    addRow('No. Pasport / Passport No', d.passportNo || '');
    addRow('Kewarganegaraan / Citizenship', d.citizenship || '');
    addRow('Jantina / Gender', d.gender || '');
    addRow('Telefon / Phone', d.phone || '');
    addRow('Emel / Email', d.email || '');
    addRow('Alamat Tetap / Permanent Address', d.permAddress || '');
    addRow('Alamat Surat-menyurat / Mailing Address', d.mailAddress || '');
    addBlank();

    addHeader('(C) MAKLUMAT PENGAJIAN TINGGI / HIGHER EDUCATION DETAILS');
    addRow('Tahap / Level', 'Institusi / Institution', 'Tahun Tamat / Year', 'CGPA', 'Bidang / Field');
    (d.edu || []).forEach(e => {
        addRow((e.level || '').toUpperCase(), e.institution || '', e.year || '', e.cgpa || '', e.field || '');
    });
    addBlank();

    addHeader('TRANSKRIP / CV');
    const cvFile = d.uploadedFiles?.['transcriptCV'];
    addRow('Transcript/CV', cvFile ? (cvFile.url || cvFile.name || 'Uploaded') : 'Not uploaded');
    addBlank();

    addHeader('(D) PENDAFTARAN PROFESIONAL / PROFESSIONAL AFFILIATION');
    addRow('Nama Badan Profesional', 'Tarikh Keahlian', 'No. Siri Pendaftaran');
    (d.professional || []).forEach(p => {
        addRow(p.body || '', p.date || '', p.regno || '');
    });
    addBlank();

    addHeader('(E) PEMEGANG BIASISWA, PINJAMAN / SCHOLARSHIP, LOAN');
    addRow('Badan yang Memberi', 'Tempoh', 'Terikat / Tidak Terikat', 'Biasiswa / Pinjaman');
    (d.scholarship || []).forEach(s => {
        addRow(s.body || '', s.period || '', s.bound || '', s.type || '');
    });
    addBlank();

    addHeader('STATUS');
    addRow('School Status', app.schoolStatus || 'pending');
    addRow('JSM Status', app.jsmStatus || app.status || 'pending');
    if (app.rejectionReason) addRow('Rejection Reason', app.rejectionReason);
    addRow('Date Applied', app.dateApplied || '');
    addRow('Generated', new Date().toISOString().split('T')[0]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 32 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 24 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Application');

    const fileName = `Application_${(app.applicantName||'applicant').replace(/\s+/g,'_')}_${(app.position||'position').replace(/\s+/g,'_')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showToast('Downloaded as Excel!', 'success');
}


        // ============================================================
// ADMIN JSM: EVALUATE PAGE – list all pending applications
// ============================================================
async function loadEvaluatePage() {
    document.getElementById('pageTitle').textContent = 'Evaluate Applications';
    const contentArea = document.getElementById('contentArea');
    await refreshAllData();

    const pendingApps = applications.filter(app => app.status === 'pending');

    if (pendingApps.length === 0) {
        contentArea.innerHTML = `
            <div class="card">
                <p>No pending applications to evaluate.</p>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = `
        <div class="mb-4">
            <h2 class="text-2xl font-bold primary-text">${pendingApps.length} Pending Application${pendingApps.length !== 1 ? 's' : ''}</h2>
        </div>
        ${pendingApps.map(app => `
        <div class="card mb-4">
            <h3 class="font-bold text-lg">${app.position}</h3>
            <p><strong>Applicant:</strong> ${app.applicantName}</p>
            <p><strong>Grade:</strong> ${app.grade} &nbsp;|&nbsp; <strong>School:</strong> ${app.school}</p>
            <p><strong>Date Applied:</strong> ${app.dateApplied}</p>
            <div class="mt-3" style="display:flex; gap:8px; flex-wrap:wrap;">
                <button onclick="openAdminViewForm('${app.id}')"
                    style="background:#003087; color:white; border:none; padding:6px 14px; border-radius:5px; cursor:pointer; font-size:13px;">
                    <i class="fas fa-eye mr-1"></i> View Full Form
                </button>
            </div>
        </div>
        `).join("")}
    `;
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
    const declaration = document.getElementById('declCheck') || document.getElementById('declarationCheck');
    if (!isDraft && declaration && !declaration.checked) {
        showToast('Sila tick kotak Declaration sebelum submit.', 'error');
        return;
    }

    const formData = {
        // Section A
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
        specialization: document.getElementById('specialization')?.value || '',
        // Section C – Higher Education
        edu: ['phd','master','degree','diploma','spm'].map(k => ({
            level: k,
            institution: document.getElementById(`edu_${k}_inst`)?.value || '',
            year: document.getElementById(`edu_${k}_year`)?.value || '',
            cgpa: document.getElementById(`edu_${k}_cgpa`)?.value || '',
            field: document.getElementById(`edu_${k}_field`)?.value || '',
        })),
        // Section D – Professional
        professional: [1,2].map(n => ({
            body: document.getElementById(`prof_${n}_body`)?.value || '',
            date: document.getElementById(`prof_${n}_date`)?.value || '',
            regno: document.getElementById(`prof_${n}_regno`)?.value || '',
        })),
        // Section E – Scholarship
        scholarship: [1,2].map(n => ({
            body: document.getElementById(`schol_${n}_body`)?.value || '',
            duration: document.getElementById(`schol_${n}_duration`)?.value || '',
            bonded: document.getElementById(`schol_${n}_bonded`)?.value || '',
            type: document.getElementById(`schol_${n}_type`)?.value || '',
        })),
        // Section F – Current Job
        currentJob: {
            position: document.getElementById('curjob_position')?.value || '',
            employer: document.getElementById('curjob_employer')?.value || '',
            salary: document.getElementById('curjob_salary')?.value || '',
            date: document.getElementById('curjob_date')?.value || '',
        },
        // Section G – Work Experience
        workExp: [1,2,3,4].map(n => ({
            position: document.getElementById(`work_${n}_pos`)?.value || '',
            employer: document.getElementById(`work_${n}_emp`)?.value || '',
            salary: document.getElementById(`work_${n}_sal`)?.value || '',
            from: document.getElementById(`work_${n}_from`)?.value || '',
            to: document.getElementById(`work_${n}_to`)?.value || '',
            reason: document.getElementById(`work_${n}_reason`)?.value || '',
        })),
        // Section H – Co-curricular
        cocurriculumSchool: document.getElementById('cocurriculum_school')?.value || '',
        cocurriculumOutside: document.getElementById('cocurriculum_outside')?.value || '',
        // Section I – Publication
        publications: [1,2,3].map(n => ({
            author: document.getElementById(`pub_${n}_author`)?.value || '',
            title: document.getElementById(`pub_${n}_title`)?.value || '',
            journal: document.getElementById(`pub_${n}_journal`)?.value || '',
            date: document.getElementById(`pub_${n}_date`)?.value || '',
        })),
        // Section J – Research
        research: [1,2,3].map(n => ({
            title: document.getElementById(`res_${n}_title`)?.value || '',
            field: document.getElementById(`res_${n}_field`)?.value || '',
        })),
        // Section K – References
        references: [1,2].map(n => ({
            name: document.getElementById(`ref_${n}_name`)?.value || '',
            address: document.getElementById(`ref_${n}_addr`)?.value || '',
            phone: document.getElementById(`ref_${n}_phone`)?.value || '',
            occupation: document.getElementById(`ref_${n}_occ`)?.value || '',
        })),
    };

    // Include passport photo if uploaded
    const passportFile = document.getElementById('passportPhoto')?.files?.[0];
    // Validate mandatory Transcript/CV upload
    const transcriptFile = document.getElementById('transcriptCV')?.files?.[0];
    const existingTranscript = formData.uploadedFiles?.['transcriptCV'];
    if (!transcriptFile && !existingTranscript && !isDraft) {
        showToast('Transcript/CV is mandatory. Please upload your Transcript or CV before submitting.', 'error');
        document.getElementById('transcriptCV')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Upload passport photo to Cloudinary
    if (passportFile) {
        showToast('Uploading passport photo...', 'info');
        try {
            const result = await uploadToCloudinary(passportFile);
            formData.passportPhoto = result.url;
        } catch(e) {
            showToast('Passport photo upload failed: ' + e.message, 'error');
            return;
        }
    }

    // Upload all edu file inputs to Cloudinary
    showToast('Uploading documents...', 'info');

    // Start with existing uploaded files so previously uploaded certs are preserved if no new file chosen
    const existingApp = currentEditApplicationId
        ? (await api('/applications/' + currentEditApplicationId).catch(() => null))
        : null;
    const uploadedFiles = Object.assign({}, existingApp?.details?.uploadedFiles || {});

    const allFileInputs = document.querySelectorAll('#applyFormPage input[type="file"]:not(#passportPhoto)');
    for (const input of allFileInputs) {
        if (input.files && input.files[0] && input.id) {
            try {
                const result = await uploadToCloudinary(input.files[0]);
                uploadedFiles[input.id] = { name: result.name, type: result.type, url: result.url };
            } catch(e) {
                showToast('File upload failed for ' + input.id + ': ' + e.message, 'error');
                return;
            }
        }
    }
    if (Object.keys(uploadedFiles).length > 0) formData.uploadedFiles = uploadedFiles;

    try {
        // When editing, preserve the original application's status instead of forcing 'pending'
        let resolvedStatus = isDraft ? 'draft' : 'pending';
        if (currentEditApplicationId && !isDraft) {
            const existing = applications.find(a => String(a.id) === String(currentEditApplicationId));
            if (existing) resolvedStatus = existing.status;
        }

        // Prefer currentApplyJob for position/grade/school (always accurate).
        // Fall back to DOM display elements only when editing an existing application
        // where currentApplyJob may not be set.
        const jobRef = currentApplyJob || (() => {
            if (currentEditApplicationId) {
                return applications.find(a => String(a.id) === String(currentEditApplicationId));
            }
            return null;
        })();

        const payload = {
            applicantName: name,
            position: jobRef?.title || jobRef?.position || document.getElementById('displayPosition')?.textContent || 'N/A',
            grade: jobRef?.grade || document.getElementById('displayGrade')?.textContent || 'N/A',
            school: jobRef?.school || document.getElementById('displaySchool')?.textContent || 'N/A',
            status: resolvedStatus,
            dateApplied: new Date().toISOString().split('T')[0],
            details: formData
        };

        // Always send jobId so the server can authoritatively resolve school/grade
        if (currentApplyJob && currentApplyJob.id) {
            payload.jobId = currentApplyJob.id;
            payload.jobTitle = currentApplyJob.title;
        } else if (currentEditApplicationId) {
            // Editing existing application — pull jobId from the saved application
            const existingApp = applications.find(a => String(a.id) === String(currentEditApplicationId));
            if (existingApp?.jobId) {
                payload.jobId = existingApp.jobId;
                payload.jobTitle = existingApp.jobTitle || existingApp.position;
            }
        }

        if (currentEditApplicationId) {
            // Editing existing — PATCH
            await api('/applications/' + currentEditApplicationId, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            currentEditApplicationId = null;
        } else {
            // New application — POST
            await apiCreateApplication(payload);
        }
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
    const tbody = document.getElementById('higherEduBody') || document.getElementById('eduBody');
    if (!tbody) return;
    
    const rowIndex = tbody.querySelectorAll('tr').length;
    const uid = 'extra_' + rowIndex;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td style="border:1px solid #ccc; padding:8px; background:#fafafa;"><input type="text" placeholder="e.g. Certificate" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc;"><input type="text" style="width:100%; border:none; padding:4px; font-size:12px; outline:none;"></td>
        <td style="border:1px solid #ccc; padding:4px; text-align:center;"><input type="file" id="edu_${uid}_spm" accept=".pdf,.jpg,.jpeg,.png" style="font-size:11px; width:100%;" title="Upload Certificate"></td>
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
   const declarationDateField = document.getElementById('declarationDate');

if (declarationDateField) {
    declarationDateField.valueAsDate = new Date();
}
    // Show the page
    document.getElementById('applyFormPage').style.display = 'block';

    // Scroll to top
    document.getElementById('applyFormPage').scrollTop = 0;
}

// ── CLOSE the Apply Form Page ──
function closeApplyFormPage() {
    document.getElementById('applyFormPage').style.display = 'none';
    currentEditApplicationId = null;
    currentApplyJob = null;
}

// (duplicate submitFullApplication removed — use async submitFullApplication(isDraft) above)

let applications = [];
let jobAds = [];

let currentUser = null;
let currentRole = null;
let notifications = [];
let jobOpenings = [];
let currentApplicationId = null;
let currentEditApplicationId = null;

async function refreshAllData() {
    if (!getToken()) {
        applications = [];
        jobOpenings = [];
        notifications = [];
        return;
    }
    try {
        const isApplicant = currentUser && currentUser.role === 'calon';
        const isJSM = currentUser && currentUser.role === 'adminJSM';
        const fetches = [
            api('/applications'),
            api('/jobs'),
            (isApplicant || isJSM) ? api('/notifications') : Promise.resolve([])
        ];
        const [apps, jobs, notes] = await Promise.all(fetches);
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

    const visibleJobs = currentUser.role === 'calon'
        ? jobOpenings.filter(j => !j.isFull)
        : jobOpenings;

    if (!visibleJobs || visibleJobs.length === 0) {
        contentArea.innerHTML = `
            <div class="card">
                <p>No job openings available.</p>
            </div>
        `;
        return;
    }

    visibleJobs.forEach(job => {
        contentArea.innerHTML += createJobCard(job);
    });
};


async function loadSchoolAdminApplications() {
    const contentArea = document.getElementById("contentArea");
    const pageTitle = document.getElementById("pageTitle");
    pageTitle.textContent = "School Applications";
    await refreshAllData();

    if (applications.length === 0) {
        contentArea.innerHTML = `
            <div class="card">
                <p>No applications for your school yet.</p>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = `
        <div class="mb-4">
            <h2 class="text-2xl font-bold primary-text">${applications.length} Application${applications.length !== 1 ? 's' : ''}</h2>
        </div>
        ${applications.map(app => `
        <div class="card">
            <h3>${app.position || app.jobTitle || '—'}</h3>
            <p><strong>Applicant:</strong> ${app.applicantName || app.applicant || '—'}</p>
            <p><strong>Grade:</strong> ${app.grade} &nbsp;|&nbsp; <strong>Date Applied:</strong> ${app.dateApplied}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${app.status}">${app.status}</span></p>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <button onclick="openSchoolViewForm('${app.id}')" class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    <i class="fas fa-eye"></i> View
                </button>
                ${app.status === 'approved' ? `
                <button onclick="downloadApplicationExcel('${app.id}')" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    <i class="fas fa-file-excel"></i> Download
                </button>` : ''}
            </div>
        </div>
        `).join("")}
    `;
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
            
            // Show notification bell for applicants and JSM admins
            const notifBtn = document.getElementById('notificationBtn');
            notifBtn.style.display = (currentUser.role === 'calon' || currentUser.role === 'adminJSM') ? '' : 'none';

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
            { icon: 'fas fa-tachometer-alt',   text: 'Dashboard', action: 'loadAdminSchoolDashboard' },
            { icon: 'fas fa-clipboard-check',  text: 'Evaluate',  action: 'loadSchoolEvaluatePage'   }
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

    jobOpenings.filter(job => !job.isFull).forEach(job => {
        const isFull = !!job.isFull;

        const today = new Date(); today.setHours(0,0,0,0);
        const deadlineDate = new Date(job.deadline); deadlineDate.setHours(0,0,0,0);
        const daysLeft = Math.round((deadlineDate - today) / (1000 * 60 * 60 * 24));
        const closingSoonBadge = isJobOpen(job) && daysLeft >= 0 && daysLeft <= 3
          ? `<span style="background:#fef3c7;color:#92400e;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:9999px;margin-left:8px;">⏰ Closing in ${daysLeft === 0 ? 'today' : daysLeft + ' day' + (daysLeft !== 1 ? 's' : '')}</span>`
          : '';

        jobOpeningsHTML += `
            <div class="card-flush">
                ${job.image ? '<img src="' + job.image + '" alt="' + job.title + '" class="card-img">' : ''}
                <div class="card-body">
                    <h3 style="font-size:1.05rem;font-weight:600;color:var(--primary-color);margin-bottom:6px;">${job.title}</h3>
                    <p style="color:#4b5563;font-size:0.875rem;margin-bottom:8px;">${job.description}</p>
                    <p style="font-size:0.8rem;color:#6b7280;margin-bottom:10px;">
                        Grade: ${job.grade}<br>School: ${job.school}<br>Deadline: ${job.deadline}${closingSoonBadge}<br>Posted by: ${job.postedBy}
                    </p>
                    <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:600;margin-bottom:12px;">
                        <span style="color:#374151;">Status</span>
                        <span style="color:${isFull ? '#dc2626' : '#15803d'};font-weight:700;">
                            ${isFull ? 'Full' : 'Available'}
                        </span>
                    </div>
                    <div style="display:flex;justify-content:flex-end;">
                        ${currentUser.role === 'calon' && !isFull && isJobOpen(job) ? `
                            <button onclick="selectJobAndApply('${job.id}')" style="background:#2563eb;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:0.875rem;">
                                <i class="fas fa-file-edit" style="margin-right:4px;"></i> Apply Now
                            </button>
                        ` : isFull ? `<span style="color:#dc2626;font-weight:700;font-size:0.85rem;"><i class="fas fa-ban" style="margin-right:4px;"></i>No vacancies remaining</span>` : !isJobOpen(job) ? `<span style="color:#6b7280;font-weight:700;font-size:0.85rem;"><i class="fas fa-clock" style="margin-right:4px;"></i>Application Closed</span>` : ``}
                    </div>
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
    if (!currentApplyJob) { showToast('Job not found.', 'error'); return; }
    if (currentApplyJob.isFull) { showToast('This position is fully filled and no longer accepting applications.', 'error'); return; }
    if (!isJobOpen(currentApplyJob)) { showToast('The application deadline for this position has passed.', 'error'); return; }
    // Use the real overlay form so all form element IDs resolve correctly
    openApplyFormPage(currentApplyJob.title, currentApplyJob.grade, currentApplyJob.school);
}
        
        // Load job advertisements for Admin JSM
        function loadJobAds(filterYear) {
            document.getElementById('pageTitle').textContent = 'Job Advertisements';
            const contentArea = document.getElementById('contentArea');

            // Build the list of distinct years from job deadlines
            const years = [...new Set(jobOpenings.map(j => {
                const d = new Date(j.deadline);
                return isNaN(d) ? null : d.getFullYear();
            }).filter(y => y !== null))].sort((a, b) => b - a);

            const selectedYear = filterYear || 'all';
            const visibleJobs = selectedYear === 'all'
                ? jobOpenings
                : jobOpenings.filter(j => {
                    const d = new Date(j.deadline);
                    return !isNaN(d) && String(d.getFullYear()) === String(selectedYear);
                  });

            let jobAdsHTML = '';
            visibleJobs.forEach(job => {
                const isFull = !!job.isFull;

                jobAdsHTML += `
                    <div class="card-flush">
                        ${job.image ? '<img src="' + job.image + '" alt="' + job.title + '" class="card-img">' : ''}
                        <div class="card-body">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                                <h3 style="font-size:1.1rem;font-weight:600;color:var(--primary-color);margin:0;">${job.title}</h3>
                                <div style="display:flex;gap:10px;margin-left:8px;flex-shrink:0;">
                                    <button onclick="editJobAd('${job.id}')" title="Edit" style="background:none;border:none;cursor:pointer;color:#3b82f6;font-size:1rem;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteJobAd('${job.id}')" title="Delete" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:1rem;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <p style="color:#4b5563;font-size:0.875rem;margin-bottom:8px;">${job.description}</p>
                            <p style="font-size:0.8rem;color:#6b7280;margin-bottom:12px;">Grade: ${job.grade} &bull; School: ${job.school} &bull; Deadline: ${job.deadline}</p>
                            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;font-weight:600;">
                                <span style="color:${isFull ? '#dc2626' : '#15803d'};">
                                    <i class="fas ${isFull ? 'fa-ban' : 'fa-check-circle'}" style="margin-right:5px;"></i>${isFull ? 'Full' : 'Available'}
                                </span>
                                <button onclick="toggleJobFull('${job.id}', ${!isFull})" style="background:${isFull ? '#15803d' : '#dc2626'};color:white;border:none;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:0.75rem;font-weight:600;">
                                    ${isFull ? 'Mark as Available' : 'Mark as Full'}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            if (!jobAdsHTML) {
                jobAdsHTML = '<p class="text-gray-500">No job advertisements yet.</p>';
            }

            const yearOptions = `<option value="all" ${selectedYear === 'all' ? 'selected' : ''}>All Years</option>`
                + years.map(y => `<option value="${y}" ${String(selectedYear) === String(y) ? 'selected' : ''}>${y}</option>`).join('');

            contentArea.innerHTML = `
                <div class="mb-6 flex justify-between items-center flex-wrap gap-3">
                    <h2 class="text-2xl font-bold primary-text">Job Advertisements</h2>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <select onchange="loadJobAds(this.value)" style="border:1px solid #ccc; border-radius:6px; padding:6px 10px; font-size:0.85rem;">
                            ${yearOptions}
                        </select>
                        <button onclick="showJobAdModal()" class="btn-primary">
                            <i class="fas fa-plus mr-2"></i> Create New Ad
                        </button>
                    </div>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    ${jobAdsHTML}
                </div>
            `;
        }

        // showJobAdModal / closeJobAdModal / createJobAd / editJobAd / deleteJobAd — see jobs.js

function createJobCard(job) {
    const open = isJobOpen(job);
    const isFull = !!job.isFull;
    const spotColor = isFull ? '#dc2626' : '#15803d';

    return `
        <div class="card-flush">
            ${job.image ? '<img src="' + job.image + '" alt="' + job.title + '" class="card-img">' : ''}
            <div class="card-body">
                <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">${job.title}</h3>
                <p style="font-size:0.85rem;color:#374151;margin-bottom:2px;"><b>School:</b> ${job.school}</p>
                <p style="font-size:0.85rem;color:#374151;margin-bottom:2px;"><b>Grade:</b> ${job.grade}</p>
                <p style="font-size:0.85rem;color:#374151;margin-bottom:10px;"><b>Deadline:</b> ${job.deadline}</p>

                <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:600;margin-bottom:12px;">
                    <span style="color:#374151;">Status</span>
                    <span style="color:${spotColor};font-weight:700;">
                        ${isFull ? 'Full' : 'Available'}
                    </span>
                </div>

                ${open && !isFull ?
                    (currentUser.role === 'calon' ? `
                    <button onclick="selectJobAndApply('${job.id}')" style="background:#2563eb;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:0.875rem;">
                        Apply Now
                    </button>` : ``)
                : isFull ?
                    `<span style="color:#dc2626;font-weight:700;font-size:0.875rem;"><i class="fas fa-ban" style="margin-right:4px;"></i>No vacancies remaining</span>`
                :
                    `<span style="color:#dc2626;font-weight:700;">Closed</span>`
                }
            </div>
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
        app => String(app.applicantId) === String(currentUser.id)
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
                <th class="p-2">School Status</th>
                <th class="p-2">JSM Status</th>
                <th class="p-2">Actions</th>
            </tr>
        </thead>
        <tbody>
    `;

    userApplications.forEach(app => {

        function statusBadge(s, reason) {
            const map = {
                approved: { cls: 'status-approved', label: '✓ Approved' },
                rejected: { cls: 'status-rejected', label: '✗ Rejected' },
                pending:  { cls: 'status-pending',  label: '⏳ Pending'  },
            };
            const { cls, label } = map[s] || map['pending'];
            return `<span class="status-badge ${cls}">${label}</span>`
                 + (s === 'rejected' && reason ? `<div style="font-size:0.78rem;color:#dc2626;margin-top:4px;max-width:180px;">Reason: ${reason}</div>` : '');
        }

        const schoolS  = app.schoolStatus || 'pending';
        const jsmS     = app.jsmStatus    || 'pending';

        applicationsHTML += `
        <tr class="border-t">
            <td class="p-2">${app.position}</td>
            <td class="p-2">${app.grade}</td>
            <td class="p-2">${app.school}</td>
            <td class="p-2">${app.dateApplied}</td>
            <td class="p-2">${statusBadge(schoolS)}</td>
            <td class="p-2">${statusBadge(jsmS, app.rejectionReason)}</td>

            <td class="p-2">
                <div class="flex gap-2">

                    <button onclick="viewApplicationDetail('${app.id}')"
                    class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                    <i class="fas fa-eye"></i> View
                    </button>

                    <button onclick="editApplication('${app.id}')"
                    class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    <i class="fas fa-edit"></i> Edit
                    </button>

                    <button onclick="deleteApplication('${app.id}')"
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
function editApplication(id) {

    const app = applications.find(
        a => String(a.id || a._id) === String(id)
    );

    if (!app) {
        showToast("Application not found", "error");
        return;
    }

    // Store the ID so submitFullApplication knows to PATCH, not POST
    currentEditApplicationId = id;

    // Open the form page
    openApplyFormPage(
        app.position,
        app.grade,
        app.school
    );

    // Fill existing data
    const d = app.details || {};

    document.getElementById('fullName').value = app.applicantName || '';

    document.getElementById('newIC').value = d.newIC || '';
    document.getElementById('oldIC').value = d.oldIC || '';
    document.getElementById('dob').value = d.dob || '';
    document.getElementById('religion').value = d.religion || '';
    document.getElementById('passportNo').value = d.passportNo || '';
    document.getElementById('citizenship').value = d.citizenship || '';
    document.getElementById('gender').value = d.gender || '';
    document.getElementById('phone').value = d.phone || '';
    document.getElementById('email').value = d.email || '';
    document.getElementById('permAddress').value = d.permAddress || '';
    document.getElementById('mailAddress').value = d.mailAddress || '';
    document.getElementById('numChildren').value = d.numChildren || '';
    document.getElementById('spouseName').value = d.spouseName || '';
    document.getElementById('spouseEmployer').value = d.spouseEmployer || '';
    document.getElementById('parentName').value = d.parentName || '';
    document.getElementById('parentEmployer').value = d.parentEmployer || '';

    showToast("Application loaded for editing", "success");
}

async function deleteApplication(id) {
    if (!confirm("Are you sure you want to delete this application?")) {
        return;
    }
    try {
        await apiDeleteApplication(id); // apiDeleteApplication already calls refreshAllData
        showToast("Application deleted successfully", "success");
        if (currentUser.role === "calon") {
            loadMyApplications();
        } else if (currentUser.role === "adminJSM") {
            loadHistory();
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
                                <option value="Islamic Business School" ${currentUser.school === 'Islamic Business School' ? 'selected' : ''}>Islamic Business School</option>
                                <option value="School of Technology Management and Logistics" ${currentUser.school === 'School of Technology Management and Logistics' ? 'selected' : ''}>School of Technology Management and Logistics</option>
                                <option value="School of Creative Industry Management and Performing Arts" ${currentUser.school === 'School of Creative Industry Management and Performing Arts' ? 'selected' : ''}>School of Creative Industry Management and Performing Arts</option>
                                <option value="School of Multimedia Technology and Communication" ${currentUser.school === 'School of Multimedia Technology and Communication' ? 'selected' : ''}>School of Multimedia Technology and Communication</option>
                                <option value="School of Applied Psychology, Social Work and Policy" ${currentUser.school === 'School of Applied Psychology, Social Work and Policy' ? 'selected' : ''}>School of Applied Psychology, Social Work and Policy</option>
                                <option value="School of Quantitative Sciences" ${currentUser.school === 'School of Quantitative Sciences' ? 'selected' : ''}>School of Quantitative Sciences</option>
                                <option value="School of Education" ${currentUser.school === 'School of Education' ? 'selected' : ''}>School of Education</option>
                                <option value="School of Computing" ${currentUser.school === 'School of Computing' ? 'selected' : ''}>School of Computing</option>
                                <option value="School of Languages, Civilization and Philosophy" ${currentUser.school === 'School of Languages, Civilization and Philosophy' ? 'selected' : ''}>School of Languages, Civilization and Philosophy</option>
                                <option value="School of Law" ${currentUser.school === 'School of Law' ? 'selected' : ''}>School of Law</option>
                                <option value="School of International Studies" ${currentUser.school === 'School of International Studies' ? 'selected' : ''}>School of International Studies</option>
                                <option value="School of Government" ${currentUser.school === 'School of Government' ? 'selected' : ''}>School of Government</option>
                                <option value="School of Tourism, Hospitality and Event Management" ${currentUser.school === 'School of Tourism, Hospitality and Event Management' ? 'selected' : ''}>School of Tourism, Hospitality and Event Management</option>
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
        async function loadAdminJSMDashboard() {
            document.getElementById('pageTitle').textContent = 'Dashboard';
            const contentArea = document.getElementById('contentArea');
            await refreshAllData();
            
            const ds11Applications = applications.filter(a => a.grade === 'DS11');
            const ds13Applications = applications.filter(a => a.grade === 'DS13');
            
            contentArea.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold primary-text mb-4">Admin JSM Dashboard</h2>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                        <div class="card text-center">
                            <div class="text-3xl font-bold text-red-600">${applications.filter(a => a.status === 'rejected').length}</div>
                            <div class="text-gray-600">Rejected Applications</div>
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
                            <button onclick="openAdminViewForm('${app.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button onclick="downloadApplicationExcel('${app.id}')" class="text-green-600 hover:text-green-800 mr-2">
                                <i class="fas fa-file-excel"></i> Download
                            </button>
                            <button onclick="deleteApplication('${app.id}')" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i> Delete
                            </button>
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

    <button onclick="viewApplicationDetail('${app.id}')"
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
                                <button onclick="viewApplicationDetail('${app.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button onclick="downloadForm('${app.id}')" class="text-green-600 hover:text-green-800">
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

        async function loadHistory(filterYear) {
    await refreshAllData();
    document.getElementById('pageTitle').textContent = 'History';
    const contentArea = document.getElementById('contentArea');

    // For admin JSM: show ALL applications (pending, approved, rejected)
    let relevantApps = [];
    if (currentUser.role === 'adminJSM') {
        relevantApps = applications; // semua
    } else if (currentUser.role === 'adminSchool') {
        relevantApps = applications.filter(a => a.school === currentUser.school);
    }

    // Build list of distinct years from dateApplied
    const years = [...new Set(relevantApps.map(a => {
        const d = new Date(a.dateApplied);
        return isNaN(d) ? null : d.getFullYear();
    }).filter(y => y !== null))].sort((a, b) => b - a);

    const selectedYear = filterYear || 'all';
    if (selectedYear !== 'all') {
        relevantApps = relevantApps.filter(a => {
            const d = new Date(a.dateApplied);
            return !isNaN(d) && String(d.getFullYear()) === String(selectedYear);
        });
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
                <button onclick="openAdminViewForm('${app.id}')" style="color:#003087; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600;"><i class="fas fa-eye mr-1"></i>View</button>
                <button onclick="downloadApplicationExcel('${app.id}')" style="color:#28a745; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; margin-left:8px;"><i class="fas fa-file-excel mr-1"></i>Excel</button>
                <button onclick="deleteApplication('${app.id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; margin-left:8px;"><i class="fas fa-trash mr-1"></i>Delete</button>
            </td>
        </tr>
    `).join('');

    const yearOptions = `<option value="all" ${selectedYear === 'all' ? 'selected' : ''}>All Years</option>`
        + years.map(y => `<option value="${y}" ${String(selectedYear) === String(y) ? 'selected' : ''}>${y}</option>`).join('');

    contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
            <h2 style="color:#003087; margin:0;"><i class="fas fa-history mr-2"></i>History – All Applications</h2>
            <div style="display:flex; gap:10px; align-items:center;">
                <select onchange="loadHistory(this.value)" style="border:1px solid #ccc; border-radius:6px; padding:6px 10px; font-size:0.85rem;">
                    ${yearOptions}
                </select>
                <button onclick="exportToCSV()" class="btn-primary"><i class="fas fa-download mr-1"></i> Export CSV</button>
            </div>
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
        async function loadMonitorSchools() {
            await refreshAllData();
            document.getElementById('pageTitle').textContent = 'Monitor Schools';
            const contentArea = document.getElementById('contentArea');
            
            const schools = [
                "Tunku Puteri Intan Safinaz School of Accountancy",
                "School of Business Management",
                "School of Economics, Finance and Banking",
                "Islamic Business School",
                "School of Technology Management and Logistics",
                "School of Creative Industry Management and Performing Arts",
                "School of Multimedia Technology and Communication",
                "School of Applied Psychology, Social Work and Policy",
                "School of Quantitative Sciences",
                "School of Education",
                "School of Computing",
                "School of Languages, Civilization and Philosophy",
                "School of Law",
                "School of International Studies",
                "School of Government",
                "School of Tourism, Hospitality and Event Management"
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
                <div class="mb-6" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
                    <div>
                        <h2 class="text-2xl font-bold primary-text mb-1">Monitor Schools</h2>
                        <p class="text-gray-600">Application statistics by school/department</p>
                    </div>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    ${monitorHTML}
                </div>
            `;
        }

        // Load Admin School Dashboard
        async function loadAdminSchoolDashboard() {
            await refreshAllData();
            document.getElementById('pageTitle').textContent = 'Dashboard';
            const contentArea = document.getElementById('contentArea');
            
            // applications array is server-filtered to all statuses for this school
            const pendingApps  = applications.filter(a => a.status === 'pending');
            const approvedApps = applications.filter(a => a.status === 'approved');
            const rejectedApps = applications.filter(a => a.status === 'rejected');
            
            let applicationsHTML = '';
            if (applications.length === 0) {
                applicationsHTML = '<p class="text-gray-600">No applications for your school yet.</p>';
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
                
                applications.forEach(app => {
                    const statusClass = `status-${app.status}`;
                    applicationsHTML += `
                        <tr>
                            <td>${app.applicantName}</td>
                            <td>${app.position}</td>
                            <td>${app.grade}</td>
                            <td>${app.dateApplied}</td>
                            <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                            <td>
                                <button onclick="openSchoolViewForm('${app.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                ${app.status === 'approved' ? `
                                <button onclick="downloadApplicationExcel('${app.id}')" class="text-green-600 hover:text-green-800">
                                    <i class="fas fa-file-excel"></i> Download
                                </button>` : ''}
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
                            <div class="text-3xl font-bold text-yellow-600">${pendingApps.length}</div>
                            <div class="text-gray-600">Pending</div>
                        </div>
                        <div class="card text-center">
                            <div class="text-3xl font-bold text-green-600">${approvedApps.length}</div>
                            <div class="text-gray-600">Approved</div>
                        </div>
                        <div class="card text-center">
                            <div class="text-3xl font-bold text-red-600">${rejectedApps.length}</div>
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
           const application = applications.find(a => String(a.id || a._id) === String(applicationId));
            currentApplicationId = applicationId;
            
            if (!application) {
                showToast('Application not found', 'error');
                return;
            }
            
            let actionButtons = '';
            // No approve/reject for anyone in this modal — actions are only in the Evaluate full-form view
            
            const detailHTML = `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold primary-text mb-2">Applicant Information</h3>
                    <p><strong>Name:</strong> ${application.applicantName}</p>
                    <p><strong>Position Applied:</strong> ${application.position}</p>
                    <p><strong>Grade:</strong> ${application.grade}</p>
                    <p><strong>School:</strong> ${application.school}</p>
                    <p><strong>Date Applied:</strong> ${application.dateApplied}</p>
                    <p><strong>School Status:</strong> <span class="status-badge status-${application.schoolStatus || 'pending'}">${application.schoolStatus === 'approved' ? '✓ Approved' : application.schoolStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}</span></p>
                    <p><strong>JSM Status:</strong> <span class="status-badge status-${application.jsmStatus || 'pending'}">${application.jsmStatus === 'approved' ? '✓ Approved' : application.jsmStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}</span>${application.jsmStatus === 'rejected' && application.rejectionReason ? `<div style="font-size:0.78rem;color:#dc2626;margin-top:4px;">Reason: ${application.rejectionReason}</div>` : ''}</p>
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
                    <button onclick="downloadApplicationExcel('${application.id}')" class="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                        <i class="fas fa-file-excel mr-2"></i> Download Excel
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

        // openSchoolViewForm — view for adminSchool (View + Approve/Reject + Download)
        async function openSchoolViewForm(appId) {
            let app;
            try {
                app = await api('/applications/' + appId);
            } catch(e) {
                app = applications.find(a => String(a.id) === String(appId));
            }
            if (!app) { showToast('Application not found', 'error'); return; }

            document.getElementById('pageTitle').textContent = 'Application – ' + app.applicantName;
            const contentArea = document.getElementById('contentArea');
            const d = app.details || {};

            const statusBadge = app.status === 'approved'
                ? `<span style="font-weight:600; font-size:13px; color:#28a745; background:#e8f5e9; padding:4px 10px; border-radius:4px;">✓ APPROVED</span>`
                : app.status === 'rejected'
                ? `<span style="font-weight:600; font-size:13px; color:#dc3545; background:#fdecea; padding:4px 10px; border-radius:4px;">✗ REJECTED${app.rejectionReason ? ': ' + app.rejectionReason : ''}</span>`
                : `<span style="font-weight:600; font-size:13px; color:#f59e0b; background:#fffbeb; padding:4px 10px; border-radius:4px;">⏳ PENDING</span>`;

            const actionButtons = app.status === 'pending' ? `
                <button onclick="schoolApprove('${app.id}')" style="background:#28a745; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer; font-size:13px; font-weight:600;">
                    <i class="fas fa-check mr-1"></i> Approve
                </button>
                <button onclick="schoolReject('${app.id}')" style="background:#dc3545; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer; font-size:13px; font-weight:600;">
                    <i class="fas fa-times mr-1"></i> Reject
                </button>` : '';

            const downloadBtn = `<button onclick="downloadApplicationExcel('${app.id}')" style="background:#17a2b8; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer; font-size:13px; font-weight:600;">
                       <i class="fas fa-file-excel mr-1"></i> Download Excel
                   </button>`;

            contentArea.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <button onclick="loadAdminSchoolDashboard()" style="background:#eee; border:1px solid #ccc; padding:6px 14px; border-radius:5px; cursor:pointer; font-size:13px;"><i class="fas fa-arrow-left mr-1"></i> Back</button>
                        <h2 style="color:#003087; margin:0; font-size:18px;">Full Application Form</h2>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        ${statusBadge}
                        ${actionButtons}
                        ${downloadBtn}
                    </div>
                </div>
                <div class="card" style="padding:18px;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <tr style="background:#f0f4f8;"><td style="padding:6px 9px; border:1px solid #ccc; width:42%;"><strong>JAWATAN / Position</strong></td><td style="padding:6px 9px; border:1px solid #ccc;">${app.position}</td></tr>
                        <tr style="background:#f0f4f8;"><td style="padding:6px 9px; border:1px solid #ccc;"><strong>GRED / Grade</strong></td><td style="padding:6px 9px; border:1px solid #ccc;">${app.grade}</td></tr>
                        <tr style="background:#f0f4f8;"><td style="padding:6px 9px; border:1px solid #ccc;"><strong>PUSAT PENGAJIAN / School</strong></td><td style="padding:6px 9px; border:1px solid #ccc;">${app.school}</td></tr>
                        <tr style="background:#f0f4f8;"><td style="padding:6px 9px; border:1px solid #ccc;"><strong>TARIKH PERMOHONAN / Date Applied</strong></td><td style="padding:6px 9px; border:1px solid #ccc;">${app.dateApplied}</td></tr>
                    </table>
                </div>
                <div class="card" style="margin-top:12px;">
                    <div style="background:#003087; color:white; padding:6px 12px; margin:-20px -20px 14px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(A) BUTIRAN PERIBADI / PERSONAL DETAILS</div>
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; width:35%; color:#666; font-weight:600;">Nama Penuh</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${app.applicantName}</td></tr>
                        <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">No. K/P</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.newIC || '–'}</td></tr>
                        <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">Tarikh Lahir</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.dob || '–'}</td></tr>
                        <tr><td style="padding:5px 8px; border-bottom:1px solid #eee; color:#666; font-weight:600;">Telefon</td><td style="padding:5px 8px; border-bottom:1px solid #eee;">${d.phone || '–'}</td></tr>
                        <tr><td style="padding:5px 8px; color:#666; font-weight:600;">Emel</td><td style="padding:5px 8px;">${d.email || '–'}</td></tr>
                    </table>
                </div>
            `;
        }

        // Download form (placeholder)
        function downloadForm(applicationId) {
            showToast('Downloading application form...', 'info');
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
           today.setHours(0, 0, 0, 0);
           const deadlineDate = new Date(job.deadline);
           deadlineDate.setHours(0, 0, 0, 0);
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

            // Use a unique key per table+column so DS11 and DS13 tables don't share state
            const tableId = table.closest('[id]') ? table.closest('[id]').id : 'default';
            const sortKey = tableId + '_' + columnIndex;
            
            // Toggle sort direction
            sortDirection[sortKey] = sortDirection[sortKey] === 'asc' ? 'desc' : 'asc';
            
            // Sort rows
            rows.sort((a, b) => {
                const aValue = a.getElementsByTagName('td')[columnIndex].textContent;
                const bValue = b.getElementsByTagName('td')[columnIndex].textContent;
                
                if (sortDirection[sortKey] === 'asc') {
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
            if (currentUser.role !== 'calon' && currentUser.role !== 'adminJSM') return;
            const unreadCount = notifications.filter(n => !n.read).length;
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
        let options = jobOpenings.filter(j => !j.isFull).map(j =>
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
    <div class="card" style="padding:20px; margin-bottom:0;">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #003087; padding-bottom:14px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:14px;">
                <div style="width:56px; height:56px; background:#003087; border-radius:50%; display:flex; align-items:center; justify-content:center;"><span style="color:white; font-weight:bold; font-size:16px;">UUM</span></div>
                <div><div style="font-weight:700; font-size:14px; color:#003087;">BORANG PERMOHONAN JAWATAN AKADEMIK</div><div style="font-size:11px; color:#888; font-style:italic;">APPLICATION FORM FOR ACADEMIC POST</div></div>
            </div>
            <div style="width:90px; height:100px; border:2px solid #999; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; background:#fafafa; border-radius:4px;">
                <div id="passportPreview" style="width:100%; height:60px; display:flex; align-items:center; justify-content:center;"><span style="font-size:10px; color:#999; font-style:italic;">Passport Size<br>Photograph</span></div>
                <input type="file" id="passportPhoto" accept="image/*" style="display:none;" onchange="previewPassport(event)">
                <button onclick="document.getElementById('passportPhoto').click()" style="margin-top:2px; font-size:9px; background:#003087; color:white; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">Upload</button>
            </div>
        </div>
        <table style="width:100%; border-collapse:collapse;">
            <tr style="background:#f0f4f8;"><td style="padding:7px 10px; border:1px solid #ccc; width:42%; font-size:12px;"><strong>JAWATAN</strong> <span style="color:#888; font-style:italic; font-size:11px;">/ Position</span></td><td style="padding:7px 10px; border:1px solid #ccc; font-size:13px; font-weight:500;">${job.title}</td></tr>
            <tr style="background:#f0f4f8;"><td style="padding:7px 10px; border:1px solid #ccc; font-size:12px;"><strong>GRED JAWATAN</strong> <span style="color:#888; font-style:italic; font-size:11px;">/ Grade</span></td><td style="padding:7px 10px; border:1px solid #ccc; font-size:13px; font-weight:500;">${job.grade}</td></tr>
            <tr style="background:#f0f4f8;"><td style="padding:7px 10px; border:1px solid #ccc; font-size:12px;"><strong>BIDANG PENGKHUSUSAN</strong> <span style="color:#888; font-style:italic; font-size:11px;">/ Area of Specialization</span></td><td style="padding:7px 10px; border:1px solid #ccc;"><input type="text" id="specialization" style="width:100%; border:none; outline:none; font-size:13px;" placeholder="e.g. Computer Science"></td></tr>
            <tr style="background:#f0f4f8;"><td style="padding:7px 10px; border:1px solid #ccc; font-size:12px;"><strong>PUSAT PENGAJIAN / KOLEJ</strong> <span style="color:#888; font-style:italic; font-size:11px;">/ School / College</span></td><td style="padding:7px 10px; border:1px solid #ccc; font-size:13px; font-weight:500;">${job.school}</td></tr>
        </table>
    </div>

    <!-- SECTION A -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(A) BUTIRAN PERIBADI / <span style="font-weight:400; font-style:italic;">PERSONAL DETAILS</span></div>
        <div style="display:flex; align-items:center; margin-bottom:9px;"><div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Nama Penuh</strong><br><span style="color:#888; font-style:italic;">Full Name</span></div><input type="text" id="fullName" value="${currentUser.name}" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;"><div style="width:110px; font-size:11px; flex-shrink:0;"><strong>No. K/P Baru</strong><br><span style="color:#888; font-style:italic;">New I/C No.</span></div><input type="text" id="newIC" maxlength="14" placeholder="e.g. 990101-01-1234" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;" oninput="formatIC(this)"></div>
            <div style="flex:1; display:flex; align-items:center;"><div style="width:100px; font-size:11px; flex-shrink:0;"><strong>No. K/P Lama</strong><br><span style="color:#888; font-style:italic;">Old I/C No.</span></div><input type="text" id="oldIC" maxlength="14" placeholder="e.g. 990101-01-1234" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;" oninput="formatIC(this)"></div>
        </div>
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;"><div style="width:110px; font-size:11px; flex-shrink:0;"><strong>Tarikh Lahir</strong><br><span style="color:#888; font-style:italic;">Date of Birth</span></div><input type="date" id="dob" onchange="calcAge()" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
            <div style="flex:1; display:flex; align-items:center;"><div style="width:60px; font-size:11px; flex-shrink:0;"><strong>Umur</strong><br><span style="color:#888; font-style:italic;">Age</span></div><input type="text" id="ageField" readonly style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none; background:#fafafa; color:#666;" placeholder="Auto"></div>
        </div>
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;"><div style="width:110px; font-size:11px; flex-shrink:0;"><strong>Agama</strong><br><span style="color:#888; font-style:italic;">Religion</span></div><input type="text" id="religion" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
            <div style="flex:1; display:flex; align-items:center;"><div style="width:100px; font-size:11px; flex-shrink:0;"><strong>No. Pasport</strong><br><span style="color:#888; font-style:italic;">Passport No.</span></div><input type="text" id="passportNo" maxlength="9" placeholder="e.g. A12345678" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;" oninput="formatPassport(this)"></div>
        </div>
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;"><div style="width:110px; font-size:11px; flex-shrink:0;"><strong>Warganegara</strong><br><span style="color:#888; font-style:italic;">Citizenship</span></div><input type="text" id="citizenship" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
            <div style="flex:1; display:flex; align-items:center;"><div style="width:80px; font-size:11px; flex-shrink:0;"><strong>Jantina</strong><br><span style="color:#888; font-style:italic;">Gender</span></div><select id="gender" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none; background:transparent;"><option value="">– Pilih –</option><option>Lelaki / Male</option><option>Perempuan / Female</option></select></div>
        </div>
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1; display:flex; align-items:center;"><div style="width:110px; font-size:11px; flex-shrink:0;"><strong>Telefon</strong><br><span style="color:#888; font-style:italic;">Phone No.</span></div><input type="text" id="phone" maxlength="12" placeholder="e.g. 012-3456789" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;" oninput="formatPhone(this)"></div>
            <div style="flex:1; display:flex; align-items:center;"><div style="width:70px; font-size:11px; flex-shrink:0;"><strong>Emel</strong><br><span style="color:#888; font-style:italic;">Email</span></div><input type="email" id="email" value="${currentUser.email||''}" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
        </div>
        <div style="margin-bottom:9px;"><div style="font-size:11px; margin-bottom:3px;"><strong>Alamat Tetap</strong> <span style="color:#888; font-style:italic;">/ Permanent Address</span></div><textarea id="permAddress" rows="2" style="width:100%; border:1px solid #ccc; border-radius:4px; padding:5px 8px; font-size:12px; outline:none; resize:none;"></textarea></div>
        <div style="margin-bottom:9px;"><div style="font-size:11px; margin-bottom:3px;"><strong>Alamat Surat Menyurat</strong> <span style="color:#888; font-style:italic;">/ Mailing Address</span></div><textarea id="mailAddress" rows="2" style="width:100%; border:1px solid #ccc; border-radius:4px; padding:5px 8px; font-size:12px; outline:none; resize:none;"></textarea></div>
        <div style="display:flex; align-items:center; gap:18px; margin-bottom:9px;">
            <div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Taraf Perkahwinan</strong><br><span style="color:#888; font-style:italic;">Marital Status</span></div>
            <label style="font-size:12px; cursor:pointer;"><input type="radio" name="maritalStatus" value="Bujang"> Bujang <em style="color:#888;">(Single)</em></label>
            <label style="font-size:12px; cursor:pointer;"><input type="radio" name="maritalStatus" value="Berkahwin"> Berkahwin <em style="color:#888;">(Married)</em></label>
            <label style="font-size:12px; cursor:pointer;"><input type="radio" name="maritalStatus" value="Duda/Janda"> Duda/Janda <em style="color:#888;">(Widowed)</em></label>
        </div>
        <div style="display:flex; align-items:center; margin-bottom:9px;"><div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Bil. Anak</strong><br><span style="color:#888; font-style:italic;">No. of Children</span></div><input type="text" id="numChildren" maxlength="2" placeholder="0" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;" oninput="formatNumChildren(this)"></div>
        <div style="display:flex; gap:14px; margin-bottom:9px;">
            <div style="flex:1.4; display:flex; align-items:center;"><div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Nama Suami/Isteri</strong><br><span style="color:#888; font-style:italic;">Name of Spouse</span></div><input type="text" id="spouseName" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
            <div style="flex:1; display:flex; align-items:center;"><div style="width:80px; font-size:11px; flex-shrink:0;"><strong>Majikan</strong><br><span style="color:#888; font-style:italic;">Employer</span></div><input type="text" id="spouseEmployer" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
        </div>
        <div style="display:flex; gap:14px;">
            <div style="flex:1.4; display:flex; align-items:center;"><div style="width:130px; font-size:11px; flex-shrink:0;"><strong>Nama Ibu Bapa</strong><br><span style="color:#888; font-style:italic;">Name of Parent</span></div><input type="text" id="parentName" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
            <div style="flex:1; display:flex; align-items:center;"><div style="width:80px; font-size:11px; flex-shrink:0;"><strong>Majikan</strong><br><span style="color:#888; font-style:italic;">Employer</span></div><input type="text" id="parentEmployer" style="flex:1; border:none; border-bottom:1px solid #ccc; padding:5px 6px; font-size:13px; outline:none;"></div>
        </div>
    </div>

    <!-- SECTION C: HIGHER EDUCATION -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(C) MAKLUMAT PENGAJIAN TINGGI / <span style="font-weight:400; font-style:italic;">HIGHER EDUCATION DETAILS</span></div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px;" id="eduTable">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:14%;">Tahap<br><em style="color:#888;">Level</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:20%;">Nama Institusi<br><em style="color:#888;">Institution</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:12%;">Tahun Tamat<br><em style="color:#888;">Year</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:10%;">CGPA</th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:16%;">Bidang<br><em style="color:#888;">Specialisation</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:14%;">Certificate</th>
            </tr></thead>
            <tbody id="eduBody">
                ${['phd','master','degree','diploma','spm'].map(lvl => `
                <tr>
                    <td style="border:1px solid #ccc; padding:7px; background:#fafafa; font-weight:600;">${lvl.toUpperCase()}</td>
                    <td style="border:1px solid #ccc;"><input type="text" id="edu_${lvl}_inst" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="edu_${lvl}_year" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="edu_${lvl}_cgpa" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="edu_${lvl}_field" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc; padding:3px; text-align:center;"><input type="file" id="edu_${lvl}_spm" accept=".pdf,.jpg,.jpeg,.png" style="font-size:10px; width:100%;" title="Certificate"></td>
                </tr>`).join('')}
            </tbody>
        </table>
        <div style="margin-top:10px; text-align:right;"><button onclick="addHigherEduRow()" style="background:#28a745; color:white; border:none; padding:6px 14px; border-radius:4px; font-size:12px; cursor:pointer;"><i class="fas fa-plus mr-1"></i> Add Row</button></div>
        </div>
    </div>

    <!-- SECTION D: PROFESSIONAL AFFILIATION -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(D) PENDAFTARAN PROFESIONAL / <span style="font-weight:400; font-style:italic;">PROFESSIONAL AFFILIATION</span></div>
        <div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:42%;">Nama Badan Profesional<br><em style="color:#888;">Name of Professional Body</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:30%;">Tarikh Keahlian<br><em style="color:#888;">Date of Membership</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:28%;">No. Siri Pendaftaran<br><em style="color:#888;">Registration No</em></th>
            </tr></thead>
            <tbody>
                ${[1,2].map(n => `<tr>
                    <td style="border:1px solid #ccc;"><input type="text" id="prof_${n}_body" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="date" id="prof_${n}_date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="prof_${n}_regno" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>`).join('')}
            </tbody>
        </table></div>
    </div>

    <!-- SECTION E: SCHOLARSHIP -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(E) PEMEGANG BIASISWA, PINJAMAN / <span style="font-weight:400; font-style:italic;">RECIPIENT OF SCHOLARSHIP, LOAN</span></div>
        <div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:30%;">Badan yang Memberi<br><em style="color:#888;">Awarding Body</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:20%;">Tempoh<br><em style="color:#888;">Duration</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Terikat / Tidak Terikat<br><em style="color:#888;">Bonded / Not Bonded</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Biasiswa / Pinjaman<br><em style="color:#888;">Scholarship / Loan</em></th>
            </tr></thead>
            <tbody>
                ${[1,2].map(n => `<tr>
                    <td style="border:1px solid #ccc;"><input type="text" id="schol_${n}_body" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="schol_${n}_duration" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><select id="schol_${n}_bonded" style="width:100%; border:none; padding:3px; font-size:11px; outline:none; background:transparent;"><option value="">– Pilih –</option><option>Terikat / Bonded</option><option>Tidak Terikat / Not Bonded</option></select></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="schol_${n}_type" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>`).join('')}
            </tbody>
        </table></div>
    </div>

    <!-- SECTION F: CURRENT JOB -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(F) PEKERJAAN SEKARANG / <span style="font-weight:400; font-style:italic;">CURRENT JOB</span></div>
        <div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Nama Jawatan<br><em style="color:#888;">Position</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Nama Majikan<br><em style="color:#888;">Employer</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Gaji &amp; Gred<br><em style="color:#888;">Salary &amp; Grade</em></th>
                <th style="border:1px solid #ccc; padding:7px; text-align:left; width:25%;">Tarikh Mula<br><em style="color:#888;">Commencement</em></th>
            </tr></thead>
            <tbody><tr>
                <td style="border:1px solid #ccc;"><input type="text" id="curjob_position" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                <td style="border:1px solid #ccc;"><input type="text" id="curjob_employer" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                <td style="border:1px solid #ccc;"><input type="text" id="curjob_salary" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                <td style="border:1px solid #ccc;"><input type="date" id="curjob_date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
            </tr></tbody>
        </table></div>
    </div>

    <!-- SECTION G: WORKING EXPERIENCES -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(G) PENGALAMAN KERJA / <span style="font-weight:400; font-style:italic;">WORKING EXPERIENCES</span></div>
        <div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:18%;">Nama Jawatan<br><em style="color:#888;">Position</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:20%;">Nama Majikan<br><em style="color:#888;">Employer</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:14%;">Gaji<br><em style="color:#888;">Salary</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:14%;">Dari<br><em style="color:#888;">From</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:14%;">Hingga<br><em style="color:#888;">To</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:20%;">Sebab Berhenti<br><em style="color:#888;">Reason</em></th>
            </tr></thead>
            <tbody>
                ${[1,2,3,4].map(n => `<tr>
                    <td style="border:1px solid #ccc;"><input type="text" id="work_${n}_pos" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="work_${n}_emp" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="work_${n}_sal" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="date" id="work_${n}_from" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="date" id="work_${n}_to" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="work_${n}_reason" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>`).join('')}
            </tbody>
        </table></div>
    </div>

    <!-- SECTION H: CURRICULAR -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(H) KEGIATAN KOKURIKULUM &amp; SOSIAL / <span style="font-weight:400; font-style:italic;">CURRICULAR &amp; SOCIAL ACTIVITIES</span></div>
        <div style="display:flex; gap:14px;">
            <div style="flex:1;"><div style="background:#f0f4f8; border:1px solid #ccc; padding:7px; font-size:10px; font-weight:600; text-align:center; border-radius:4px 4px 0 0;">Peringkat Sekolah / Kolej / Universiti / Komuniti<br><em style="color:#888; font-weight:400;">School / College / University / Community Level</em></div><textarea id="cocurriculum_school" rows="4" style="width:100%; border:1px solid #ccc; border-top:none; padding:7px; font-size:11px; outline:none; resize:none; border-radius:0 0 4px 4px;"></textarea></div>
            <div style="flex:1;"><div style="background:#f0f4f8; border:1px solid #ccc; padding:7px; font-size:10px; font-weight:600; text-align:center; border-radius:4px 4px 0 0;">Peringkat Luar Sekolah / Kolej / Universiti / Komuniti<br><em style="color:#888; font-weight:400;">Outside School / College / University / Community Level</em></div><textarea id="cocurriculum_outside" rows="4" style="width:100%; border:1px solid #ccc; border-top:none; padding:7px; font-size:11px; outline:none; resize:none; border-radius:0 0 4px 4px;"></textarea></div>
        </div>
    </div>

    <!-- SECTION I: PUBLICATION -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(I) PENERBITAN / <span style="font-weight:400; font-style:italic;">PUBLICATION</span></div>
        <div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:22%;">Pengarang<br><em style="color:#888;">Author</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:32%;">Tajuk<br><em style="color:#888;">Title</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:28%;">Jurnal<br><em style="color:#888;">Journal</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:18%;">Tarikh<br><em style="color:#888;">Date</em></th>
            </tr></thead>
            <tbody>
                ${[1,2,3].map(n => `<tr>
                    <td style="border:1px solid #ccc;"><input type="text" id="pub_${n}_author" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="pub_${n}_title" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="pub_${n}_journal" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="date" id="pub_${n}_date" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>`).join('')}
            </tbody>
        </table></div>
    </div>

    <!-- SECTION J: RESEARCH -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(J) PENYELIDIKAN / <span style="font-weight:400; font-style:italic;">RESEARCH</span></div>
        <div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead><tr style="background:#f0f4f8;">
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:65%;">Tajuk<br><em style="color:#888;">Title</em></th>
                <th style="border:1px solid #ccc; padding:6px; text-align:left; width:35%;">Bidang<br><em style="color:#888;">Field</em></th>
            </tr></thead>
            <tbody>
                ${[1,2,3].map(n => `<tr>
                    <td style="border:1px solid #ccc;"><input type="text" id="res_${n}_title" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                    <td style="border:1px solid #ccc;"><input type="text" id="res_${n}_field" style="width:100%; border:none; padding:3px; font-size:11px; outline:none;"></td>
                </tr>`).join('')}
            </tbody>
        </table></div>
    </div>

    <!-- SECTION K: REFERENCE -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(K) PERAKUAN / <span style="font-weight:400; font-style:italic;">REFERENCE</span></div>
        <div style="display:flex; gap:20px;">
            ${[1,2].map(n => `
            <div style="flex:1; border:1px solid #ddd; border-radius:6px; padding:12px; background:#fafafa;">
                <div style="font-weight:600; font-size:11px; color:#003087; margin-bottom:10px; text-align:center; border-bottom:1px solid #ddd; padding-bottom:6px;">Rujukan ${n} / Reference ${n}</div>
                <div style="margin-bottom:7px;"><div style="font-size:10px; font-weight:600;">Nama / <em style="color:#888;">Name</em></div><input type="text" id="ref_${n}_name" style="width:100%; border:none; border-bottom:1px solid #ccc; padding:3px 0; font-size:12px; outline:none;"></div>
                <div style="margin-bottom:7px;"><div style="font-size:10px; font-weight:600;">Alamat / <em style="color:#888;">Address</em></div><input type="text" id="ref_${n}_addr" style="width:100%; border:none; border-bottom:1px solid #ccc; padding:3px 0; font-size:12px; outline:none;"></div>
                <div style="margin-bottom:7px;"><div style="font-size:10px; font-weight:600;">No Tel / <em style="color:#888;">Phone No</em></div><input type="tel" id="ref_${n}_phone" style="width:100%; border:none; border-bottom:1px solid #ccc; padding:3px 0; font-size:12px; outline:none;"></div>
                <div><div style="font-size:10px; font-weight:600;">Pekerjaan / <em style="color:#888;">Occupation</em></div><input type="text" id="ref_${n}_occ" style="width:100%; border:none; border-bottom:1px solid #ccc; padding:3px 0; font-size:12px; outline:none;"></div>
            </div>`).join('')}
        </div>
    </div>

    <!-- SECTION L: DECLARATION -->
    <div class="card" style="margin-top:14px;">
        <div style="background:#003087; color:white; padding:7px 12px; margin:-20px -20px 16px -20px; border-radius:8px 8px 0 0; font-size:12px; font-weight:600;">(L) PENGAKUAN PEMOHON / <span style="font-weight:400; font-style:italic;">APPLICANT'S DECLARATION</span></div>
        <div style="display:flex; align-items:flex-start; gap:10px; padding:14px; background:#fff8e1; border:1px solid #ffe082; border-radius:6px;">
            <input type="checkbox" id="declCheck" style="margin-top:2px; width:20px; height:20px; flex-shrink:0; cursor:pointer;">
            <div style="font-size:11px; line-height:1.6; color:#444;">
                <strong style="color:#003087;">Malay:</strong> Saya akui bahawa maklumat yang diberi serta lampirannya adalah lengkap, betul dan benar...<br><br>
                <strong style="color:#003087;">English:</strong> I certify that the above information is correct and I understand that any false information in this application will become sufficient grounds for refusal of employment or termination of employment immediately, without notice.
            </div>
        </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div style="margin-top:28px; text-align:center; padding-bottom:20px; display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
        <button onclick="submitFullApplication(true)" style="background:#6c757d; color:white; border:none; padding:14px 36px; border-radius:6px; font-size:15px; font-weight:600; cursor:pointer;"><i class="fas fa-save mr-2"></i> Save as Draft</button>
        <button onclick="downloadAsExcel()" style="background:#28a745; color:white; border:none; padding:14px 36px; border-radius:6px; font-size:15px; font-weight:600; cursor:pointer;"><i class="fas fa-file-excel mr-2"></i> Download Excel</button>
        <button onclick="submitFullApplication(false)" style="background:#003087; color:white; border:none; padding:14px 48px; border-radius:6px; font-size:15px; font-weight:600; cursor:pointer;"><i class="fas fa-paper-plane mr-2"></i> Submit Application</button>
    </div>`;
}

// When user picks a job from dropdown a job from dropdown
function pickJobForForm() {
    const jobId = document.getElementById('jobPicker').value;
    if (!jobId) return;
    currentApplyJob = jobOpenings.find(j => String(j.id) === String(jobId));
    if (!currentApplyJob) { showToast('Job not found.', 'error'); return; }
    openApplyFormPage(currentApplyJob.title, currentApplyJob.grade, currentApplyJob.school);
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
    // If we are editing an existing application, delegate to submitFullApplication(true)
    // which handles the PATCH path correctly
    if (currentEditApplicationId) {
        await submitFullApplication(true);
        return;
    }

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
function downloadAsExcel() {
    if (!currentApplyJob) {
        showToast('Sila pilih jawatan terlebih dahulu.', 'error');
        return;
    }

    const name = document.getElementById('fullName')?.value || 'Applicant';
    const newIC = document.getElementById('newIC')?.value || '';
    const oldIC = document.getElementById('oldIC')?.value || '';
    const dob = document.getElementById('dob')?.value || '';
    const religion = document.getElementById('religion')?.value || '';
    const passportNo = document.getElementById('passportNo')?.value || '';
    const citizenship = document.getElementById('citizenship')?.value || '';
    const gender = document.getElementById('gender')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const email = document.getElementById('emailField')?.value || document.getElementById('email')?.value || '';
    const permAddress = document.getElementById('permAddress')?.value || '';
    const mailAddress = document.getElementById('mailAddress')?.value || '';
    const specialization = document.getElementById('specialization')?.value || '';

    const rows = [];
    const addHeader = (text) => rows.push([text]);
    const addRow = (...cells) => rows.push(cells);
    const addBlank = () => rows.push([]);

    addHeader('BORANG PERMOHONAN JAWATAN AKADEMIK / APPLICATION FORM FOR ACADEMIC POST');
    addBlank();
    addRow('JAWATAN / Position', currentApplyJob.title);
    addRow('GRED JAWATAN / Grade', currentApplyJob.grade);
    addRow('BIDANG PENGKHUSUSAN / Specialization', specialization);
    addRow('PUSAT PENGAJIAN / School', currentApplyJob.school);
    addBlank();

    addHeader('(A) BUTIRAN PERIBADI / PERSONAL DETAILS');
    addRow('Nama Penuh / Full Name', name);
    addRow('No. K/P Baru / New IC', newIC);
    addRow('No. K/P Lama / Old IC', oldIC);
    addRow('Tarikh Lahir / Date of Birth', dob);
    addRow('Agama / Religion', religion);
    addRow('No. Pasport / Passport No', passportNo);
    addRow('Kewarganegaraan / Citizenship', citizenship);
    addRow('Jantina / Gender', gender);
    addRow('Telefon / Phone', phone);
    addRow('Emel / Email', email);
    addRow('Alamat Tetap / Permanent Address', permAddress);
    addRow('Alamat Surat-menyurat / Mailing Address', mailAddress);
    addBlank();

    addHeader('(C) MAKLUMAT PENGAJIAN TINGGI / HIGHER EDUCATION DETAILS');
    addRow('Tahap / Level', 'Institusi / Institution', 'Tahun Tamat / Year', 'CGPA', 'Bidang / Field');
    ['phd','master','degree','diploma','spm'].forEach(lvl => {
        const inst  = document.getElementById(`edu_${lvl}_inst`)?.value || '';
        const year  = document.getElementById(`edu_${lvl}_year`)?.value || '';
        const cgpa  = document.getElementById(`edu_${lvl}_cgpa`)?.value || '';
        const field = document.getElementById(`edu_${lvl}_field`)?.value || '';
        addRow(lvl.toUpperCase(), inst, year, cgpa, field);
    });
    addBlank();

    addHeader('GENERATED');
    addRow('Date', new Date().toISOString().split('T')[0]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 32 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 24 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Application');

    const fileName = `Application_${name.replace(/\s+/g, '_')}_${currentApplyJob.title.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showToast('Document downloaded as Excel!', 'success');
}




/* Jobs are loaded from the API (see refreshAllData). Sample data is seeded on the server if the collection is empty. */


// ===== FIXED DS11 =====
async function loadDS11Applications() {
    await refreshAllData();
    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return;

    const title = document.getElementById('pageTitle');
    if (title) title.textContent = 'DS11 Applications';

    const ds11Apps = applications.filter(app => app.grade === "DS11");

    if (ds11Apps.length === 0) {
        contentArea.innerHTML = `<div class="card"><p>No DS11 applications found.</p></div>`;
        return;
    }

    contentArea.innerHTML = `<div class="card">${generateApplicationsTable(ds11Apps)}</div>`;
}

// ===== FIXED DS13 =====
async function loadDS13Applications() {
    await refreshAllData();
    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return;

    const title = document.getElementById('pageTitle');
    if (title) title.textContent = 'DS13 Applications';

    const ds13Apps = applications.filter(app => app.grade === "DS13");

    if (ds13Apps.length === 0) {
        contentArea.innerHTML = `<div class="card"><p>No DS13 applications found.</p></div>`;
        return;
    }

    contentArea.innerHTML = `<div class="card">${generateApplicationsTable(ds13Apps)}</div>`;
}

async function loadSchoolEvaluatePage() {
    document.getElementById('pageTitle').textContent = 'Evaluate Applications';
    const contentArea = document.getElementById('contentArea');
    await refreshAllData();

    // School admin sees only their school's apps that haven't been reviewed by school yet
    const pendingApps = applications.filter(app => (app.schoolStatus || 'pending') === 'pending');

    if (pendingApps.length === 0) {
        contentArea.innerHTML = `
            <div class="card">
                <p>No pending applications to evaluate.</p>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = `
        <div class="mb-4">
            <h2 class="text-2xl font-bold primary-text">${pendingApps.length} Pending Application${pendingApps.length !== 1 ? 's' : ''}</h2>
        </div>
        ${pendingApps.map(app => `
        <div class="card mb-4">
            <h3 class="font-bold text-lg">${app.position}</h3>
            <p><strong>Applicant:</strong> ${app.applicantName}</p>
            <p><strong>Grade:</strong> ${app.grade} &nbsp;|&nbsp; <strong>School:</strong> ${app.school}</p>
            <p><strong>Date Applied:</strong> ${app.dateApplied}</p>
            <div class="mt-3" style="display:flex; gap:8px; flex-wrap:wrap;">
                <button onclick="openSchoolViewForm('${app.id}')"
                    style="background:#003087; color:white; border:none; padding:6px 14px; border-radius:5px; cursor:pointer; font-size:13px;">
                    <i class="fas fa-eye mr-1"></i> View Full Form
                </button>
                <button onclick="schoolApprove('${app.id}')"
                    style="background:#28a745; color:white; border:none; padding:6px 14px; border-radius:5px; cursor:pointer; font-size:13px;">
                    <i class="fas fa-check mr-1"></i> Approve
                </button>
                <button onclick="schoolReject('${app.id}')"
                    style="background:#dc3545; color:white; border:none; padding:6px 14px; border-radius:5px; cursor:pointer; font-size:13px;">
                    <i class="fas fa-times mr-1"></i> Reject
                </button>
            </div>
        </div>
        `).join("")}
    `;
}

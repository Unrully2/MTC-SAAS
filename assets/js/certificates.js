// =========================================================
// CERTIFICATES & OFFICIAL DOCUMENTS MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { printDocument, formatDate } from './utils.js';
import { getSchoolInfo } from './config.js';

let students = [];

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('certificates');
  renderNavbar('Official College Document Generator');

  try {
    students = (await dbService.getStudents()) || [];
  } catch (error) {
    console.error("Failed to load students:", error);
    students = [];
  }
  
  setupDocumentGenerator();
});

function setupDocumentGenerator() {
  const container = document.getElementById('certs-container');
  if (!container) return;

  const school = getSchoolInfo();

  if (!students || students.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding: 2rem; text-align: center;">
        <h3>⚠️ No Students Found</h3>
        <p style="color: #64748b;">There are no registered students available to generate official documents. Please register a student first.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">🖨️ Select Document Type & Student</h3>
          <span class="card-subtitle">Generate official letters, certificates, & transcripts branded for <strong>${school.name || 'Mercylife Training College'}</strong></span>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.25rem;">
        <div class="form-group">
          <label class="form-label">Select Student *</label>
          <select class="form-control" id="doc-student-select">
            ${students.map(s => `
              <option value="${s.id}">
                ${s.admission_no || 'N/A'} - ${s.full_name || 'Unnamed Student'} (${s.course_name || 'Unassigned Course'})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Document Template *</label>
          <select class="form-control" id="doc-type-select">
            <option value="admission">Official Admission Letter</option>
            <option value="transcript">Official Academic Transcript</option>
            <option value="recommendation">Dean / Principal's Recommendation Letter</option>
            <option value="completion">Course Completion Certificate</option>
          </select>
        </div>
      </div>

      <div style="margin-top:1.25rem; display:flex; justify-content:flex-end;">
        <button class="btn btn-primary" id="generate-doc-btn">📜 Generate & Print Document</button>
      </div>
    </div>
  `;

  document.getElementById('generate-doc-btn')?.addEventListener('click', () => {
    const studentId = document.getElementById('doc-student-select').value;
    const docType = document.getElementById('doc-type-select').value;
    const student = students.find(s => String(s.id) === String(studentId)) || students[0];
    
    if (!student) {
      alert("Please select a valid student.");
      return;
    }

    const currentSchool = getSchoolInfo();
    const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // Safe fallbacks for missing student properties
    const fullName = student.full_name || 'STUDENT NAME';
    const courseName = student.course_name || 'CERTIFICATE / DIPLOMA PROGRAM';
    const admissionNo = student.admission_no || 'MTC/2026/0000';
    const nationalId = student.national_id || 'N/A';
    const phone = student.phone || 'N/A';
    const kcseGrade = student.kcse_grade || 'C Plain';
    
    const admissionSuffix = admissionNo.includes('/') ? admissionNo.split('/').pop() : '01';
    const schoolAbbr = (currentSchool.name || 'MTC').replace(/[^A-Z]/g, '') || 'MTC';

    if (docType === 'admission') {
      printDocument(`OFFICIAL ADMISSION LETTER - ${fullName}`, `
        <div style="line-height:1.7; color:#1e293b;">
          <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.75rem;">
            <div>
              <strong>Date:</strong> ${todayStr}<br/>
              <strong>Ref:</strong> ${schoolAbbr}/ADM/2026/${admissionSuffix}
            </div>
            <div style="text-align:right;">
              <strong>To Candidate:</strong> ${fullName}<br/>
              <strong>National ID:</strong> ${nationalId}<br/>
              <strong>Phone:</strong> ${phone}
            </div>
          </div>

          <h3 style="color:#064e3b; text-transform:uppercase; letter-spacing:0.02em; border-left:4px solid #059669; padding-left:10px; margin-bottom:1rem;">
            RE: OFFER OF ADMISSION TO ${courseName.toUpperCase()}
          </h3>

          <p>We are pleased to inform you that following your academic evaluation (KCSE Mean Grade: ${kcseGrade}), you have been granted admission to <strong>${currentSchool.name}</strong> ${currentSchool.owner ? `(In affiliation with ${currentSchool.owner})` : ''}.</p>

          <table style="margin: 1.25rem 0; width:100%;">
            <tr><th style="width:30%; text-align:left;">Admission Number</th><td><strong>${admissionNo}</strong></td></tr>
            <tr><th style="text-align:left;">Program Enrolled</th><td>${courseName}</td></tr>
            <tr><th style="text-align:left;">Reporting Date</th><td>1st September 2026 (08:00 AM)</td></tr>
            <tr><th style="text-align:left;">Campus Location</th><td>${currentSchool.address || 'Kiambu Town'}</td></tr>
            <tr><th style="text-align:left;">Accrediting Board</th><td>${currentSchool.examBoard || 'TVET CDACC'}</td></tr>
          </table>

          <p>Please note that you are required to report with original copies of your KCSE Certificate, National Identification Document, 2 passport-size photographs, and medical clearance certificates.</p>

          <div style="margin-top:2.5rem; display:flex; justify-content:space-between;">
            <div>
              <br/>____________________________________<br/>
              <strong>${currentSchool.principal || 'College Principal'}</strong><br/>
              <span style="font-size:11px; color:#64748b;">${currentSchool.principalTitle || 'Principal'}</span><br/>
              <em>${currentSchool.name}</em>
            </div>
            <div style="text-align:right;">
              <br/>____________________________________<br/>
              <strong>${currentSchool.registrar || 'Academic Registrar'}</strong><br/>
              <span style="font-size:11px; color:#64748b;">${currentSchool.registrarTitle || 'Registrar'}</span><br/>
              <em>Admissions & Registry Office</em>
            </div>
          </div>
        </div>
      `);
    } else if (docType === 'transcript') {
      printDocument(`OFFICIAL ACADEMIC TRANSCRIPT - ${fullName}`, `
        <div style="line-height:1.6;">
          <table style="margin-bottom:1.5rem; background:#f8fafc; width:100%; padding:0.5rem;">
            <tr>
              <td><strong>Student Name:</strong> ${fullName}</td>
              <td><strong>Admission No:</strong> ${admissionNo}</td>
            </tr>
            <tr>
              <td><strong>Course:</strong> ${courseName}</td>
              <td><strong>Academic Year:</strong> 2026/2027</td>
            </tr>
            <tr>
              <td><strong>National ID:</strong> ${nationalId}</td>
              <td><strong>Licensing Board:</strong> ${currentSchool.examBoard || 'TVET CDACC'}</td>
            </tr>
          </table>

          <h4 style="color:#064e3b; margin-bottom:0.5rem; border-bottom:1px solid #059669; padding-bottom:4px;">SEMESTER 1 ACADEMIC COURSEWORK & MARKS</h4>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:6px; border:1px solid #cbd5e1;">Code</th>
                <th style="padding:6px; border:1px solid #cbd5e1;">Course Unit Title</th>
                <th style="padding:6px; border:1px solid #cbd5e1;">CAT (/30)</th>
                <th style="padding:6px; border:1px solid #cbd5e1;">Exam (/70)</th>
                <th style="padding:6px; border:1px solid #cbd5e1;">Total (/100)</th>
                <th style="padding:6px; border:1px solid #cbd5e1;">Grade</th>
                <th style="padding:6px; border:1px solid #cbd5e1;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px; border:1px solid #cbd5e1;">ANA-101</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">Human Anatomy & Histology I</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">25</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">58</td>
                <td style="padding:6px; border:1px solid #cbd5e1;"><strong>83</strong></td>
                <td style="padding:6px; border:1px solid #cbd5e1;"><span style="color:#059669; font-weight:700;">A</span></td>
                <td style="padding:6px; border:1px solid #cbd5e1;">Distinction</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #cbd5e1;">PHY-102</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">Medical Physiology & Pathology</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">22</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">51</td>
                <td style="padding:6px; border:1px solid #cbd5e1;"><strong>73</strong></td>
                <td style="padding:6px; border:1px solid #cbd5e1;"><span style="color:#059669; font-weight:700;">B</span></td>
                <td style="padding:6px; border:1px solid #cbd5e1;">Credit Pass</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #cbd5e1;">FAR-103</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">Pharmacology & Therapeutics</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">20</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">48</td>
                <td style="padding:6px; border:1px solid #cbd5e1;"><strong>68</strong></td>
                <td style="padding:6px; border:1px solid #cbd5e1;"><span style="color:#059669; font-weight:700;">B</span></td>
                <td style="padding:6px; border:1px solid #cbd5e1;">Credit Pass</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #cbd5e1;">NUR-201</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">Fundamentals of Nursing Practice</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">26</td>
                <td style="padding:6px; border:1px solid #cbd5e1;">61</td>
                <td style="padding:6px; border:1px solid #cbd5e1;"><strong>87</strong></td>
                <td style="padding:6px; border:1px solid #cbd5e1;"><span style="color:#059669; font-weight:700;">A</span></td>
                <td style="padding:6px; border:1px solid #cbd5e1;">Distinction</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top:1.5rem; background:#ecfdf5; padding:1rem; border-radius:6px; border:1px solid #a7f3d0;">
            <strong>CUMULATIVE PERFORMANCE SUMMARY:</strong><br/>
            Mean Score: 77.75% &bull; GPA: 3.75 &bull; Overall Recommendation: <strong>PASS WITH DISTINCTION</strong>
          </div>

          <div style="margin-top:2.5rem; display:flex; justify-content:space-between;">
            <div>
              <br/>____________________________________<br/>
              <strong>${currentSchool.registrar || 'Academic Registrar'}</strong><br/>
              <span style="font-size:11px; color:#64748b;">${currentSchool.registrarTitle || 'Registrar'}</span>
            </div>
            <div style="text-align:right;">
              <br/>____________________________________<br/>
              <strong>${currentSchool.principal || 'College Principal'}</strong><br/>
              <span style="font-size:11px; color:#64748b;">${currentSchool.principalTitle || 'Principal'}</span>
            </div>
          </div>
        </div>
      `);
    } else if (docType === 'completion') {
      printDocument(`CERTIFICATE OF COMPLETION - ${fullName}`, `
        <div style="text-align:center; padding:2rem; border:6px double #059669; background:#fafafa; border-radius:8px; margin-top:1rem;">
          <h1 style="color:#064e3b; font-size:26px; font-weight:900; letter-spacing:0.04em; margin-bottom:4px;">${(currentSchool.name || 'MERCYLIFE TRAINING COLLEGE').toUpperCase()}</h1>
          <p style="font-size:13px; color:#059669; font-weight:600; margin-top:0;">${currentSchool.tagline || 'Excellence in Healthcare & Professional Training'} ${currentSchool.owner ? `| ${currentSchool.owner}` : ''}</p>
          <hr style="border:0; border-top:1px solid #059669; width:60%; margin:1.5rem auto;" />

          <p style="font-size:14px; letter-spacing:0.1em; color:#475569; margin-bottom:1rem;">THIS IS TO CERTIFY THAT</p>
          <h2 style="color:#064e3b; font-size:24px; text-decoration:underline; font-weight:800; margin-bottom:1rem;">${fullName.toUpperCase()}</h2>
          <p style="font-size:13px; max-width:550px; margin:0 auto 1.5rem auto; line-height:1.6;">
            having completed the prescribed course of study and clinical practicum, and having passed all requisite academic examinations, is hereby awarded this Certificate in
          </p>

          <h2 style="color:#059669; font-size:20px; text-transform:uppercase; background:#ecfdf5; display:inline-block; padding:8px 20px; border-radius:4px; border:1px solid #a7f3d0; margin-bottom:1.5rem;">
            ${courseName.toUpperCase()}
          </h2>

          <p style="font-size:12px; color:#64748b;">Given under our hand and official seal on this day ${todayStr}.</p>

          <div style="display:flex; justify-content:space-around; margin-top:3rem;">
            <div>
              <br/>___________________________________<br/>
              <strong>${currentSchool.principal || 'College Principal'}</strong><br/>
              <span style="font-size:11px; color:#64748b;">${currentSchool.principalTitle || 'Principal'}</span>
            </div>
            <div>
              <br/>___________________________________<br/>
              <strong>${currentSchool.registrar || 'Academic Registrar'}</strong><br/>
              <span style="font-size:11px; color:#64748b;">${currentSchool.registrarTitle || 'Registrar'}</span>
            </div>
          </div>
        </div>
      `);
    } else {
      printDocument(`RECOMMENDATION LETTER - ${fullName}`, `
        <div style="line-height:1.7;">
          <p><strong>Date:</strong> ${todayStr}</p>
          <p><strong>TO WHOM IT MAY CONCERN</strong></p>
          <br/>
          <h4 style="color:#064e3b;">SUBJECT: CONFIRMATION AND RECOMMENDATION FOR ${fullName.toUpperCase()} (${admissionNo})</h4>
          <p>This is to confirm that <strong>${fullName}</strong> is a registered student at <strong>${currentSchool.name}</strong> pursuing <strong>${courseName}</strong>.</p>
          <p>During their period of training, ${fullName} has demonstrated exemplary dedication, high ethical standards, and outstanding practical skills in clinical attachments and academic coursework.</p>
          <p>We unreservedly recommend ${fullName} for internships, attachments, research opportunities, or employment.</p>
          <br/><br/>
          <p>Yours Sincerely,<br/>
          <strong>${currentSchool.principal || 'College Principal'}</strong><br/>
          ${currentSchool.principalTitle || 'Principal'}<br/>
          ${currentSchool.name}<br/>
          Email: ${currentSchool.email || 'info@mercylifecollege.ac.ke'} | Phone: ${currentSchool.phone || '+254 700 000 000'}
          </p>
        </div>
      `);
    }
  });
}

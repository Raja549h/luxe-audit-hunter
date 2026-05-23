// app.js
// Render assignments
function renderAssignments() {
    const container = document.getElementById('assignmentsList');
    if (!container) return;

    container.innerHTML = assignments.map(a => `
        <div class="assignment-card">
            <div class="card-header">
                <span class="urgency-${a.urgency.toLowerCase()}">${a.urgency}</span>
                <span class="platform">${a.platform}</span>
            </div>
            <div class="hotel-name">${a.hotel}</div>
            <div class="chain">${a.chain}</div>
            <div class="total-value">${a.total} <span style="font-weight:normal; font-size: 0.75rem;">total value</span></div>
            <div class="location">📍 ${a.location}</div>
            <div class="eval-type">📋 ${a.eval}</div>
            <div class="duration">⏱️ ${a.duration}</div>
            <div class="tags">${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
            <div class="comp-row" style="background: #1a1d26; padding: 10px; border-radius: 8px; margin: 10px 0; border: 1px solid #2A2D35;">
                <span style="color: #10B981; font-weight: bold;">Pay ${a.pay}</span>
                <span style="color: #D4AF37; font-weight: bold;">Reimburse ${a.reimburse}</span>
            </div>
            <div class="closes">⏰ Deadline: ${a.deadlineTime}</div>
        </div>
    `).join('');
    
    // Update stats
    const liveCount = document.getElementById('liveCount');
    if (liveCount) liveCount.innerText = assignments.length;

    const highUrgencyCount = document.getElementById('highUrgencyCount');
    if (highUrgencyCount) highUrgencyCount.innerText = assignments.filter(a => a.urgency === 'High').length;

    const assignmentCounter = document.getElementById('assignmentCounter');
    if (assignmentCounter) assignmentCounter.innerText = `Showing ${assignments.length} of ${assignments.length}`;
    
    // Calculate total reimbursement
    const totalReimburse = assignments.reduce((sum, a) => {
        const value = parseFloat(a.reimburse.replace(/[₹,]/g, ''));
        return sum + value;
    }, 0);
    
    // Format as K or L
    let formattedTotal;
    if (totalReimburse >= 100000) {
        formattedTotal = '₹' + (totalReimburse / 100000).toFixed(1) + 'L';
    } else {
        formattedTotal = '₹' + (totalReimburse / 1000).toFixed(0) + 'K';
    }
    const totalReimbursement = document.getElementById('totalReimbursement');
    if (totalReimbursement) totalReimbursement.innerText = formattedTotal;
}

// Digest / Hot / Closing tabs
const getDigest = () => assignments.slice(-5).map(a => `
    <div class="tab-list-item">
        <span>${a.hotel}</span>
        <span>${a.platform} · ${a.city}</span>
        <span>${a.total}</span>
        <button class="apply-mini" data-platform="${a.platform}">Apply</button>
    </div>
`).join('');

const getHot = () => assignments.filter(a=>a.urgency==='High').slice(0,5).map(a=>`
    <div class="tab-list-item">
        <span>${a.hotel}</span>
        <span>${a.platform} · ${a.city}</span>
        <span>${a.total}</span>
        <button class="apply-mini" data-platform="${a.platform}">Apply</button>
    </div>
`).join('');

const getClosing = () => [...assignments]
    .sort((x,y)=>x.closesDays - y.closesDays)
    .slice(0,5)
    .map(a=>`
    <div class="tab-list-item">
        <span>${a.hotel}</span>
        <span>${a.platform} · ${a.city}</span>
        <span>${a.total}</span>
        <button class="apply-mini" data-platform="${a.platform}">Apply</button>
    </div>
`).join('');

function renderTabs() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            if(tab === 'digest') tabContent.innerHTML = getDigest();
            if(tab === 'hot') tabContent.innerHTML = getHot();
            if(tab === 'closing') tabContent.innerHTML = getClosing();
            bindApply();
        });
    });
    tabContent.innerHTML = getDigest();
}

// Pipeline render
function renderPipeline() {
    const container = document.getElementById('pipelineContainer');
    if (!container) return;
    const stages = ['Saved','Applied','Shortlisted','Completed','Paid'];
    container.innerHTML = stages.map(stage => `
        <div class="pipe-col">
            <strong>${stage}</strong> ${pipelineData[stage]?.length || 0}
            ${pipelineData[stage]?.map(item => `<div style="font-size:0.65rem; margin-top:5px; color: #4a413e;">${item.name}<br><span style="color:#7a6e69;">${item.platform}</span> <span style="color:#2d6a4f; font-weight:600;">${item.amount}</span></div>`).join('') || '<div style="color:#aaa; font-size:0.6rem;">Empty</div>'}
        </div>
    `).join('');
}

// Checklist render with localStorage persistence
function renderChecklist() {
    const container = document.getElementById('checklistContainer');
    if (!container) return;
    const saved = JSON.parse(localStorage.getItem('luxeChecklist')) || Array(checklistItems.length).fill(false);
    container.innerHTML = checklistItems.map((item, idx) => `
        <li>
            <input type="checkbox" data-idx="${idx}" ${saved[idx] ? 'checked' : ''}>
            <span>${item}</span>
        </li>
    `).join('');
    
    document.querySelectorAll('#checklistContainer input').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const idx = e.target.dataset.idx;
            const newState = JSON.parse(localStorage.getItem('luxeChecklist')) || Array(checklistItems.length).fill(false);
            newState[idx] = e.target.checked;
            localStorage.setItem('luxeChecklist', JSON.stringify(newState));
        });
    });
}

// Apply button simulation
function bindApply() {
    document.querySelectorAll('.apply-mini, .btn-apply').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = e.target.dataset.platform;
            const url = platformUrls[platform];
            if (url) {
                window.open(url, '_blank');
            } else {
                alert('In real app, this would link to platform application page.');
            }
        });
    });
}

// Init all
document.addEventListener('DOMContentLoaded', () => {
    if (typeof assignments !== 'undefined') {
        renderAssignments();
        renderTabs();
        renderPipeline();
        renderChecklist();
        setTimeout(bindApply, 200);
    }
});

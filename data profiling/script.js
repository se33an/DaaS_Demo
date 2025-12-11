// --- Mock Data ---
const mockData = [
    { id: 'T1', name: 'CUSTOMER_MASTER', rowCount: 158200, domain: '客戶主題', columns: [
        { id: 'C1', name: 'CUST_ID', type: 'VARCHAR', class: 'ID', sensitive: 'PII', rules: [], selected: false },
        { id: 'C2', name: 'CUST_NAME', type: 'VARCHAR', class: 'Name', sensitive: 'PII', rules: [], selected: false },
        { id: 'C3', name: 'BIRTH_DT', type: 'DATE', class: 'Date', sensitive: 'PII', rules: [], selected: false }
    ]},
    { id: 'T2', name: 'SALES_TRANS', rowCount: 2450000, domain: '銷售主題', columns: [
        { id: 'C4', name: 'TXN_ID', type: 'VARCHAR', class: 'ID', sensitive: 'None', rules: [], selected: false },
        { id: 'C5', name: 'AMT', type: 'NUMBER', class: 'Amount', sensitive: 'Confidential', rules: [], selected: false }
    ]}
];

// --- Rule Templates ---
const testBtnHtml = `<div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"><button type="button" class="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition" onclick="testIndividualRule(event)"><i class="fas fa-flask mr-1"></i> 試跑 (Test)</button><span class="text-xs text-gray-500 test-result ml-2 font-medium"></span></div>`;

const ruleDefs = [
    { id: 'completeness', name: '1. 資料完備性', desc: '檢查空值/空白/零值', html: `<div class="flex gap-4 mb-2"><label class="checkbox-label"><input type="checkbox" checked class="mr-1">Null</label><label class="checkbox-label"><input type="checkbox" class="mr-1">Blank</label><label class="checkbox-label"><input type="checkbox" class="mr-1">Zero</label></div>${testBtnHtml}` },
    { id: 'consistency', name: '2. 資料一致性', desc: '跨表分佈比對', html: `<div class="grid grid-cols-3 gap-2 mb-2"><input class="input-field" placeholder="Schema"><input class="input-field" placeholder="Table"><input class="input-field" placeholder="Column"></div>${testBtnHtml}` },
    { id: 'accuracy_range', name: '3. 資料準確性', desc: '數值範圍', html: `<div class="flex gap-2 mb-2"><input type="number" placeholder="Min" class="input-field w-1/2"><input type="number" placeholder="Max" class="input-field w-1/2"></div>${testBtnHtml}` },
    { id: 'uniqueness', name: '6. 資料獨特性', desc: '唯一值/重複', html: `<div class="mb-2"><input type="text" placeholder="Columns" class="input-field"></div>${testBtnHtml}` }
];

// --- State ---
let currentStep = 1;
let selectedRules = [];
let editTarget = {}; 
let sortConfig = { key: null, dir: 'asc' };

// --- UI Toggles ---
function toggleFilterPanel() {
    const el = document.getElementById('filter-panel-content');
    const icon = document.getElementById('filter-panel-icon');
    if(el.style.display === 'none') { el.style.display = 'block'; icon.style.transform = 'rotate(0deg)'; }
    else { el.style.display = 'none'; icon.style.transform = 'rotate(180deg)'; }
}
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.accordion-icon');
    if(content.style.display === 'block') { content.style.display = 'none'; header.classList.remove('active'); }
    else { content.style.display = 'block'; header.classList.add('active'); }
}

// --- Search & Render ---
function executeSearch() {
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('results-area').classList.remove('hidden');
    renderTable();
}

function sortTable(key) {
    if(sortConfig.key === key) sortConfig.dir = sortConfig.dir === 'asc' ? 'desc' : 'asc';
    else { sortConfig.key = key; sortConfig.dir = 'asc'; }
    
    document.querySelectorAll('thead th i.sort-icon').forEach(i => i.className = 'fas fa-sort sort-icon');
    const targetTh = document.querySelector(`th[onclick="sortTable('${key}')"] i`);
    if(targetTh) targetTh.className = `fas fa-sort-${sortConfig.dir === 'asc' ? 'up' : 'down'} sort-icon text-blue-600`;

    mockData.forEach(table => {
        table.columns.sort((a, b) => {
            let valA = a[key] || '', valB = b[key] || '';
            if(key === 'status') {
                const w = r => !r.length ? 0 : (r[0].status === 'Profiling' ? 2 : 1);
                valA = w(a.rules); valB = w(b.rules);
            }
            if(valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
            if(valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
            return 0;
        });
    });
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    let total = 0;

    mockData.forEach(table => {
        // Table Group Header (Title + Checkbox)
        const trH = document.createElement('tr');
        trH.className = 'table-group-header';
        trH.onclick = function() {
            this.classList.toggle('group-collapsed');
            let next = this.nextElementSibling;
            while(next && next.classList.contains('column-row')) {
                next.style.display = next.style.display === 'none' ? 'table-row' : 'none';
                next = next.nextElementSibling;
            }
        };
        trH.innerHTML = `<td colspan="13" onclick="event.stopPropagation()"><div class="flex items-center"><input type="checkbox" class="mr-3 w-4 h-4 rounded text-blue-600" onchange="toggleTableSelect(this, '${table.id}')"> <i class="fas fa-chevron-down group-toggle-icon mr-2" onclick="this.closest('tr').click()"></i> [${table.domain}] ${table.name}</div></td>`;
        tbody.appendChild(trH);

        table.columns.forEach(col => {
            total++;
            let ruleHtml='', baseHtml='', critHtml='', statHtml='', scanHtml='', taskHtml='', rTimeHtml='', pTimeHtml='';

            if(col.rules.length > 0) {
                col.rules.forEach((r, idx) => {
                    const cls = "h-12 flex items-center border-b border-gray-50 last:border-0 px-1";
                    
                    ruleHtml += `<div class="${cls} text-blue-600 hover:underline cursor-pointer truncate font-medium" onclick="showRuleDetails('${table.id}','${col.id}',${idx})">${r.name}</div>`;
                    baseHtml += `<div class="${cls} font-mono text-gray-700 justify-center">${r.baseline || '-'}</div>`;
                    
                    if(r.status === 'Completed') {
                        if(r.criteria) critHtml += `<div class="${cls} justify-between bg-blue-50 text-blue-800 font-bold px-1 text-xs rounded"><span>> ${r.criteria}</span><button onclick="openCriteria('${table.id}','${col.id}',${idx})" class="text-gray-400 hover:text-blue-600"><i class="fas fa-cog"></i></button></div>`;
                        else critHtml += `<div class="${cls} justify-center"><button onclick="openCriteria('${table.id}','${col.id}',${idx})" class="text-xs bg-yellow-50 border border-yellow-300 text-yellow-700 px-1 py-0.5 rounded shadow-sm hover:bg-yellow-100">設定</button></div>`;
                    } else { critHtml += `<div class="${cls} justify-center text-gray-300">-</div>`; }

                    let badge = r.status === 'Profiling' ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded flex items-center"><i class="fas fa-spinner fa-spin mr-1"></i>剖析中</span>' : (r.status === 'Completed' ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center"><i class="fas fa-check-circle mr-1"></i>完成</span>' : '-');
                    statHtml += `<div class="${cls} justify-center">${badge}</div>`;
                    scanHtml += `<div class="${cls} text-xs text-gray-500 justify-end truncate" title="${r.scanInfo}">${r.status === 'Completed' ? r.scanInfo : '-'}</div>`;
                    taskHtml += `<div class="${cls} text-xs text-purple-600 justify-center">Daily DQ</div>`;
                    rTimeHtml += `<div class="${cls} text-xs text-gray-400 justify-center">${r.ruleTime ? r.ruleTime.split(' ')[1] : '-'}</div>`;
                    pTimeHtml += `<div class="${cls} text-xs text-gray-400 justify-center">${r.profileTime && r.profileTime !== '-' ? r.profileTime.split(' ')[1] : '-'}</div>`;
                });
            }

            const tr = document.createElement('tr');
            tr.className = 'column-row bg-white border-b border-gray-100';
            tr.innerHTML = `
                <td class="text-center align-top pt-3 sticky-col-1"><input type="checkbox" class="col-check text-blue-600 rounded w-4 h-4" data-tid="${table.id}" value="${col.id}"></td>
                <td class="align-top pt-3 font-medium truncate sticky-col-2" title="${col.name}">${col.name}</td>
                <td class="align-top pt-3 text-xs text-gray-500">${col.type}</td>
                <td class="align-top pt-3 text-xs">${col.class}</td>
                <td class="align-top pt-3 text-xs text-red-600">${col.sensitive}</td>
                <td class="p-0 border-l border-gray-100 align-top text-sm">${ruleHtml || '<div class="h-12"></div>'}</td>
                <td class="p-0 align-top text-sm">${baseHtml || '<div class="h-12"></div>'}</td>
                <td class="p-0 align-top text-sm">${critHtml || '<div class="h-12"></div>'}</td>
                <td class="p-0 border-l border-gray-100 align-top text-sm">${statHtml || '<div class="h-12"></div>'}</td>
                <td class="p-0 align-top text-sm">${scanHtml || '<div class="h-12"></div>'}</td>
                <td class="p-0 align-top text-sm">${taskHtml || '<div class="h-12"></div>'}</td>
                <td class="p-0 border-l border-gray-100 align-top text-sm">${rTimeHtml || '<div class="h-12"></div>'}</td>
                <td class="p-0 align-top text-sm">${pTimeHtml || '<div class="h-12"></div>'}</td>
            `;
            tbody.appendChild(tr);
        });
    });
    document.getElementById('total-count').innerText = total;
    document.getElementById('pag-total').innerText = total;
    bindCheckboxEvents();
}

function toggleTableSelect(cb, tid) {
    document.querySelectorAll(`.col-check[data-tid="${tid}"]`).forEach(c => c.checked = cb.checked);
    updateBtnState();
}

function bindCheckboxEvents() {
    document.querySelectorAll('.col-check').forEach(cb => cb.addEventListener('change', updateBtnState));
    document.getElementById('check-all').addEventListener('change', (e) => {
        document.querySelectorAll('.col-check').forEach(c => c.checked = e.target.checked);
        document.querySelectorAll('.table-group-header input').forEach(c => c.checked = e.target.checked);
        updateBtnState();
    });
}

function updateBtnState() {
    const cnt = document.querySelectorAll('.col-check:checked').length;
    document.getElementById('selected-count').innerText = cnt;
    document.getElementById('btn-apply-rules').disabled = cnt === 0;
}

// --- Wizard ---
function openWizard() { currentStep = 1; selectedRules = []; updateWizard(); renderRuleCards(); document.getElementById('wizard-modal').classList.add('open'); }
function closeWizard() { document.getElementById('wizard-modal').classList.remove('open'); }

function renderRuleCards() {
    const c = document.getElementById('rules-list-container');
    c.innerHTML = ruleDefs.map(r => `
        <div class="rule-card bg-white border p-4 rounded mb-2" onclick="toggleRule(this, '${r.id}')">
            <div class="flex items-start gap-3">
                <input type="checkbox" class="mt-1 rule-check" value="${r.id}">
                <div class="flex-1">
                    <div class="font-bold text-gray-800">${r.name}</div>
                    <div class="text-sm text-gray-500 mb-3">${r.desc}</div>
                    <div class="bg-gray-50 p-2 mt-2 rounded border hidden rule-params" onclick="event.stopPropagation()">${r.html}</div>
                </div>
            </div>
        </div>`).join('');
}

window.toggleRule = function(el) {
    const cb = el.querySelector('.rule-check'); const p = el.querySelector('.rule-params');
    cb.checked = !cb.checked;
    if(cb.checked) { el.classList.add('selected'); p.classList.remove('hidden'); } 
    else { el.classList.remove('selected'); p.classList.add('hidden'); }
}

window.testIndividualRule = function(e) { 
    e.stopPropagation(); const btn=e.target.closest('button'); 
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 測試中'; 
    setTimeout(()=>{ btn.innerHTML = '✔ 測試通過'; btn.className = "text-xs px-3 py-1.5 bg-green-100 text-green-700 border border-green-200 rounded"; }, 600); 
}

function updateWizard() {
    document.getElementById('step-1').classList.toggle('hidden', currentStep!==1);
    document.getElementById('step-2').classList.toggle('hidden', currentStep!==2);
    document.getElementById('btn-wiz-prev').disabled = currentStep===1;
    
    const s1=document.querySelector('[data-step="1"] .step-indicator'), s2=document.querySelector('[data-step="2"] .step-indicator');
    if(currentStep===1) {
        s1.className='step-indicator bg-blue-600 text-white'; s2.className='step-indicator bg-gray-200 text-gray-500';
        document.getElementById('btn-wiz-next').classList.remove('hidden'); document.getElementById('btn-wiz-run').classList.add('hidden');
    } else {
        s1.className='step-indicator bg-green-500 text-white'; s2.className='step-indicator bg-blue-600 text-white';
        document.getElementById('btn-wiz-next').classList.add('hidden'); document.getElementById('btn-wiz-run').classList.remove('hidden');
        document.getElementById('summary-rule-count').innerText = selectedRules.length;
        const ss=document.getElementById('w-scope'), si=document.getElementById('w-scope-val');
        ss.onchange=()=>{ if(ss.value==='full') si.classList.add('hidden'); else { si.classList.remove('hidden'); si.placeholder = ss.value==='percent' ? '輸入百分比' : '輸入筆數'; } };
    }
}

document.getElementById('btn-wiz-next').onclick = () => {
    const checks = document.querySelectorAll('.rule-check:checked');
    if(checks.length===0) return alert('請選擇規則');
    selectedRules = Array.from(checks).map(c => ruleDefs.find(d=>d.id===c.value));
    currentStep=2; updateWizard();
}
document.getElementById('btn-wiz-prev').onclick = () => { currentStep--; updateWizard(); }

document.getElementById('btn-wiz-run').onclick = () => {
    const now = new Date().toLocaleString('zh-TW', { hour12: false });
    const scope = document.getElementById('w-scope').value;
    const scopeVal = document.getElementById('w-scope-val').value;
    
    document.querySelectorAll('.col-check:checked').forEach(cb => {
        const t = mockData.find(d=>d.id===cb.dataset.tid);
        const c = t.columns.find(x=>x.id===cb.value);
        
        // Calculate Scan Info based on Total Rows (Mock)
        let scanInfoStr = '';
        if(scope === 'full') scanInfoStr = `${t.rowCount.toLocaleString()} (Full)`;
        else if (scope === 'percent') {
            const pct = parseInt(scopeVal)||0;
            scanInfoStr = `${Math.floor(t.rowCount * (pct/100)).toLocaleString()} (${pct}%)`;
        } else {
            scanInfoStr = `${parseInt(scopeVal).toLocaleString()} (Rows)`;
        }

        selectedRules.forEach(r => {
            if(!c.rules.some(e=>e.id===r.id)) {
                c.rules.push({ 
                    id: r.id, name: r.name, status: 'Profiling', 
                    scanInfo: scanInfoStr, ruleTime: now, profileTime: '-', 
                    baseline: null, criteria: null, tolerance: 0 
                });
                simulateProfiling(c, c.rules.length-1);
            }
        });
    });
    closeWizard(); renderTable();
}

function simulateProfiling(col, idx) {
    setTimeout(() => {
        const r = col.rules[idx];
        if(r) {
            r.status = 'Completed';
            r.baseline = (Math.random()*15+85).toFixed(2)+'%';
            r.profileTime = new Date().toLocaleString('zh-TW', { hour12: false });
            renderTable();
        }
    }, 3000);
}

// --- Criteria ---
function openCriteria(tid, cid, idx) {
    editTarget = { tid, cid, idx };
    const r = mockData.find(t=>t.id===tid).columns.find(c=>c.id===cid).rules[idx];
    document.getElementById('crit-rule-name').innerText = r.name;
    document.getElementById('crit-base').value = r.baseline;
    document.getElementById('crit-tol').value = r.tolerance||0;
    calcCrit(r.baseline, r.tolerance||0);
    document.getElementById('criteria-modal').classList.add('open');
}
document.getElementById('crit-tol').oninput = (e) => calcCrit(document.getElementById('crit-base').value, e.target.value);
function calcCrit(b, t) { document.getElementById('crit-val').value = '> ' + (parseFloat(b)-parseFloat(t)||0).toFixed(2) + '%'; }
function saveCriteria() {
    const r = mockData.find(t=>t.id===editTarget.tid).columns.find(c=>c.id===editTarget.cid).rules[editTarget.idx];
    r.tolerance = document.getElementById('crit-tol').value;
    r.criteria = document.getElementById('crit-val').value;
    document.getElementById('criteria-modal').classList.remove('open');
    renderTable();
}

// --- Detail ---
window.showRuleDetails = function(tid, cid, idx) {
    editTarget = { tid, cid, idx };
    const r = mockData.find(t=>t.id===tid).columns.find(c=>c.id===cid).rules[idx];
    document.getElementById('detail-title').innerText = r.name;
    document.getElementById('view-mode-content').innerHTML = `<ul><li>Scope: ${r.scanInfo}</li><li>Baseline: ${r.baseline||'-'}</li></ul>`;
    
    document.getElementById('view-mode-content').classList.remove('hidden');
    document.getElementById('edit-mode-content').classList.add('hidden');
    document.getElementById('badge-edit').classList.add('hidden');
    document.getElementById('btn-close').classList.remove('hidden');
    document.getElementById('btn-edit').classList.remove('hidden');
    document.getElementById('btn-save').classList.add('hidden');
    document.getElementById('btn-del').classList.add('hidden');
    document.getElementById('detail-modal').classList.add('open');
}
function enableEdit() {
    document.getElementById('view-mode-content').classList.add('hidden');
    document.getElementById('edit-mode-content').classList.remove('hidden');
    document.getElementById('badge-edit').classList.remove('hidden');
    document.getElementById('btn-edit').classList.add('hidden');
    document.getElementById('btn-del').classList.remove('hidden');
    document.getElementById('btn-save').classList.remove('hidden');
    const r = mockData.find(t=>t.id===editTarget.tid).columns.find(c=>c.id===editTarget.cid).rules[editTarget.idx];
    const def = ruleDefs.find(d => d.id === r.id);
    document.getElementById('edit-inputs').innerHTML = def ? def.html : 'Params...';
}
function executeInEditMode() {
    const btn = document.getElementById('btn-rerun');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 計算中...';
    setTimeout(() => {
        btn.innerHTML = '執行重算 (背景)';
        document.getElementById('post-run-area').classList.remove('hidden');
        const nb = (Math.random()*15+85).toFixed(2)+'%';
        document.getElementById('e-base').value = nb;
        const tol = document.getElementById('e-tol');
        tol.oninput = () => document.getElementById('e-crit').value = '> ' + (parseFloat(nb)-parseFloat(tol.value)||0).toFixed(2) + '%';
        tol.value = 0; tol.dispatchEvent(new Event('input'));
    }, 1000);
}
function saveEditAndRun() {
    const now = new Date().toLocaleString('zh-TW', { hour12: false });
    const col = mockData.find(t=>t.id===editTarget.tid).columns.find(c=>c.id===editTarget.cid);
    const r = col.rules[editTarget.idx];
    r.baseline = document.getElementById('e-base').value;
    r.tolerance = document.getElementById('e-tol').value;
    r.criteria = document.getElementById('e-crit').value;
    r.ruleTime = now; r.profileTime = now;
    closeDetailModal(); renderTable();
}
function deleteRule() {
    if(!confirm("移除?")) return;
    const c = mockData.find(t=>t.id===editTarget.tid).columns.find(c=>c.id===editTarget.cid);
    c.rules.splice(editTarget.idx, 1);
    closeDetailModal(); renderTable();
}
function closeDetailModal() { document.getElementById('detail-modal').classList.remove('open'); }
function captureRuleParams() { return {}; }
    </script>
</body>
</html>
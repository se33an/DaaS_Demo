// --- Mock Data (REQ 3: Added 'dept') ---
const mockData = [
    {
        id: 'T1', name: 'CUST_MASTER', rowCount: 158200, domain: 'Customer', columns: [
            {
                id: 'C1', name: 'ID_NUM', type: 'VARCHAR', dept: '資訊部', class: 'ID', sensitive: 'PII', rules: [
                    { id: 'format', name: 'Format', status: 'Completed', scanInfo: '158,200 (Full)', baseline: '100%', criteria: '> 99%', ruleTime: '2023/12/01 10:00:00', profileTime: '2023/12/01 10:05:00', where: '', tolerance: 0 },
                    { id: 'completeness', name: 'Completeness', status: 'Completed', scanInfo: '158,200 (Full)', baseline: '98.5%', criteria: '> 98%', ruleTime: '2023/12/01 10:00:00', profileTime: '2023/12/01 10:05:00', where: '', tolerance: 0.5 }
                ], selected: false
            },
            {
                id: 'C2', name: 'EMAIL', type: 'VARCHAR', dept: '業務部', class: 'Email', sensitive: 'PII', rules: [
                    { id: 'format', name: 'Format', status: 'Completed', scanInfo: '158,200 (Full)', baseline: '98%', criteria: '> 95%', ruleTime: '2023/12/01 10:00:00', profileTime: '2023/12/01 10:05:00', where: '', tolerance: 3 }
                ], selected: false
            },
            { id: 'C3', name: 'BIRTH_DT', type: 'DATE', dept: '人資部', class: 'Date', sensitive: 'PII', rules: [], selected: false }
        ]
    },
    {
        id: 'T2', name: 'SALES_TXN', rowCount: 2450000, domain: 'Sales', columns: [
            {
                id: 'C4', name: 'TXN_ID', type: 'VARCHAR', dept: '資訊部', class: 'ID', sensitive: 'Gen', rules: [
                    { id: 'null', name: 'Null Check', status: 'Completed', scanInfo: '2,450,000 (Full)', baseline: '0%', criteria: '< 1%', ruleTime: '2023/12/01 10:00:00', profileTime: '2023/12/01 10:05:00', where: '', tolerance: 1 }
                ], selected: false
            },
            {
                id: 'C5', name: 'AMOUNT', type: 'DECIMAL', dept: '財務部', class: 'Amt', sensitive: 'Conf', rules: [
                    { id: 'range', name: 'Range', status: 'Completed', scanInfo: '2,450,000 (Full)', baseline: '0 Errs', criteria: '0 Errs', ruleTime: '2023/12/01 10:00:00', profileTime: '2023/12/01 10:05:00', where: '', tolerance: 0 }
                ], selected: false
            }
        ]
    }
];

const testBtnHtml = `<div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"><button type="button" class="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition" onclick="testIndividualRule(event)"><i class="fas fa-flask mr-1"></i> 試跑 (Test)</button><span class="text-xs text-gray-500 test-result ml-2 font-medium"></span></div>`;

const ruleDefs = [
    {
        id: 'completeness',
        name: '1. 資料完備性 (Completeness)',
        desc: '檢查資料是否存在缺失或無效值。',
        html: `<div class="mb-2 text-xs text-gray-500">偵測欄位中 空值 (Null)、空白字串 (Blank) 或 零值 (Zero) 的筆數與佔比。</div>
               <div class="flex gap-4 mb-2">
                   <label class="flex items-center"><input type="checkbox" checked class="mr-1">Null</label>
                   <label class="flex items-center"><input type="checkbox" class="mr-1">Blank</label>
                   <label class="flex items-center"><input type="checkbox" class="mr-1">Zero</label>
               </div>${testBtnHtml}`
    },
    {
        id: 'consistency',
        name: '2. 資料一致性 (Consistency)',
        desc: '比對跨資料表間的內容分佈是否一致。',
        html: `<div class="mb-2 text-xs text-gray-500">比較來源表與目標表特定欄位的內容值分佈。</div>
               <div class="grid grid-cols-1 gap-2 mb-2">
                   <input class="border p-2 w-full text-sm rounded" placeholder="Target Schema">
                   <input class="border p-2 w-full text-sm rounded" placeholder="Target Table">
                   <input class="border p-2 w-full text-sm rounded" placeholder="Target Column">
               </div>${testBtnHtml}`
    },
    {
        id: 'accuracy_range',
        name: '3. 資料準確性 - 數值 (Accuracy - Range)',
        desc: '檢核數值是否落在合理的區間範圍。',
        html: `<div class="mb-2 text-xs text-gray-500">依據業務規則設定最小值與最大值。</div>
               <div class="flex gap-2 mb-2">
                   <input type="number" placeholder="Min Value" class="border p-2 w-1/2 text-sm rounded">
                   <input type="number" placeholder="Max Value" class="border p-2 w-1/2 text-sm rounded">
               </div>${testBtnHtml}`
    },
    {
        id: 'accuracy_date',
        name: '4. 資料準確性 - 日期 (Accuracy - Date)',
        desc: '驗證日期格式與有效性是否合規。',
        html: `<div class="mb-2 text-xs text-gray-500">確保日期欄位的字串格式符合系統標準。</div>
               <div class="mb-2">
                   <select class="border p-2 w-full text-sm rounded">
                       <option>YYYY/MM/DD</option>
                       <option>YYYY-MM-DD</option>
                       <option>MM/DD/YYYY</option>
                       <option>Custom Format...</option>
                   </select>
               </div>${testBtnHtml}`
    },
    {
        id: 'integrity',
        name: '5. 資料健全性 (Integrity)',
        desc: '檢查主從資料表的關聯完整性。',
        html: `<div class="mb-2 text-xs text-gray-500">驗證子表外鍵值是否存在於主表中 (Orphan Data)。</div>
               <div class="grid grid-cols-1 gap-2 mb-2">
                   <input class="border p-2 w-full text-sm rounded" placeholder="Parent Schema">
                   <input class="border p-2 w-full text-sm rounded" placeholder="Parent Table">
                   <input class="border p-2 w-full text-sm rounded" placeholder="Parent Column (PK)">
               </div>${testBtnHtml}`
    },
    {
        id: 'uniqueness',
        name: '6. 資料獨特性 (Uniqueness)',
        desc: '偵測資料是否有重複出現的情形。',
        html: `<div class="mb-2 text-xs text-gray-500">檢核欄位（或多欄位組合）的值是否唯一。</div>
               <div class="mb-2">
                   <input type="text" placeholder="Columns (comma separated)" class="border p-2 w-full text-sm rounded" value="Current Column">
               </div>${testBtnHtml}`
    },
    {
        id: 'outlier',
        name: '7. 資料規範 (Outlier)',
        desc: '透過統計方法偵測異常的離群值。',
        html: `<div class="mb-2 text-xs text-gray-500">利用 平均值 ± N 倍標準差 標記異常值。</div>
               <div class="flex items-center gap-2 mb-2">
                   <span class="text-sm">Mean ±</span>
                   <input type="number" value="3" class="border p-2 w-16 text-sm rounded text-center">
                   <span class="text-sm">StdDev</span>
               </div>${testBtnHtml}`
    },
    {
        id: 'custom_sql',
        name: '8. 自訂 SQL 邏輯 (Custom SQL)',
        desc: '使用 SQL 語法撰寫客製化的檢核規則。',
        html: `<div class="mb-2 text-xs text-gray-500">撰寫 SQL Query 進行複雜邏輯驗證。</div>
               <div class="mb-2">
                   <textarea class="border p-2 w-full text-sm rounded h-20 font-mono" placeholder="SELECT count(*) FROM ... WHERE ..."></textarea>
               </div>${testBtnHtml}`
    }
];

let currentStep = 1, selectedRules = [], editTarget = {}, sortConfig = { key: null, dir: 'asc' };

// --- UI ---
function toggleFilterPanel() {
    const el = document.getElementById('filter-panel-content');
    const icon = document.getElementById('filter-panel-icon');
    if (el.style.display === 'none') { el.style.display = 'block'; icon.style.transform = 'rotate(0deg)'; }
    else { el.style.display = 'none'; icon.style.transform = 'rotate(180deg)'; }
}
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.accordion-icon');
    if (content.style.display === 'block') { content.style.display = 'none'; header.classList.remove('active'); }
    else { content.style.display = 'block'; header.classList.add('active'); }
}

function executeSearch() {
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('results-area').classList.remove('hidden');
    renderTable();
}

function applySecondaryFilter() {
    // 1. Get filter values
    const ruleFilter = document.getElementById('rule-filter-select').value;
    // Task filter selector - assuming it is the next select in the toolbar, let's give it an ID if possible or select by position, 
    // but for now let's just grab by the onchange attribute logic or assume it is the 2nd select
    // To be safe, let's just re-implement based on the DOM structure:
    const taskSelect = document.querySelector('select[onchange="applySecondaryFilter()"]:nth-of-type(1)'); // This might be risky if we changed order. 
    // Actually, let's just update the HTML to give IDs to both selects to be safe in the future, 
    // but for this specific request we are only asked to add rules.
    // However, since I can't see the task select ID in the provided snippet to confirm, I'll rely on the rule filter logic I just added an ID for.

    // Better approach: Since I modified the HTML to add id="rule-filter-select", I can use that.

    // NOTE: The previous code was just a mock implementation "renderTable();". 
    // Now we need substantial logic to filter the MOCK DATA for display.
    // However, the `renderTable` function iterates over `mockData`. To support filtering without destroying mockData, 
    // we should create a `filteredData` or modify `renderTable` to accept data.
    // But `renderTable` uses `mockData` globally.
    // A simple way is to modify `renderTable` to filter on the fly or just hide rows.

    // Let's modify `renderTable` to read the filters itself, which is safer.
    renderTable();
}

function sortTable(key) {
    if (sortConfig.key === key) sortConfig.dir = sortConfig.dir === 'asc' ? 'desc' : 'asc';
    else { sortConfig.key = key; sortConfig.dir = 'asc'; }

    document.querySelectorAll('thead th i.sort-icon').forEach(i => i.className = 'fas fa-sort sort-icon');
    const targetTh = document.querySelector(`th[onclick="sortTable('${key}')"] i`);
    if (targetTh) targetTh.className = `fas fa-sort-${sortConfig.dir === 'asc' ? 'up' : 'down'} sort-icon text-blue-600`;

    mockData.forEach(table => {
        table.columns.sort((a, b) => {
            let valA = a[key] || '', valB = b[key] || '';
            if (key === 'status') {
                const w = r => !r.length ? 0 : (r[0].status === 'Profiling' ? 2 : 1);
                valA = w(a.rules); valB = w(b.rules);
            }
            if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
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
        const trH = document.createElement('tr');
        trH.className = 'table-group-header';
        trH.onclick = function () {
            this.classList.toggle('group-collapsed');
            let next = this.nextElementSibling;
            while (next && next.classList.contains('column-row')) {
                next.style.display = next.style.display === 'none' ? 'table-row' : 'none';
                next = next.nextElementSibling;
            }
        };
        trH.innerHTML = `<td colspan="14" onclick="event.stopPropagation()"><div class="flex items-center"><input type="checkbox" class="mr-3 w-4 h-4 rounded text-blue-600" onchange="toggleTableSelect(this, '${table.id}')"> <i class="fas fa-chevron-down group-toggle-icon mr-2" onclick="this.closest('tr').click()"></i> [${table.domain}] ${table.name}</div></td>`;
        tbody.appendChild(trH);

        table.columns.forEach(col => {
            // total++; // Moved to after filter check
            let ruleHtml = '', baseHtml = '', critHtml = '', statHtml = '', scanHtml = '', taskHtml = '', rTimeHtml = '', pTimeHtml = '';

            if (col.rules.length > 0) {
                col.rules.forEach((r, idx) => {
                    const cls = "h-12 flex items-center border-b border-gray-50 last:border-0 px-1";
                    ruleHtml += `<button type="button" class="${cls} text-blue-600 hover:underline cursor-pointer truncate font-medium w-full text-left" onclick="showRuleDetails('${table.id}','${col.id}',${idx})">${r.name}</button>`;
                    baseHtml += `<div class="${cls} font-mono text-gray-700 justify-center">${r.baseline || '-'}</div>`;

                    // REQ 4: Merged "Setting" flow into Detail Modal
                    if (r.status === 'Completed') {
                        if (r.criteria) critHtml += `<div class="${cls} justify-between bg-blue-50 text-blue-800 font-bold px-1 text-xs rounded"><span>> ${r.criteria}</span><button onclick="showRuleDetails('${table.id}','${col.id}',${idx}, true)" class="text-gray-400 hover:text-blue-600"><i class="fas fa-cog"></i></button></div>`;
                        else critHtml += `<div class="${cls} justify-center"><button onclick="showRuleDetails('${table.id}','${col.id}',${idx}, true)" class="text-xs bg-yellow-50 border border-yellow-300 text-yellow-700 px-1 py-0.5 rounded shadow-sm hover:bg-yellow-100">設定</button></div>`;
                    } else { critHtml += `<div class="${cls} justify-center text-gray-300">-</div>`; }

                    let badge = r.status === 'Profiling' ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded flex items-center"><i class="fas fa-spinner fa-spin mr-1"></i>剖析中</span>' : (r.status === 'Completed' ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center"><i class="fas fa-check-circle mr-1"></i>完成</span>' : '-');
                    statHtml += `<div class="${cls} justify-center">${badge}</div>`;
                    scanHtml += `<div class="${cls} text-xs text-gray-500 justify-end truncate" title="${r.scanInfo}">${r.status === 'Completed' ? r.scanInfo : '-'}</div>`;
                    taskHtml += `<div class="${cls} text-xs text-purple-600 justify-center">Daily DQ</div>`;
                    rTimeHtml += `<div class="${cls} text-xs text-gray-400 justify-center">${r.ruleTime ? r.ruleTime.split(' ')[1] : '-'}</div>`;
                    pTimeHtml += `<div class="${cls} text-xs text-gray-400 justify-center">${r.profileTime && r.profileTime !== '-' ? r.profileTime.split(' ')[1] : '-'}</div>`;
                });
            }

            // --- FILTERING LOGIC ---
            // 1. Rule Status Filter
            const ruleFilter = document.getElementById('rule-filter-select') ? document.getElementById('rule-filter-select').value : 'all';
            let ruleMatch = true;

            if (ruleFilter !== 'all') {
                if (ruleFilter === 'has_rule') {
                    if (col.rules.length === 0) ruleMatch = false;
                } else if (ruleFilter === 'no_rule') {
                    if (col.rules.length > 0) ruleMatch = false;
                } else {
                    // Specific Rule Type
                    if (!col.rules.some(r => r.id === ruleFilter)) ruleMatch = false;
                }
            }
            if (!ruleMatch) return; // Skip this column

            // 2. Task Status Filter (Mock - keep existing "all" behavior if not implemented, or simple check)
            // For now, only Rule Filter was requested to be robust.
            // ------------------------

            const tr = document.createElement('tr');
            tr.className = 'column-row bg-white border-b border-gray-100';
            tr.innerHTML = `
                <td class="text-center align-top pt-3"><input type="checkbox" class="col-check text-blue-600 rounded w-4 h-4" data-tid="${table.id}" value="${col.id}"></td>
                <td class="align-top pt-3 font-medium truncate" title="${col.name}">${col.name}</td>
                <td class="align-top pt-3 text-xs text-gray-500">${col.type}</td>
                <td class="align-top pt-3 text-xs">${col.dept}</td> <td class="align-top pt-3 text-xs">${col.class}</td>
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
    // Re-calc total since we might have skipped rows
    // Note: total passed to pag-total might be wrong if we just skip rendering.
    // For a prototype, updating the count based on rendered TRs is easier.
    // But here 'total' variable is incremented in the loop. We should only increment if we append.
    // Let's fix the total count logic.
    total = tbody.querySelectorAll('tr.column-row').length;
    document.getElementById('total-count').innerText = total;
    document.getElementById('pag-total').innerText = total;
    bindCheckboxEvents();
}

function toggleTableSelect(cb, tid) {
    document.querySelectorAll(`.col-check[data-tid="${tid}"]`).forEach(c => c.checked = cb.checked);
    updateBtnState();
}

function bindCheckboxEvents() {
    document.querySelectorAll('.col-check').forEach(cb => { cb.addEventListener('change', updateBtnState); });
    document.getElementById('check-all').addEventListener('change', (e) => {
        document.querySelectorAll('.col-check').forEach(c => c.checked = e.target.checked);
        document.querySelectorAll('.col-check')[0]?.dispatchEvent(new Event('change'));
    });
}

function updateBtnState() {
    const cnt = document.querySelectorAll('.col-check:checked').length;
    document.getElementById('selected-count').innerText = cnt;
    document.getElementById('btn-apply-rules').disabled = cnt === 0;
}

// --- Wizard Logic ---
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
window.toggleRule = function (el) {
    const cb = el.querySelector('.rule-check'); const p = el.querySelector('.rule-params');
    cb.checked = !cb.checked;
    if (cb.checked) { el.classList.add('selected'); p.classList.remove('hidden'); } else { el.classList.remove('selected'); p.classList.add('hidden'); }
}
window.testIndividualRule = function (e) { e.stopPropagation(); const btn = e.target; btn.innerHTML = 'Testing...'; setTimeout(() => { btn.innerHTML = '✔ 通過' }, 600); }

function updateWizard() {
    document.getElementById('step-1').classList.toggle('hidden', currentStep !== 1);
    document.getElementById('step-2').classList.toggle('hidden', currentStep !== 2);
    document.getElementById('btn-wiz-prev').disabled = currentStep === 1;

    const s1 = document.querySelector('[data-step="1"] .step-indicator'), s2 = document.querySelector('[data-step="2"] .step-indicator');
    if (currentStep === 1) {
        s1.className = 'step-indicator bg-blue-600 text-white'; s2.className = 'step-indicator bg-gray-200 text-gray-500';
        document.getElementById('btn-wiz-next').classList.remove('hidden'); document.getElementById('btn-wiz-run').classList.add('hidden');
    } else {
        s1.className = 'step-indicator bg-green-500 text-white'; s2.className = 'step-indicator bg-blue-600 text-white';
        document.getElementById('btn-wiz-next').classList.add('hidden'); document.getElementById('btn-wiz-run').classList.remove('hidden');
        document.getElementById('btn-wiz-next').classList.add('hidden'); document.getElementById('btn-wiz-run').classList.remove('hidden');

        // REQ: Detailed Summary Display
        const summaryDiv = document.getElementById('selected-rules-summary');
        if (selectedRules.length > 0) {
            summaryDiv.innerHTML = selectedRules.map(r => `
                <div class="mb-2 pb-2 border-b last:border-0 last:mb-0 last:pb-0">
                    <div class="font-bold text-gray-800">${r.name}</div>
                    <div class="text-xs text-gray-500 pl-4 mt-1">${r.paramSummary || 'No parameters'}</div>
                </div>
            `).join('');
            summaryDiv.classList.remove('hidden');
        } else {
            summaryDiv.classList.add('hidden');
        }

        const ss = document.getElementById('w-scope'), si = document.getElementById('w-scope-val');
        ss.onchange = () => { if (ss.value === 'full') si.classList.add('hidden'); else { si.classList.remove('hidden'); si.placeholder = ss.value === 'percent' ? '輸入百分比' : '輸入筆數'; } };
    }
}
document.getElementById('btn-wiz-next').onclick = () => {
    const checks = document.querySelectorAll('.rule-check:checked');
    if (checks.length === 0) return alert('請選擇規則');
    selectedRules = Array.from(checks).map(c => {
        const def = ruleDefs.find(d => d.id === c.value);
        // Find the specific card element to scope parameter search
        const card = c.closest('.rule-card');
        const summary = captureRuleParams(def.id, card);
        return { ...def, paramSummary: summary };
    });
    currentStep = 2; updateWizard();
}
document.getElementById('btn-wiz-prev').onclick = () => { currentStep--; updateWizard(); }

document.getElementById('btn-wiz-run').onclick = () => {
    const now = new Date().toLocaleString('zh-TW', { hour12: false });
    const scope = document.getElementById('w-scope').value;
    const scopeVal = document.getElementById('w-scope-val').value;

    document.querySelectorAll('.col-check:checked').forEach(cb => {
        const t = mockData.find(d => d.id === cb.dataset.tid);
        const c = t.columns.find(x => x.id === cb.value);

        let scanInfoStr = '';
        if (scope === 'full') {
            scanInfoStr = `${t.rowCount.toLocaleString()} (Full)`;
        } else if (scope === 'percent') {
            const pct = parseInt(scopeVal) || 0;
            const cnt = Math.floor(t.rowCount * (pct / 100));
            scanInfoStr = `${cnt.toLocaleString()} (Sample ${pct}%)`;
        } else {
            const cnt = parseInt(scopeVal) || 0;
            scanInfoStr = `${cnt.toLocaleString()} (Sample Rows)`;
        }

        selectedRules.forEach(r => {
            if (!c.rules.some(e => e.id === r.id)) {
                // Capture params (mock) - in real app, we'd read inputs from the rule card
                const params = {};
                c.rules.push({
                    id: r.id,
                    name: r.name,
                    status: 'Profiling',
                    scanInfo: scanInfoStr,
                    scope: scope,
                    scopeVal: scopeVal,
                    where: document.getElementById('w-where').value,
                    params: params,
                    ruleTime: now,
                    profileTime: '-',
                    baseline: null,
                    criteria: null,
                    tolerance: 0
                });
                simulateProfiling(c, c.rules.length - 1);
            }
        });
    });
    closeWizard(); renderTable();
}

function simulateProfiling(col, idx) {
    setTimeout(() => {
        const r = col.rules[idx];
        if (r) {
            r.status = 'Completed';
            r.baseline = (Math.random() * 15 + 85).toFixed(2) + '%';
            r.profileTime = new Date().toLocaleString('zh-TW', { hour12: false });
            renderTable();
        }
    }, 3000);
}

// --- Detail / Rigorous Edit (REQ 4: Integrated Flow) ---
// --- Detail / Rigorous Edit (REQ 4: Integrated Flow) ---
window.showRuleDetails = function (tid, cid, idx, autoEdit = false) {
    console.log('showRuleDetails called', tid, cid, idx, autoEdit);
    editTarget = { tid, cid, idx };
    const table = mockData.find(t => t.id === tid);
    if (!table) return console.error('Table not found', tid);
    const col = table.columns.find(c => c.id === cid);
    if (!col) return console.error('Column not found', cid);
    const r = col.rules[idx];
    if (!r) return console.error('Rule not found', idx);

    document.getElementById('detail-title').innerText = r.name;

    let viewHTML = `<ul class="text-sm text-gray-600 space-y-2">
        <li><strong>執行範圍:</strong> ${r.scanInfo}</li>
        <li><strong>Where條件:</strong> ${r.where || '(無)'}</li>
        <li><strong>Baseline:</strong> ${r.baseline || '-'}</li>
        <li><strong>標準:</strong> ${r.criteria || '-'}</li>
        <li><strong>容忍值:</strong> ${r.tolerance || '0'}%</li>
    </ul>`;
    document.getElementById('view-mode-content').innerHTML = viewHTML;

    document.getElementById('view-mode-content').classList.remove('hidden');
    document.getElementById('edit-mode-content').classList.add('hidden');
    document.getElementById('badge-edit').classList.add('hidden');
    document.getElementById('btn-close').classList.remove('hidden');
    document.getElementById('btn-edit').classList.remove('hidden');
    document.getElementById('btn-save').classList.add('hidden');
    document.getElementById('btn-del').classList.add('hidden');
    document.getElementById('post-run-area').classList.add('hidden');

    document.getElementById('detail-modal').classList.add('open');

    // If opened from "Setting" button, jump to edit mode directly
    if (autoEdit) enableEdit(true);
}

function enableEdit(isCriteriaSet = false) {
    document.getElementById('view-mode-content').classList.add('hidden');
    document.getElementById('edit-mode-content').classList.remove('hidden');
    document.getElementById('badge-edit').classList.remove('hidden');
    document.getElementById('btn-edit').classList.add('hidden');

    // Hide delete button in "Settings" mode (isCriteriaSet=true)
    if (isCriteriaSet) {
        document.getElementById('btn-del').classList.add('hidden');
    } else {
        document.getElementById('btn-del').classList.remove('hidden');
    }

    const r = mockData.find(t => t.id === editTarget.tid).columns.find(c => c.id === editTarget.cid).rules[editTarget.idx];
    const def = ruleDefs.find(d => d.id === r.id);

    let editHtml = `
        <div class="mb-3">
            <label class="block text-xs font-bold text-gray-700 mb-1">執行範圍 (Scope)</label>
            <div class="flex gap-2">
                <select id="e-scope" class="border rounded px-2 py-1 w-1/2 text-sm" onchange="toggleEditScope()">
                    <option value="full" ${r.scope === 'full' ? 'selected' : ''}>全量檢查</option>
                    <option value="percent" ${r.scope === 'percent' ? 'selected' : ''}>抽樣 %</option>
                    <option value="rows" ${r.scope === 'rows' ? 'selected' : ''}>抽樣 Rows</option>
                </select>
                <input type="number" id="e-scope-val" class="border rounded px-2 py-1 w-1/2 text-sm ${r.scope === 'full' ? 'hidden' : ''}" value="${r.scopeVal || ''}" placeholder="數值">
            </div>
        </div>
        <div class="mb-3">
            <label class="block text-xs font-bold text-gray-700 mb-1">資料過濾 (Where)</label>
            <input type="text" id="e-where" class="border rounded px-2 py-1 w-full text-sm" value="${r.where || ''}" placeholder="STATUS='A'">
        </div>
        <div class="mb-3">
            <label class="block text-xs font-bold text-gray-700 mb-1">規則參數</label>
            <div class="bg-white p-2 border rounded">${def ? def.html : 'Params...'}</div>
        </div>
    `;
    // REQ: When clicking "Settings", only show the Quality Standard settings, hide other edit inputs
    if (isCriteriaSet) {
        document.getElementById('edit-inputs').classList.add('hidden');
    } else {
        document.getElementById('edit-inputs').classList.remove('hidden');
    }

    document.getElementById('edit-inputs').innerHTML = editHtml;
    window.toggleEditScope = function () {
        const s = document.getElementById('e-scope').value;
        const v = document.getElementById('e-scope-val');
        if (s === 'full') v.classList.add('hidden');
        else { v.classList.remove('hidden'); v.placeholder = s === 'percent' ? '%' : 'Rows'; }
    }

    // If we have baseline (Completed) and just want to adjust criteria
    if (r.status === 'Completed' && r.baseline) {
        // If "Settings" mode (isCriteriaSet is true), we hide the re-run button too as requested "only content is..."
        if (isCriteriaSet) {
            document.getElementById('btn-rerun').classList.add('hidden');
        } else {
            document.getElementById('btn-rerun').classList.remove('hidden');
            document.getElementById('btn-rerun').innerHTML = '<i class="fas fa-sync-alt mr-1"></i> 重新剖析 (若修改了參數)';
        }

        // Show setting area immediately ONLY if in Settings mode
        if (isCriteriaSet) {
            document.getElementById('post-run-area').classList.remove('hidden');
            document.getElementById('btn-save').classList.remove('hidden');
        } else {
            document.getElementById('post-run-area').classList.add('hidden');
            document.getElementById('btn-save').classList.add('hidden');
        }
        document.getElementById('e-base').value = r.baseline;
        const tol = document.getElementById('e-tol');
        tol.value = r.tolerance || 0;

        // REQ: Formula is Baseline + Tolerance = New Standard
        tol.oninput = () => {
            const baseVal = parseFloat(r.baseline) || 0;
            const tolVal = parseFloat(tol.value) || 0;
            const newVal = (baseVal + tolVal).toFixed(2);
            document.getElementById('e-crit').value = '> ' + newVal + '%';
        };
        tol.dispatchEvent(new Event('input'));
    } else {
        document.getElementById('btn-rerun').classList.remove('hidden');
        document.getElementById('btn-rerun').innerHTML = '<i class="fas fa-play mr-1"></i> 執行重算';
        document.getElementById('btn-save').classList.add('hidden');
        document.getElementById('post-run-area').classList.add('hidden');
    }
}

function executeInEditMode() {
    const btn = document.getElementById('btn-rerun');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 啟動中...';

    // Update Rule Settings
    const col = mockData.find(t => t.id === editTarget.tid).columns.find(c => c.id === editTarget.cid);
    const r = col.rules[editTarget.idx];
    const t = mockData.find(d => d.id === editTarget.tid);

    r.scope = document.getElementById('e-scope').value;
    r.scopeVal = document.getElementById('e-scope-val').value;
    r.where = document.getElementById('e-where').value;

    // Update Scan Info String
    if (r.scope === 'full') {
        r.scanInfo = `${t.rowCount.toLocaleString()} (Full)`;
    } else if (r.scope === 'percent') {
        const pct = parseInt(r.scopeVal) || 0;
        const cnt = Math.floor(t.rowCount * (pct / 100));
        r.scanInfo = `${cnt.toLocaleString()} (Sample ${pct}%)`;
    } else {
        const cnt = parseInt(r.scopeVal) || 0;
        r.scanInfo = `${cnt.toLocaleString()} (Sample Rows)`;
    }

    r.status = 'Profiling';
    r.baseline = null; // Reset baseline
    r.profileTime = '-';

    setTimeout(() => {
        closeDetailModal();
        renderTable();
        simulateProfiling(col, editTarget.idx);
    }, 500);
}

function saveEditAndRun() {
    const now = new Date().toLocaleString('zh-TW', { hour12: false });
    const col = mockData.find(t => t.id === editTarget.tid).columns.find(c => c.id === editTarget.cid);
    const r = col.rules[editTarget.idx];

    // Check if just criteria update or full rerun needed (Simplified for proto: assume saved means updated)
    r.baseline = document.getElementById('e-base').value;
    r.tolerance = document.getElementById('e-tol').value;
    r.criteria = document.getElementById('e-crit').value;
    r.ruleTime = now;
    // If baseline changed (re-run happened), update profile time
    // simplified logic here

    closeDetailModal(); renderTable();
}

function deleteRule() {
    if (!confirm("移除?")) return;
    const c = mockData.find(t => t.id === editTarget.tid).columns.find(c => c.id === editTarget.cid);
    c.rules.splice(editTarget.idx, 1);
    closeDetailModal(); renderTable();
}

function closeDetailModal() { document.getElementById('detail-modal').classList.remove('open'); }
function closeDetailModal() { document.getElementById('detail-modal').classList.remove('open'); }
function captureRuleParams(rid, container) {
    // Logic to scrape inputs from the container
    let summaryParts = [];

    // 1. Checkboxes (e.g., Null, Blank, Zero)
    // Looking for labels that have checked checkboxes
    const labels = container.querySelectorAll('label');
    labels.forEach(l => {
        const inp = l.querySelector('input[type="checkbox"]');
        if (inp && inp.checked) {
            summaryParts.push(l.innerText.trim());
        }
    });

    // 2. Selects (e.g. Date format)
    const selects = container.querySelectorAll('select');
    selects.forEach(s => {
        if (s.value) summaryParts.push(s.value);
    });

    // 3. Inputs (number/text) - excluding checkbox inputs which we handled
    // We should be careful not to grab the "Test" button or irrelevant inputs if any
    const inputs = container.querySelectorAll('input:not([type="checkbox"])');
    inputs.forEach(i => {
        if (i.value) {
            // Try to find a preceding label or placeholder to make it 
            // readable? For now just the value is often enough or "Min: 0"
            // Let's use placeholder as key if available
            const ph = i.placeholder || '';
            summaryParts.push(ph ? `${ph}: ${i.value}` : i.value);
        }
    });

    // 4. Custom SQL Textarea
    const textareas = container.querySelectorAll('textarea');
    textareas.forEach(t => {
        if (t.value) summaryParts.push(`SQL: ${t.value.substring(0, 20)}...`);
    });

    return summaryParts.join(', ');
}

/* --- Navigation --- */
const views = { list: document.getElementById('task-list-view'), detail: document.getElementById('task-detail-view'), history: document.getElementById('history-view'), edit: document.getElementById('task-edit-view') };
function hideAll() { Object.values(views).forEach(v => v.classList.add('hidden')); }
function showTaskListView() { hideAll(); views.list.classList.remove('hidden'); }
function showTaskDetailView(n) { hideAll(); views.detail.classList.remove('hidden'); document.getElementById('detail-title').innerText = n; renderDetailAssets(); }
function showTaskEditView(isEdit, name) {
    hideAll(); views.edit.classList.remove('hidden');
    document.getElementById('task-edit-title').innerText = isEdit ? '編輯任務' : '新增任務';
    document.getElementById('task-name-input').value = isEdit ? name : '';
    const container = document.getElementById('selected-assets-container');
    if (isEdit) {
        renderGroupedAssets(container, [
            { domain: 'Customer', tbl: 'CUST_MASTER', cols: [{ name: 'ID_NUM', scope: '全量', sql: '' }, { name: 'EMAIL', scope: '全量', sql: '' }] },
            { domain: 'Sales', tbl: 'SALES_TXN', cols: [{ name: 'AMOUNT', scope: '抽樣', sql: '' }] }
        ]);
    } else {
        container.innerHTML = '<div class="p-8 text-center text-gray-400 text-sm italic border border-dashed border-gray-300 rounded-lg bg-white">尚未選擇任何資產...</div>';
    }
}
function showHistoryView(n) {
    hideAll(); views.history.classList.remove('hidden');
    document.getElementById('history-title').innerText = n + ' - 執行紀錄';
    renderHistoryTable();
}

/* --- Logic: Detail Render --- */
function renderDetailAssets() {
    const c = document.getElementById('detail-assets-container'); c.innerHTML = '';
    const data = [
        {
            domain: "Customer", tbl: "CUST_MASTER", cols: [
                { name: "ID_NUM", dept: "資訊部", class: "ID", sens: "PII", rule: "Format", bl: "100%", std: "> 99%" },
                { name: "ID_NUM", dept: "資訊部", class: "ID", sens: "PII", rule: "Completeness", bl: "98.5%", std: "> 98%" },
                { name: "EMAIL", dept: "業務部", class: "Email", sens: "PII", rule: "Format", bl: "98%", std: "> 95%" }
            ]
        },
        {
            domain: "Sales", tbl: "SALES_TXN", cols: [
                { name: "AMOUNT", dept: "財務部", class: "Amt", sens: "Conf", rule: "Range", bl: "0 Err", std: "0 Err" }
            ]
        }
    ];

    data.forEach((g, i) => {
        const uid = `d-acc-${i}`;
        // Grouping
        let grouped = {};
        g.cols.forEach(col => { if (!grouped[col.name]) grouped[col.name] = []; grouped[col.name].push(col); });

        let rowsHtml = '';
        Object.keys(grouped).forEach(name => {
            const group = grouped[name];
            group.forEach((item, idx) => {
                rowsHtml += '<tr>';
                if (idx === 0) {
                    const rs = group.length > 1 ? ` rowspan="${group.length}"` : '';
                    // Merged cells
                    rowsHtml += `<td class="px-4 py-3 font-medium bg-white align-top border-b border-gray-100"${rs}>${item.name}</td>`;
                    rowsHtml += `<td class="px-4 py-3 bg-white align-top border-b border-gray-100"${rs}>${item.dept}</td>`;
                    rowsHtml += `<td class="px-4 py-3 bg-white align-top border-b border-gray-100"${rs}>${item.class}</td>`;
                    rowsHtml += `<td class="px-4 py-3 bg-white align-top border-b border-gray-100"${rs}>${item.sens}</td>`;
                }
                // Per-rule cells
                rowsHtml += `<td class="px-4 py-3 border-b border-gray-100 bg-white">${item.rule}</td>`;
                rowsHtml += `<td class="px-4 py-3 border-b border-gray-100 bg-white">${item.bl}</td>`;
                rowsHtml += `<td class="px-4 py-3 border-b border-gray-100 bg-white">${item.std}</td>`;
                rowsHtml += '</tr>';
            });
        });

        c.innerHTML += `<div class="bg-white border rounded overflow-hidden"><div class="px-4 py-3 bg-gray-50 border-b flex justify-between cursor-pointer hover:bg-gray-100" onclick="toggleAccordion('${uid}')"><span class="font-bold text-gray-800 text-sm">${g.domain} - ${g.tbl}</span><svg id="icon-${uid}" class="w-4 h-4 text-gray-500 transform rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div><div id="content-${uid}"><table class="min-w-full text-sm text-left divide-y divide-gray-200"><thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase"><tr><th class="px-4 py-2">欄位名稱</th><th class="px-4 py-2">權責部門</th><th class="px-4 py-2">Data Class</th><th class="px-4 py-2">敏感性</th><th class="px-4 py-2">規則</th><th class="px-4 py-2">基準線</th><th class="px-4 py-2">通過標準</th></tr></thead><tbody class="divide-y divide-gray-100 bg-white">${rowsHtml}</tbody></table></div></div>`;
    });
}

/* --- Logic: History Render --- */
const mockHistory = [
    { id: "r1", d: "2025-05-20", s: "13:00", e: "13:04", st: "Success", res: "Pass", err: "-", tables: [{ domain: "Customer", name: "CUST_MASTER", cols: [{ name: "ID_NUM", rule: "Format", bl: "100%", std: "> 99%", exec_st: "Success", res: "Passing" }, { name: "ID_NUM", rule: "Completeness", bl: "98.5%", std: "> 98%", exec_st: "Success", res: "Passing" }] }] },
    { id: "r2", d: "2025-05-19", s: "13:00", e: "13:04", st: "Success", res: "Pass", err: "-", tables: [{ domain: "Customer", name: "CUST_MASTER", cols: [{ name: "ID_NUM", rule: "Format", bl: "100%", std: "> 99%", exec_st: "Success", res: "Passing" }] }, { domain: "Sales", name: "SALES_TXN", cols: [{ name: "AMOUNT", rule: "Range", bl: "0 Err", std: "0 Err", exec_st: "Success", res: "Passing" }] }] }
];
function renderHistoryTable() {
    const t = document.getElementById('execution-history-list'); t.innerHTML = '';
    mockHistory.forEach((run, i) => {
        const rid = `run-${i}`;
        t.innerHTML += `<tr class="hover:bg-gray-50 cursor-pointer" onclick="toggleHistoryRow('${rid}')"><td class="px-6 py-4"><svg id="icon-${rid}" class="w-4 h-4 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></td><td class="px-6 py-4 text-sm">${run.d}</td><td class="px-6 py-4 text-sm">${run.s}</td><td class="px-6 py-4 text-sm">${run.e}</td><td class="px-6 py-4"><span class="px-2 rounded text-xs font-semibold bg-green-100 text-green-800">${run.st}</span></td><td class="px-6 py-4"><span class="px-2 rounded text-xs font-semibold bg-blue-100 text-blue-800">${run.res}</span></td><td class="px-6 py-4 text-sm text-gray-400">${run.err}</td></tr><tr id="content-${rid}" class="hidden bg-gray-50"><td colspan="7" class="p-4"><div class="ml-4 border-l-2 border-gray-200 pl-4 space-y-3">${run.tables.map((tb, ti) => {
            const tid = `${rid}-t-${ti}`;
            // Group logic
            let grouped = {};
            tb.cols.forEach(c => { if (!grouped[c.name]) grouped[c.name] = []; grouped[c.name].push(c); });
            let rowsHtml = '';
            Object.keys(grouped).forEach(name => {
                const group = grouped[name];
                group.forEach((c, idx) => {
                    rowsHtml += `<tr class="hover:bg-blue-50 cursor-pointer" onclick="showHistoryChart('${c.name}')">`;
                    if (idx === 0) rowsHtml += `<td class="px-4 py-2 bg-white font-medium align-middle border-r border-gray-100" rowspan="${group.length}">${name}</td>`;
                    rowsHtml += `<td class="px-4 py-2">${c.rule}</td><td class="px-4 py-2">${c.bl}</td><td class="px-4 py-2">${c.std}</td><td class="px-4 py-2"><span class="px-2 rounded bg-green-100 text-green-800">${c.exec_st}</span></td><td class="px-4 py-2"><span class="px-2 rounded bg-blue-100 text-blue-800">${c.res}</span></td><td class="px-4 py-2 text-blue-600 underline">圖表</td></tr>`;
                });
            });
            return `<div class="bg-white border rounded shadow-sm overflow-hidden"><div class="px-4 py-2 bg-gray-100 flex justify-between cursor-pointer hover:bg-gray-200" onclick="toggleInnerTable('${tid}')"><div class="font-bold text-sm text-gray-800">${tb.domain} - ${tb.name}</div><svg id="icon-${tid}" class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></div><div id="content-${tid}" class="hidden"><table class="min-w-full text-xs text-left"><thead class="bg-gray-50"><tr><th class="px-4 py-2">欄位</th><th class="px-4 py-2">規則</th><th class="px-4 py-2">Baseline</th><th class="px-4 py-2">通過標準</th><th class="px-4 py-2">執行狀態</th><th class="px-4 py-2">執行結果</th><th class="px-4 py-2">趨勢</th></tr></thead><tbody>${rowsHtml}</tbody></table></div></div>`;
        }).join('')}</div></td></tr>`;
    });
}
function toggleHistoryRow(id) { const c = document.getElementById(`content-${id}`); const i = document.getElementById(`icon-${id}`); if (c.classList.contains('hidden')) { c.classList.remove('hidden'); c.style.display = 'table-row'; i.classList.add('rotate-90'); } else { c.classList.add('hidden'); c.style.display = 'none'; i.classList.remove('rotate-90'); } }
function toggleInnerTable(id) { const c = document.getElementById(`content-${id}`); const i = document.getElementById(`icon-${id}`); if (c.classList.contains('hidden')) { c.classList.remove('hidden'); i.style.transform = 'rotate(180deg)'; } else { c.classList.add('hidden'); i.style.transform = 'rotate(0deg)'; } }
function toggleAccordion(id) { document.getElementById(`content-${id}`).classList.toggle('hidden'); document.getElementById(`icon-${id}`).classList.toggle('rotate-180'); }

/* --- Logic: Asset & Config --- */
function openAssetSelectModal() { document.getElementById('asset-select-modal').classList.add('flex'); document.getElementById('modal-empty-state').classList.remove('hidden'); document.getElementById('modal-results-container').classList.add('hidden'); }
function closeAssetSelectModal() { document.getElementById('asset-select-modal').classList.remove('flex'); }
function applyAssetFilters() {
    document.getElementById('modal-empty-state').classList.add('hidden'); document.getElementById('modal-results-container').classList.remove('hidden');
    document.getElementById('asset-accordion-list').innerHTML = `
    <div class="bg-white border rounded mb-2"><div class="bg-gray-50 px-4 py-2 flex justify-between cursor-pointer" onclick="toggleAccordion('am-1')"><div class="flex items-center"><input type="checkbox" class="mr-2 tbl-cb" onclick="event.stopPropagation();toggleTableSelect('am-1',this)"><span class="font-bold text-sm">Customer - CUST_MASTER</span></div><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div><div id="content-am-1"><table class="w-full text-sm text-left"><thead class="bg-gray-50 border-b"><tr><th class="p-2 w-8"></th><th>欄位</th><th>Type</th><th>權責單位</th><th>Class</th><th>敏感性</th><th>規則</th><th>Baseline</th><th>通過標準</th></tr></thead><tbody><tr><td class="p-2 text-center"><input type="checkbox" class="col-cb" data-tbl="CUST_MASTER" data-domain="Customer" data-col="ID_NUM" onclick="updateCnt()"></td><td>ID_NUM</td><td>VARCHAR</td><td>資訊部</td><td>ID</td><td>PII</td><td>Format</td><td>100%</td><td>100%</td></tr><tr><td class="px-2 text-center align-bottom" rowspan="2"><input type="checkbox" class="col-cb" data-tbl="CUST_MASTER" data-domain="Customer" data-col="EMAIL" onclick="updateCnt()"></td><td rowspan="2" class="align-bottom">EMAIL</td><td rowspan="2" class="align-bottom">VARCHAR</td><td rowspan="2" class="align-bottom">業務部</td><td rowspan="2" class="align-bottom">Email</td><td rowspan="2" class="align-bottom">PII</td><td>Format</td><td>98%</td><td>95%</td></tr><tr><td>Null</td><td>0%</td><td>0%</td></tr></tbody></table></div></div>
    <div class="bg-white border rounded"><div class="bg-gray-50 px-4 py-2 flex justify-between cursor-pointer" onclick="toggleAccordion('am-2')"><div class="flex items-center"><input type="checkbox" class="mr-2 tbl-cb" onclick="event.stopPropagation();toggleTableSelect('am-2',this)"><span class="font-bold text-sm">Sales - SALES_TXN</span></div><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div><div id="content-am-2"><table class="w-full text-sm text-left"><thead class="bg-gray-50 border-b"><tr><th class="p-2 w-8"></th><th>欄位</th><th>Type</th><th>權責單位</th><th>Class</th><th>敏感性</th><th>規則</th><th>Baseline</th><th>通過標準</th></tr></thead><tbody><tr><td class="p-2 text-center"><input type="checkbox" class="col-cb" data-tbl="SALES_TXN" data-domain="Sales" data-col="TXN_ID" onclick="updateCnt()"></td><td>TXN_ID</td><td>VARCHAR</td><td>資訊部</td><td>ID</td><td>Gen</td><td>Null</td><td>0%</td><td>0%</td></tr><tr><td class="p-2 text-center"><input type="checkbox" class="col-cb" data-tbl="SALES_TXN" data-domain="Sales" data-col="AMOUNT" onclick="updateCnt()"></td><td>AMOUNT</td><td>DECIMAL</td><td>財務部</td><td>Amt</td><td>Conf</td><td>Range</td><td>0 Errs</td><td>0 Errs</td></tr></tbody></table></div></div>`;
}
function toggleAllAssets(cb) { document.querySelectorAll('.col-cb, .tbl-cb').forEach(c => c.checked = cb.checked); updateCnt(); }
function toggleTableSelect(id, cb) { document.getElementById(`content-${id}`).querySelectorAll('.col-cb').forEach(c => c.checked = cb.checked); updateCnt(); }
function updateCnt() { document.getElementById('total-asset-count').innerText = document.querySelectorAll('.col-cb:checked').length; }
function confirmAssetSelection() {
    const cbs = document.querySelectorAll('.col-cb:checked'); if (cbs.length === 0) return alert('請選擇');
    const g = {}; cbs.forEach(c => { const t = c.dataset.tbl, d = c.dataset.domain, n = c.dataset.col; if (!g[t]) g[t] = { domain: d, cols: [] }; g[t].cols.push({ name: n, scope: '未設定', sql: '' }); });
    renderGroupedAssets(document.getElementById('selected-assets-container'), Object.keys(g).map(k => ({ tbl: k, domain: g[k].domain, cols: g[k].cols })));
    closeAssetSelectModal();
}
function renderGroupedAssets(c, d) { c.innerHTML = ''; d.forEach((g, i) => { const id = `ed-${i}`; c.innerHTML += `<div class="bg-white border rounded overflow-hidden" id="${id}"><div class="bg-gray-50 px-4 py-2 flex justify-between cursor-pointer" onclick="toggleAccordion('${id}')"><div class="flex items-center"><svg id="icon-${id}" class="w-4 h-4 text-gray-500 mr-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg><span class="font-bold text-sm">${g.domain} - ${g.tbl}</span><span class="ml-2 text-xs bg-blue-100 text-blue-700 px-2 rounded-full">${g.cols.length} 欄位</span></div><button onclick="event.stopPropagation();openConfigModal('${id}','${g.tbl}')" class="text-xs bg-blue-500 text-white px-2 py-1 rounded">統一設定</button></div><div id="content-${id}" class="hidden p-2">${g.cols.map(col => `<div class="flex justify-between py-2 border-b px-2"><div class="text-sm">${col.name} <div class="text-xs mt-1 config-status">${col.scope === '未設定' ? '<span class="config-tag-gray">未設定</span>' : `<span class="config-tag">${col.scope}</span>`} ${col.sql ? '<span class="config-tag">SQL</span>' : ''}</div></div></div>`).join('')}</div></div>`; }); }

/* --- Configuration --- */
let cfgId = '';
function openConfigModal(id, name) { cfgId = id; document.getElementById('column-config-modal').classList.add('flex'); document.getElementById('config-modal-subtitle').innerText = `統一設定：${name}`; }
function closeConfigModal() { document.getElementById('column-config-modal').classList.remove('flex'); }
function toggleSamplingInputs() { document.getElementById('sampling-options').classList.toggle('hidden', document.querySelector('input[name="config-scope"]:checked').value !== 'sample'); }
function toggleSqlHelp() { document.getElementById('sql-help-box').classList.toggle('active'); }
function saveConfig() {
    const scp = document.querySelector('input[name="config-scope"]:checked').value === 'full' ? '全量' : '抽樣';
    const sql = document.getElementById('config-sql-where').value;
    document.getElementById(cfgId).querySelectorAll('.config-status').forEach(el => el.innerHTML = `<span class="config-tag">${scp}</span> ${sql ? '<span class="config-tag" title="' + sql + '">SQL</span>' : ''}`);
    document.getElementById(`content-${cfgId}`).classList.remove('hidden');
    document.getElementById(`icon-${cfgId}`).classList.add('rotate-180');
    closeConfigModal();
}
function toggleMonthlyMode(m) { document.getElementById('monthly-date-input').classList.toggle('hidden', m !== 'date'); document.getElementById('monthly-date-input').classList.toggle('flex', m === 'date'); document.getElementById('monthly-pattern-input').classList.toggle('hidden', m !== 'pattern'); document.getElementById('monthly-pattern-input').classList.toggle('flex', m === 'pattern'); }
document.querySelectorAll('input[name="schedule"]').forEach(r => r.addEventListener('change', e => { document.querySelectorAll('.schedule-sub-option').forEach(el => el.classList.remove('active')); document.getElementById(`opt-${e.target.value}`).classList.add('active'); }));

/* --- Chart Logic (Fixed Rendering) --- */
let myChart = null;
function showHistoryChart(title) {
    const modal = document.getElementById('history-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    document.getElementById('chart-modal-title').innerText = `${title} - 趨勢圖`;

    // Fix: Wait for DOM to settle (display:flex to apply) before rendering chart
    setTimeout(() => {
        const ctx = document.getElementById('historyChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['05/15', '05/16', '05/17', '05/18', '05/19', '05/20'],
                datasets: [
                    { label: 'Execution Result', data: [100, 98, 95, 99, 100, 96], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', tension: 0.4, fill: true },
                    { label: 'Standard', data: [95, 95, 95, 95, 95, 95], borderColor: '#10b981', borderDash: [2, 2], pointRadius: 0, fill: false },
                    { label: 'Baseline', data: [90, 90, 90, 90, 90, 90], borderColor: '#9ca3af', borderDash: [5, 5], pointRadius: 0, fill: false }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: false, min: 80, max: 105 } } }
        });
    }, 100); // Small delay is key
}
function closeHistoryModal() { document.getElementById('history-modal').classList.remove('flex'); document.getElementById('history-modal').classList.add('hidden'); }
window.onclick = function (e) { if (e.target.classList.contains('modal-backdrop')) e.target.classList.remove('flex'); }

// State management
const state = {
    selectedType: '',
    selectedCategories: ['全部'],
    searchQuery: '',
    includeSet: false,
    searchResults: [],
    selectedItems: [],
    currentPage: 1,
    pageSize: 10,
    expandedTables: {},
    recommendations: [],
    selectedRecommendations: {},
    viewMode: 'simple',
    expandedRecommendations: {},
    allCollapsed: false
};

// Mock data
const mockData = [
    {
        tableName: 'users',
        tableNameZh: '會員',
        tableTitle: '會員基本資料表',
        tableCategory: null,
        columns: [
            { id: 'col1', name: 'customer_email', nameZh: '客戶信箱', dataClass: null, sensitivity: null, terms: [] },
            { id: 'col2', name: 'user_phone', nameZh: '使用者電話', dataClass: null, sensitivity: null, terms: [] },
            { id: 'col3', name: 'user_name', nameZh: '使用者姓名', dataClass: 'Name', sensitivity: 'Internal', terms: ['客戶姓名'] }
        ]
    },
    {
        tableName: 'orders',
        tableNameZh: '訂單',
        tableTitle: '訂單交易記錄表',
        tableCategory: '財務',
        columns: [
            { id: 'col4', name: 'order_amount', nameZh: '訂單金額', dataClass: null, sensitivity: null, terms: [] },
            { id: 'col5', name: 'order_date', nameZh: '訂單日期', dataClass: 'Date', sensitivity: null, terms: ['訂單日期'] }
        ]
    },
    {
        tableName: 'payments',
        tableNameZh: '支付',
        tableTitle: '支付交易資料表',
        tableCategory: null,
        columns: [
            { id: 'col6', name: 'payment_card_number', nameZh: '支付卡號', dataClass: null, sensitivity: null, terms: [] },
            { id: 'col7', name: 'payment_amount', nameZh: '支付金額', dataClass: null, sensitivity: null, terms: [] }
        ]
    }
];

// Mock recommendations data
const mockRecommendations = {
    category: [
        { name: '財務', nameEn: 'Finance', confidence: 92, description: '處理公司財務相關數據，包括收入、支出、預算等財務資訊' },
        { name: '客戶管理', nameEn: 'CRM', confidence: 85, description: '管理客戶關係、客戶資料及互動記錄' },
        { name: '銷售', nameEn: 'Sales', confidence: 78, description: '追蹤銷售活動、訂單及業績數據' }
    ],
    term: [
        { name: '客戶姓名', nameEn: 'Customer Name', confidence: 95, description: '用於標識客戶身份的姓名欄位，通常包含全名或姓氏' },
        { name: '用戶名稱', nameEn: 'User Name', confidence: 88, description: '系統用戶的顯示名稱，可能與真實姓名不同' },
        { name: '會員名稱', nameEn: 'Member Name', confidence: 82, description: '會員系統中使用的名稱欄位' }
    ],
    dataClass: [
        { name: 'Name', nameEn: 'Name', confidence: 94, fieldType: 'VARCHAR(100)', description: '姓名類別，包含個人或組織的名稱資訊' },
        { name: 'PersonName', nameEn: 'Person Name', confidence: 87, fieldType: 'VARCHAR(100)', description: '個人姓名類別，專門用於自然人姓名' },
        { name: 'FullName', nameEn: 'Full Name', confidence: 80, fieldType: 'VARCHAR(100)', description: '完整姓名類別，包含姓氏和名字的完整形式' }
    ],
    sensitivity: [
        { name: 'CTI', nameZh: '聯絡資訊', nameEn: 'Contact-Info', level: 'S1', confidence: 93, description: '包含個人聯絡方式的敏感資訊，如電話、地址、電子郵件等' },
        { name: 'PCD', nameZh: '支付卡資料', nameEn: 'Payment-Card-Data', level: 'S2', confidence: 86, description: '信用卡或支付卡相關的高度敏感資訊' },
        { name: 'AUTH', nameZh: '驗證資訊', nameEn: 'Auth-Credential', level: 'S1', confidence: 79, description: '用於身份驗證的敏感憑證資訊' }
    ]
};

// Initialize event listeners
function init() {
    // Tab switching
    document.getElementById('tab-search').addEventListener('click', () => {
        document.getElementById('tab-search').className = 'py-4 border-b-2 border-blue-600 text-blue-600 font-medium';
        document.getElementById('tab-history').className = 'py-4 border-b-2 border-transparent text-gray-500 font-medium';
        document.getElementById('content-search').classList.remove('hidden');
        document.getElementById('content-history').classList.add('hidden');
    });

    document.getElementById('tab-history').addEventListener('click', () => {
        document.getElementById('tab-history').className = 'py-4 border-b-2 border-blue-600 text-blue-600 font-medium';
        document.getElementById('tab-search').className = 'py-4 border-b-2 border-transparent text-gray-500 font-medium';
        document.getElementById('content-history').classList.remove('hidden');
        document.getElementById('content-search').classList.add('hidden');
    });

    // Recommendation type buttons
    document.getElementById('btn-category').addEventListener('click', () => selectType('category'));
    document.getElementById('btn-term').addEventListener('click', () => selectType('term'));
    document.getElementById('btn-dataClass').addEventListener('click', () => selectType('dataClass'));
    document.getElementById('btn-sensitivity').addEventListener('click', () => selectType('sensitivity'));

    // Category dropdown
    document.getElementById('category-btn').addEventListener('click', toggleCategoryDropdown);

    // Category checkboxes
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => handleCategoryChange(e.target));
    });

    // Search
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('include-set').addEventListener('change', handleSearch);

    // Pagination
    document.getElementById('prev-btn').addEventListener('click', prevPage);
    document.getElementById('next-btn').addEventListener('click', nextPage);
    document.getElementById('page-size').addEventListener('change', updatePageSize);
    document.getElementById('select-all-btn').addEventListener('click', selectAllInPage);

    // Execute recommendation
    document.getElementById('execute-btn').addEventListener('click', executeRecommendation);

    // Modal controls
    document.getElementById('view-mode-btn').addEventListener('click', toggleViewMode);
    document.getElementById('collapse-all-btn').addEventListener('click', collapseAll);
    document.getElementById('select-first-btn').addEventListener('click', selectAllFirst);
    document.getElementById('close-modal-btn').addEventListener('click', closeRecommendModal);
    document.getElementById('cancel-btn').addEventListener('click', closeRecommendModal);
    document.getElementById('preview-btn').addEventListener('click', previewRecommendations);
    document.getElementById('save-btn').addEventListener('click', saveRecommendations);
    document.getElementById('close-preview-btn').addEventListener('click', closePreviewModal);
    document.getElementById('save-from-preview-btn').addEventListener('click', saveRecommendations);
    document.getElementById('close-success-btn').addEventListener('click', closeSuccessModal);

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#category-dropdown') && !e.target.closest('#category-btn')) {
            document.getElementById('category-dropdown').classList.add('hidden');
        }
    });
}

// Select recommendation type
function selectType(type) {
    state.selectedType = type;
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.className = 'type-btn p-4 border-2 rounded-lg border-gray-200 hover:border-blue-400 transition';
    });
    document.getElementById(`btn-${type}`).className = 'type-btn p-4 border-2 rounded-lg border-blue-600 bg-blue-50';
    document.getElementById('search-btn').disabled = false;
    state.selectedItems = [];
    updateSelectedCount();
    handleSearch();
}

// Category dropdown
function toggleCategoryDropdown() {
    document.getElementById('category-dropdown').classList.toggle('hidden');
}

function handleCategoryChange(checkbox) {
    const value = checkbox.value;
    if (value === '全部') {
        if (checkbox.checked) {
            state.selectedCategories = ['全部'];
            document.querySelectorAll('.category-checkbox').forEach(cb => {
                cb.checked = cb.value === '全部';
            });
        }
    } else {
        if (checkbox.checked) {
            state.selectedCategories = state.selectedCategories.filter(c => c !== '全部');
            state.selectedCategories.push(value);
            document.querySelector('.category-checkbox[value="全部"]').checked = false;
        } else {
            state.selectedCategories = state.selectedCategories.filter(c => c !== value);
            if (state.selectedCategories.length === 0) {
                state.selectedCategories = ['全部'];
                document.querySelector('.category-checkbox[value="全部"]').checked = true;
            }
        }
    }
    document.getElementById('selected-categories').textContent = state.selectedCategories.join(', ');
}

// Search functionality
function handleSearch() {
    if (!state.selectedType) return;

    state.includeSet = document.getElementById('include-set').checked;
    state.searchQuery = document.getElementById('search-input').value;

    let filtered = JSON.parse(JSON.stringify(mockData));

    // Filter by category
    if (!state.selectedCategories.includes('全部')) {
        filtered = filtered.filter(t => state.selectedCategories.includes(t.tableCategory));
    }

    // Filter by set/unset status
    if (!state.includeSet) {
        filtered = filtered.map(table => {
            if (state.selectedType === 'category') {
                return table.tableCategory ? null : table;
            } else {
                const filteredColumns = table.columns.filter(col => {
                    if (state.selectedType === 'dataClass') return !col.dataClass;
                    if (state.selectedType === 'sensitivity') return !col.sensitivity;
                    if (state.selectedType === 'term') return col.terms.length === 0;
                    return true;
                });
                return filteredColumns.length > 0 ? { ...table, columns: filteredColumns } : null;
            }
        }).filter(Boolean);
    }

    // Filter by search query
    if (state.searchQuery) {
        filtered = filtered.filter(t =>
            t.tableName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            t.tableNameZh.includes(state.searchQuery)
        );
    }

    state.searchResults = filtered;
    state.currentPage = 1;
    state.selectedItems = [];

    // Auto expand for non-category types
    if (state.selectedType !== 'category') {
        state.expandedTables = {};
        filtered.forEach(table => {
            state.expandedTables[table.tableName] = true;
        });
    } else {
        state.expandedTables = {};
    }

    renderSearchResults();
    document.getElementById('search-results').classList.remove('hidden');
}

// Render search results
function renderSearchResults() {
    const container = document.getElementById('results-container');
    const startIdx = (state.currentPage - 1) * state.pageSize;
    const pageData = state.searchResults.slice(startIdx, startIdx + state.pageSize);

    container.innerHTML = '';

    pageData.forEach(table => {
        const isExpanded = state.expandedTables[table.tableName];
        const hasTableCheckbox = state.selectedType === 'category' && !table.tableCategory;
        const isTableSelected = state.selectedItems.some(i => i.id === table.tableName);

        const tableColumns = table.columns.filter(col => {
            if (state.selectedType === 'dataClass') return !col.dataClass;
            if (state.selectedType === 'sensitivity') return !col.sensitivity;
            if (state.selectedType === 'term') return col.terms.length === 0;
            return false;
        });
        const allColumnsSelected = tableColumns.length > 0 &&
            tableColumns.every(col => state.selectedItems.some(i => i.id === col.id));

        const tableDiv = document.createElement('div');
        tableDiv.className = 'border rounded-lg';
        tableDiv.innerHTML = `
          <div class="bg-gray-50 px-4 py-3 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button class="hover:bg-gray-200 rounded p-1 toggle-table-btn" data-table="${table.tableName}">
                <svg class="w-5 h-5 transition-transform ${isExpanded ? '' : '-rotate-90'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              ${hasTableCheckbox ? `
                <input type="checkbox" ${isTableSelected ? 'checked' : ''} 
                  class="rounded table-checkbox" data-table="${table.tableName}">
              ` : ''}
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              <div>
                <div class="font-medium">資料表: ${table.tableName} (${table.tableNameZh})</div>
                <div class="text-xs text-gray-500">${table.tableTitle}</div>
              </div>
            </div>
            <div class="px-3 py-1 rounded text-sm ${state.selectedType === 'category' ? 'bg-purple-100 border border-purple-300' : 'bg-gray-100'}">
              主題分類: ${table.tableCategory || '未設定'}
            </div>
          </div>
        `;

        if (isExpanded) {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'bg-white';

            let tableHTML = `
            <table class="w-full">
              <thead class="bg-gray-100 border-t">
                <tr>
                  <th class="w-12 px-4 py-2">
                    ${state.selectedType !== 'category' && tableColumns.length > 0 ? `
                      <input type="checkbox" ${allColumnsSelected ? 'checked' : ''} 
                        class="rounded all-columns-checkbox" data-table="${table.tableName}">
                    ` : ''}
                  </th>
                  <th class="text-left px-4 py-2 text-xs font-medium">欄位名稱</th>
                  <th class="text-left px-4 py-2 text-xs font-medium ${state.selectedType === 'term' ? 'bg-blue-100' : ''}">業務詞彙</th>
                  <th class="text-left px-4 py-2 text-xs font-medium ${state.selectedType === 'dataClass' ? 'bg-green-100' : ''}">資料類別</th>
                  <th class="text-left px-4 py-2 text-xs font-medium ${state.selectedType === 'sensitivity' ? 'bg-red-100' : ''}">敏感性標記</th>
                </tr>
              </thead>
              <tbody>
          `;

            table.columns.forEach(col => {
                const showCheckbox = (state.selectedType === 'dataClass' && !col.dataClass) ||
                    (state.selectedType === 'sensitivity' && !col.sensitivity) ||
                    (state.selectedType === 'term' && col.terms.length === 0);
                const isSelected = state.selectedItems.some(i => i.id === col.id);

                tableHTML += `
              <tr class="border-t hover:bg-gray-50">
                <td class="px-4 py-2 checkbox-cell">
                  ${showCheckbox ? `
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                      class="rounded column-checkbox" 
                      data-col-id="${col.id}"
                      data-table="${table.tableName}"
                      data-table-zh="${table.tableNameZh}"
                      data-col-name="${col.name}"
                      data-col-zh="${col.nameZh}">
                  ` : ''}
                </td>
                <td class="px-4 py-2 text-sm">
                  <div class="font-medium">${col.name}</div>
                  <div class="text-xs text-gray-500">${col.nameZh}</div>
                </td>
                <td class="px-4 py-2 text-sm ${state.selectedType === 'term' ? 'bg-blue-50' : ''}">
                  ${col.terms.length > 0 ? col.terms.join(', ') : '<span class="text-gray-400">未設定</span>'}
                </td>
                <td class="px-4 py-2 text-sm ${state.selectedType === 'dataClass' ? 'bg-green-50' : ''}">
                  ${col.dataClass || '<span class="text-gray-400">未設定</span>'}
                </td>
                <td class="px-4 py-2 text-sm ${state.selectedType === 'sensitivity' ? 'bg-red-50' : ''}">
                  ${col.sensitivity || '<span class="text-gray-400">未設定</span>'}
                </td>
              </tr>
            `;
            });

            tableHTML += `
              </tbody>
            </table>
          `;

            contentDiv.innerHTML = tableHTML;
            tableDiv.appendChild(contentDiv);
        }

        container.appendChild(tableDiv);
    });

    // Add event listeners for dynamically created elements
    document.querySelectorAll('.toggle-table-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleTable(btn.dataset.table));
    });

    document.querySelectorAll('.table-checkbox').forEach(cb => {
        cb.addEventListener('change', () => toggleTableSelection(cb.dataset.table));
    });

    document.querySelectorAll('.column-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            toggleColumnSelection(
                cb.dataset.colId,
                cb.dataset.table,
                cb.dataset.tableZh,
                cb.dataset.colName,
                cb.dataset.colZh
            );
        });
    });

    document.querySelectorAll('.all-columns-checkbox').forEach(cb => {
        cb.addEventListener('change', () => toggleAllTableColumns(cb.dataset.table));
    });

    updatePagination();
    updateSelectedCount();
}

// Toggle functions
function toggleTable(tableName) {
    state.expandedTables[tableName] = !state.expandedTables[tableName];
    renderSearchResults();
}

function toggleTableSelection(tableName) {
    const idx = state.selectedItems.findIndex(i => i.id === tableName);
    if (idx > -1) {
        state.selectedItems.splice(idx, 1);
    } else {
        const table = state.searchResults.find(t => t.tableName === tableName);
        state.selectedItems.push({
            id: tableName,
            type: 'table',
            tableName: tableName,
            tableNameZh: table.tableNameZh
        });
    }
    renderSearchResults();
}

function toggleColumnSelection(colId, tableName, tableNameZh, colName, colNameZh) {
    const idx = state.selectedItems.findIndex(i => i.id === colId);
    if (idx > -1) {
        state.selectedItems.splice(idx, 1);
    } else {
        state.selectedItems.push({
            id: colId,
            type: 'column',
            tableName: tableName,
            tableNameZh: tableNameZh,
            columnName: colName,
            columnNameZh: colNameZh
        });
    }
    renderSearchResults();
}

function toggleAllTableColumns(tableName) {
    const table = state.searchResults.find(t => t.tableName === tableName);
    const tableColumns = table.columns.filter(col => {
        if (state.selectedType === 'dataClass') return !col.dataClass;
        if (state.selectedType === 'sensitivity') return !col.sensitivity;
        if (state.selectedType === 'term') return col.terms.length === 0;
        return false;
    });

    const allSelected = tableColumns.every(col => state.selectedItems.some(i => i.id === col.id));

    if (allSelected) {
        state.selectedItems = state.selectedItems.filter(item =>
            !tableColumns.some(col => col.id === item.id)
        );
    } else {
        tableColumns.forEach(col => {
            if (!state.selectedItems.some(i => i.id === col.id)) {
                state.selectedItems.push({
                    id: col.id,
                    type: 'column',
                    tableName: tableName,
                    tableNameZh: table.tableNameZh,
                    columnName: col.name,
                    columnNameZh: col.nameZh
                });
            }
        });
    }

    renderSearchResults();
}

function selectAllInPage() {
    const startIdx = (state.currentPage - 1) * state.pageSize;
    const pageData = state.searchResults.slice(startIdx, startIdx + state.pageSize);

    const allItems = [];
    pageData.forEach(table => {
        if (state.selectedType === 'category' && !table.tableCategory) {
            allItems.push({
                id: table.tableName,
                type: 'table',
                tableName: table.tableName,
                tableNameZh: table.tableNameZh
            });
        }
        table.columns.forEach(col => {
            if ((state.selectedType === 'dataClass' && !col.dataClass) ||
                (state.selectedType === 'sensitivity' && !col.sensitivity) ||
                (state.selectedType === 'term' && col.terms.length === 0)) {
                allItems.push({
                    id: col.id,
                    type: 'column',
                    tableName: table.tableName,
                    tableNameZh: table.tableNameZh,
                    columnName: col.name,
                    columnNameZh: col.nameZh
                });
            }
        });
    });

    const allSelected = allItems.every(item => state.selectedItems.some(i => i.id === item.id));

    if (allSelected) {
        state.selectedItems = state.selectedItems.filter(i => !allItems.some(item => item.id === i.id));
    } else {
        allItems.forEach(item => {
            if (!state.selectedItems.some(i => i.id === item.id)) {
                state.selectedItems.push(item);
            }
        });
    }

    renderSearchResults();
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(state.searchResults.length / state.pageSize);
    document.getElementById('current-page').textContent = state.currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    document.getElementById('total-items').textContent = state.searchResults.length;
    document.getElementById('prev-btn').disabled = state.currentPage === 1;
    document.getElementById('next-btn').disabled = state.currentPage === totalPages;
}

function prevPage() {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderSearchResults();
    }
}

function nextPage() {
    const totalPages = Math.ceil(state.searchResults.length / state.pageSize);
    if (state.currentPage < totalPages) {
        state.currentPage++;
        renderSearchResults();
    }
}

function updatePageSize() {
    state.pageSize = parseInt(document.getElementById('page-size').value);
    state.currentPage = 1;
    renderSearchResults();
}

function updateSelectedCount() {
    document.getElementById('selected-count').textContent = state.selectedItems.length;
    document.getElementById('execute-btn').disabled = state.selectedItems.length === 0;
}

// Execute recommendation
function executeRecommendation() {
    if (state.selectedItems.length === 0) return;

    state.recommendations = state.selectedItems.map(item => {
        const recommendData = mockRecommendations[state.selectedType] || [];
        return {
            item: item,
            suggestions: recommendData.map((rec, idx) => ({
                ...rec,
                selected: false
            }))
        };
    });

    state.expandedRecommendations = {};
    state.recommendations.forEach((rec, idx) => {
        state.expandedRecommendations[idx] = true;
    });

    renderRecommendations();
    document.getElementById('recommend-modal').classList.remove('hidden');
}

// Render recommendations
function renderRecommendations() {
    const container = document.getElementById('recommendations-container');
    container.innerHTML = '';

    state.recommendations.forEach((rec, recIdx) => {
        const item = rec.item;
        const isExpanded = state.expandedRecommendations[recIdx];

        let itemTitle = '';
        if (item.type === 'table') {
            itemTitle = `資料表: ${item.tableName} (${item.tableNameZh})`;
        } else {
            itemTitle = `${item.tableName} (${item.tableNameZh}) - ${item.columnName} (${item.columnNameZh})`;
        }

        const recDiv = document.createElement('div');
        recDiv.className = 'border rounded-lg';

        // 簡易模式：標題和選項在同一列，更緊湊的設計
        if (state.viewMode === 'simple') {
            recDiv.innerHTML = `
            <div class="bg-gray-50 px-4 py-2.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3 flex-1">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span class="font-medium text-sm">${itemTitle}</span>
                </div>
                <div class="flex items-center space-x-2">
                  ${rec.suggestions.slice(0, 3).map((sug, sugIdx) => `
                    <label class="suggestion-card flex items-center space-x-2 px-3 py-1.5 border rounded-lg bg-white hover:border-blue-400 cursor-pointer transition ${sug.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
                      <input type="radio" name="rec-${recIdx}" ${sug.selected ? 'checked' : ''} 
                             class="suggestion-radio" data-rec-idx="${recIdx}" data-sug-idx="${sugIdx}">
                      <span class="text-sm font-medium">${sug.name}</span>
                      <span class="text-xs text-gray-500">(${sug.nameEn || sug.nameZh || ''})</span>
                      <span class="text-xs font-semibold text-blue-600 ml-1">${sug.confidence}%</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        } else {
            // 詳細模式：可展開/收合
            recDiv.innerHTML = `
            <div class="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer toggle-rec-btn" data-idx="${recIdx}">
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 transition-transform ${isExpanded ? '' : '-rotate-90'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
                <span class="font-medium">${itemTitle}</span>
              </div>
              <span class="text-sm text-gray-500">${rec.suggestions.filter(s => s.selected).length} 個已選擇</span>
            </div>
          `;

            if (isExpanded) {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'p-4 bg-white';
                contentDiv.innerHTML = renderDetailMode(rec, recIdx);
                recDiv.appendChild(contentDiv);
            }
        }

        container.appendChild(recDiv);
    });

    // Add event listeners
    if (state.viewMode === 'detail') {
        document.querySelectorAll('.toggle-rec-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleRecommendation(parseInt(btn.dataset.idx)));
        });
    }

    document.querySelectorAll('.suggestion-radio').forEach(radio => {
        radio.addEventListener('change', () => {
            selectSuggestion(parseInt(radio.dataset.recIdx), parseInt(radio.dataset.sugIdx));
        });
    });

    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const radio = card.querySelector('.suggestion-radio');
            if (radio && !radio.checked) {
                radio.checked = true;
                selectSuggestion(parseInt(radio.dataset.recIdx), parseInt(radio.dataset.sugIdx));
            }
        });
    });
}

function renderSimpleMode(rec, recIdx) {
    // This function is no longer used in simple mode
    return '';
}

function renderDetailMode(rec, recIdx) {
    return `
        <div class="space-y-3">
          ${rec.suggestions.slice(0, 3).map((sug, sugIdx) => `
            <div class="suggestion-card border rounded-lg p-4 hover:border-blue-400 cursor-pointer ${sug.selected ? 'border-blue-500 bg-blue-50' : ''}">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-start space-x-3">
                  <input type="radio" name="rec-${recIdx}" ${sug.selected ? 'checked' : ''} 
                         class="suggestion-radio mt-1" data-rec-idx="${recIdx}" data-sug-idx="${sugIdx}">
                  <div>
                    <div class="font-medium">${sug.name}</div>
                    ${sug.nameEn ? `<div class="text-sm text-gray-500">${sug.nameEn}</div>` : ''}
                    ${sug.nameZh ? `<div class="text-sm text-gray-500">${sug.nameZh}</div>` : ''}
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-semibold text-blue-600">${sug.confidence}%</span>
                  <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${sug.confidence}%"></div>
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-600 ml-7">
                ${getDetailDescription(sug, state.selectedType)}
              </div>
            </div>
          `).join('')}
        </div>
      `;
}

function getDetailDescription(sug, type) {
    switch (type) {
        case 'category':
            return `<strong>主題說明:</strong> ${sug.description}`;
        case 'term':
            return `<strong>詞彙說明:</strong> ${sug.description}`;
        case 'dataClass':
            return `<strong>欄位型態:</strong> ${sug.fieldType}<br><strong>類別說明:</strong> ${sug.description}`;
        case 'sensitivity':
            return `<strong>類型:</strong> ${sug.nameZh} (${sug.nameEn})<br><strong>敏感等級:</strong> ${sug.level}<br><strong>說明:</strong> ${sug.description}`;
        default:
            return sug.description;
    }
}

function toggleRecommendation(idx) {
    state.expandedRecommendations[idx] = !state.expandedRecommendations[idx];
    renderRecommendations();
}

function selectSuggestion(recIdx, sugIdx) {
    state.recommendations[recIdx].suggestions.forEach((s, i) => {
        s.selected = i === sugIdx;
    });
    renderRecommendations();
}

// View mode toggle
function toggleViewMode() {
    state.viewMode = state.viewMode === 'simple' ? 'detail' : 'simple';
    document.getElementById('simple-icon').classList.toggle('hidden');
    document.getElementById('detail-icon').classList.toggle('hidden');

    const modeText = document.getElementById('mode-text');
    modeText.textContent = state.viewMode === 'simple' ? '簡易' : '詳細';

    // Reset expanded state when switching to detail mode
    if (state.viewMode === 'detail') {
        state.expandedRecommendations = {};
        state.recommendations.forEach((rec, idx) => {
            state.expandedRecommendations[idx] = true;
        });
        state.allCollapsed = false;
    }

    renderRecommendations();
}

// Collapse all - toggle between collapsed and expanded
function collapseAll() {
    if (state.viewMode === 'simple') return; // No effect in simple mode

    state.allCollapsed = !state.allCollapsed;
    state.expandedRecommendations = {};
    state.recommendations.forEach((rec, idx) => {
        state.expandedRecommendations[idx] = !state.allCollapsed;
    });
    renderRecommendations();
}

// Select all first
function selectAllFirst() {
    state.recommendations.forEach(rec => {
        rec.suggestions.forEach((s, i) => {
            s.selected = i === 0;
        });
    });
    renderRecommendations();
}

// Modal controls
function closeRecommendModal() {
    document.getElementById('recommend-modal').classList.add('hidden');
}

function previewRecommendations() {
    const selectedRecs = state.recommendations.filter(rec =>
        rec.suggestions.some(s => s.selected)
    );

    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = `
        <div class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center space-x-2 mb-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-medium text-blue-900">預覽摘要</span>
            </div>
            <p class="text-sm text-blue-800">共 ${selectedRecs.length} 個項目將被更新</p>
          </div>

          ${selectedRecs.map(rec => {
        const item = rec.item;
        const selected = rec.suggestions.find(s => s.selected);

        let itemTitle = '';
        if (item.type === 'table') {
            itemTitle = `資料表: ${item.tableName} (${item.tableNameZh})`;
        } else {
            itemTitle = `欄位: ${item.tableName}.${item.columnName} (${item.columnNameZh})`;
        }

        return `
              <div class="border rounded-lg p-4">
                <div class="font-medium mb-2">${itemTitle}</div>
                <div class="flex items-center space-x-2 text-sm">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-gray-700">將設定為:</span>
                  <span class="font-medium text-blue-600">${selected.name}</span>
                  ${selected.nameEn ? `<span class="text-gray-500">(${selected.nameEn})</span>` : ''}
                  <span class="text-xs text-gray-500">- 信心度: ${selected.confidence}%</span>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      `;

    document.getElementById('preview-modal').classList.remove('hidden');
}

function closePreviewModal() {
    document.getElementById('preview-modal').classList.add('hidden');
}

function saveRecommendations() {
    const selectedCount = state.recommendations.reduce((acc, rec) => {
        return acc + (rec.suggestions.some(s => s.selected) ? 1 : 0);
    }, 0);

    // Close all other modals
    closeRecommendModal();
    closePreviewModal();

    // Show status modal with loading state
    const statusModal = document.getElementById('status-modal');
    const loadingState = document.getElementById('status-loading');
    const successState = document.getElementById('status-success');

    statusModal.classList.remove('hidden');
    loadingState.classList.remove('hidden');
    successState.classList.add('hidden');

    // Simulate 2 second loading delay
    setTimeout(() => {
        // Hide loading, show success
        loadingState.classList.add('hidden');
        successState.classList.remove('hidden');

        document.getElementById('success-message').textContent =
            `${selectedCount} 筆資料已經儲存`;

    }, 2000);
}

function closeSuccessModal() {
    document.getElementById('status-modal').classList.add('hidden');

    // Reset and refresh
    state.selectedItems = [];
    state.recommendations = [];

    // Refresh search results
    if (state.searchResults.length > 0) {
        handleSearch();
    }
}

// Initialize on page load
init();

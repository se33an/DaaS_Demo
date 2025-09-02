import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import DataAssetPage from "./DataAssetPage";
import TableEditPage from "./TableEditPage";
import ColumnEditPage from "./ColumnEditPage";
import AuditFlowPage from "./AuditFlowPage";

function App() {
  const [page, setPage] = useState("assets"); // assets | tableEdit | columnEdit | audit
  const [role, setRole] = useState("owner"); // owner | supervisor
  const [selectedTable, setSelectedTable] = useState(null);

  // 模擬數據資產 (狀態管理)
  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "存款資料表",
      businessTerm: "存款",
      purpose: "被視存款相關資訊",
      retention: "10年",
      dataOwner: "財務部",
      contact: "Wen Chen",
      status: "editing", // editing | pending | approved | rejected | published
      rejectReason: "",
      columns: [
        { id: 1, name: "AccountNo", cnName: "存款識別碼", businessTerm: "存款", type: "PII" },
        { id: 2, name: "Balance", cnName: "存款餘額", businessTerm: "存款", type: "decimal" }
      ]
    }
  ]);

  return (
    <div className="flex h-screen">
      {/* 側邊欄 */}
      <Sidebar page={page} setPage={setPage} role={role} setRole={setRole} />

      <div className="flex-1 p-6 overflow-auto">
        {page === "assets" && (
          <DataAssetPage
            assets={assets}
            setPage={setPage}
            setSelectedTable={setSelectedTable}
          />
        )}

        {page === "tableEdit" && selectedTable && (
          <TableEditPage
            table={selectedTable}
            assets={assets}
            setAssets={setAssets}
            setPage={setPage}
          />
        )}

        {page === "columnEdit" && selectedTable && (
          <ColumnEditPage
            table={selectedTable}
            assets={assets}
            setAssets={setAssets}
            setPage={setPage}
          />
        )}

        {page === "audit" && (
  <AuditFlowPage
    assets={assets}
    setAssets={setAssets}
    role={role}
    setPage={setPage}
    setSelectedTable={setSelectedTable}
  />
)}
      </div>
    </div>
  );
}

export default App;

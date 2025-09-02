import React from "react";

export default function AuditFlowPage({ assets, setAssets, role, setPage, setSelectedTable }) {
  const approve = (id) => {
    setAssets(
      assets.map((t) =>
        t.id === id ? { ...t, status: "approved", rejectReason: "" } : t
      )
    );
  };

  const reject = (id) => {
    const reason = prompt("退回原因：");
    if (reason) {
      setAssets(
        assets.map((t) =>
          t.id === id ? { ...t, status: "rejected", rejectReason: reason } : t
        )
      );
    }
  };

  const publish = (id) => {
    setAssets(
      assets.map((t) =>
        t.id === id ? { ...t, status: "published" } : t
      )
    );
  };

  const backToEdit = (table) => {
    setAssets(
      assets.map((t) =>
        t.id === table.id ? { ...t, status: "editing" } : t
      )
    );
    setSelectedTable(table);
    setPage("tableEdit"); // 跳回 Table 編輯頁
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">AuditFlow</h1>
      {assets.map((t) => (
        <div key={t.id} className="border rounded p-4 mb-4">
          <h2 className="font-semibold">{t.name}</h2>
          <p>狀態: {t.status}</p>

          {/* Supervisor 視角 */}
          {role === "supervisor" && t.status === "pending" && (
            <div className="space-x-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => approve(t.id)}
              >
                通過
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => reject(t.id)}
              >
                退回
              </button>
            </div>
          )}

          {/* Data Owner 視角 - 發布 */}
          {role === "owner" && t.status === "approved" && (
            <button
              className="bg-purple-600 text-white px-3 py-1 rounded"
              onClick={() => publish(t.id)}
            >
              發布
            </button>
          )}

          {/* Data Owner 視角 - 退回後重新編輯 */}
          {role === "owner" && t.status === "rejected" && (
            <div className="space-y-2">
              <p className="text-red-600">退回原因: {t.rejectReason}</p>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => backToEdit(t)}
              >
                重新編輯
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import React, { useState } from "react";

export default function TableEditPage({ table, assets, setAssets, setPage }) {
  const [form, setForm] = useState({ ...table });

  const handleSubmit = () => {
    setAssets(
      assets.map((t) =>
        t.id === table.id ? { ...form, status: "pending" } : t
      )
    );
    setPage("audit"); // 送出後直接進 AuditFlow
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">編輯資產 - {table.name}</h1>
      <input
        className="border p-2 w-full"
        value={form.businessTerm}
        onChange={(e) => setForm({ ...form, businessTerm: e.target.value })}
        placeholder="業務詞彙"
      />
      <input
        className="border p-2 w-full"
        value={form.purpose}
        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        placeholder="使用目的"
      />
      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        送出審核
      </button>
    </div>
  );
}

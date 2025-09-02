import React from "react";

export default function Sidebar({ page, setPage, role, setRole }) {
  return (
    <div className="w-64 bg-gray-100 border-r p-4 space-y-4">
      <h2 className="text-xl font-bold">MetaData 管理</h2>
      <nav className="flex flex-col space-y-2">
        <button
          className={`p-2 rounded ${page === "assets" && "bg-blue-200"}`}
          onClick={() => setPage("assets")}
        >
          數據資產管理
        </button>
        <button
          className={`p-2 rounded ${page === "audit" && "bg-blue-200"}`}
          onClick={() => setPage("audit")}
        >
          AuditFlow
        </button>
      </nav>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">角色切換</h3>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="owner">Data Owner</option>
          <option value="supervisor">Supervisor</option>
        </select>
      </div>
    </div>
  );
}

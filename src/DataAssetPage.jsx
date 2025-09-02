import React from "react";

export default function DataAssetPage({ assets, setPage, setSelectedTable }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">數據資產管理</h1>
      {assets.map((table) => (
        <div key={table.id} className="border rounded p-4 mb-4 shadow">
          <h2 className="font-semibold">{table.name}</h2>
          <p>狀態: {table.status}</p>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
            onClick={() => {
              setSelectedTable(table);
              setPage("tableEdit");
            }}
          >
            編輯
          </button>
        </div>
      ))}
    </div>
  );
}

import React from "react";

export default function ColumnEditPage({ table }) {
  return (
    <div>
      <h1 className="text-xl font-bold">編輯欄位 - {table.name}</h1>
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">欄位名稱</th>
            <th className="p-2">中文名稱</th>
            <th className="p-2">業務詞彙</th>
            <th className="p-2">資料型態</th>
          </tr>
        </thead>
        <tbody>
          {table.columns.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2">{c.cnName}</td>
              <td className="border p-2">{c.businessTerm}</td>
              <td className="border p-2">{c.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

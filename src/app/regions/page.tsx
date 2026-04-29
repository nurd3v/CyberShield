"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Regions() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/regions").then((r) => r.json()).then(setData);
  }, []);

  const navItems = ["Обзор", "Компании", "Проверки", "Регионы", "Аналитика", "Настройки"];
  const navRoutes: Record<string, string> = {
    "Обзор": "/", "Компании": "/companies", "Проверки": "/checks",
    "Регионы": "/regions", "Аналитика": "/analytics", "Настройки": "/settings",
  };

  const maxAmount = data ? Math.max(...data.regions.map((r: any) => r.amount)) : 1;

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-gray-900">Subsidy Analytics</h1>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 p-5">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item} onClick={() => router.push(navRoutes[item])}
                className={`px-4 py-3 rounded-lg text-sm cursor-pointer ${
                  item === "Регионы" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}>
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {!data ? <div className="text-gray-500">Загрузка...</div> : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="text-sm text-gray-500 mb-2">Всего регионов</div>
                  <div className="text-2xl font-semibold">{data.regions.length}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="text-sm text-gray-500 mb-2">Лидер по заявкам</div>
                  <div className="text-lg font-semibold truncate">{data.regions.sort((a: any, b: any) => b.total - a.total)[0]?.name}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="text-sm text-gray-500 mb-2">Лидер по субсидиям</div>
                  <div className="text-lg font-semibold truncate">{data.regions[0]?.name}</div>
                </div>
              </div>

              {/* Bar chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <h2 className="text-sm font-medium text-gray-900 mb-6">Субсидии по регионам</h2>
                <div className="space-y-3">
                  {data.regions.map((r: any, i: number) => {
                    const pct = Math.round((r.amount / maxAmount) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 truncate max-w-xs">{r.name}</span>
                          <span className="text-gray-500 ml-4 shrink-0">{(r.amount / 1000000000).toFixed(1)} млрд ₸</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 font-medium">Детали по регионам</div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Регион</th>
                      <th className="px-5 py-3">Заявок</th>
                      <th className="px-5 py-3">Исполнено</th>
                      <th className="px-5 py-3">Отклонено</th>
                      <th className="px-5 py-3">% одобрения</th>
                      <th className="px-5 py-3">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.regions.map((r: any, i: number) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3">{r.name}</td>
                        <td className="px-5 py-3">{r.total}</td>
                        <td className="px-5 py-3 text-green-600">{r.approved}</td>
                        <td className="px-5 py-3 text-red-500">{r.rejected}</td>
                        <td className="px-5 py-3">
                          <span className={`font-medium ${r.approvalRate > 70 ? "text-green-600" : r.approvalRate > 40 ? "text-yellow-600" : "text-red-500"}`}>
                            {r.approvalRate}%
                          </span>
                        </td>
                        <td className="px-5 py-3">{(r.amount / 1000000000).toFixed(2)} млрд ₸</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

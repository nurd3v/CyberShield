"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData);
  }, []);

  const navItems = ["Обзор", "Компании", "Проверки", "Регионы", "Аналитика", "Настройки"];
  const navRoutes: Record<string, string> = {
    "Обзор": "/", "Компании": "/companies", "Проверки": "/checks",
    "Регионы": "/regions", "Аналитика": "/analytics", "Настройки": "/settings",
  };

  const statusColors: Record<string, string> = {
    "Исполнена": "bg-green-500",
    "Принята": "bg-blue-500",
    "Отклонена": "bg-red-500",
    "Отозвано": "bg-gray-400",
    "Сформировано поручение": "bg-purple-500",
    "Отправлена": "bg-yellow-500",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center">
        <h1 className="text-[20px] font-semibold text-gray-900">Subsidy Analytics</h1>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 p-5">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item} onClick={() => router.push(navRoutes[item])}
                className={`px-4 py-3 rounded-lg text-sm cursor-pointer ${
                  item === "Аналитика" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}>
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {!data ? <div className="text-gray-500">Загрузка...</div> : (
            <div className="space-y-6">
              {/* По месяцам */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-medium text-gray-900 mb-6">Динамика субсидий по месяцам</h2>
                {(() => {
                  const max = Math.max(...data.byMonth.map((m: any) => m.amount));
                  return (
                    <div className="h-64 flex items-end gap-2">
                      {data.byMonth.map((m: any, i: number) => {
                        const pct = Math.round((m.amount / max) * 100);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-400">{(m.amount / 1000000000).toFixed(1)}млрд</span>
                            <div className="w-full bg-blue-500 rounded-t-md" style={{ height: `${pct}%` }} />
                            <span className="text-xs text-gray-400">{m.month.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* По статусам */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h2 className="text-sm font-medium text-gray-900 mb-5">Распределение по статусам</h2>
                  {(() => {
                    const total = data.byStatus.reduce((s: number, i: any) => s + i.count, 0);
                    return (
                      <div className="space-y-3">
                        {data.byStatus.sort((a: any, b: any) => b.count - a.count).map((s: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{s.status}</span>
                              <span className="text-gray-500">{s.count} ({Math.round(s.count / total * 100)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${statusColors[s.status] || "bg-gray-400"}`}
                                style={{ width: `${Math.round(s.count / total * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Топ регионов */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h2 className="text-sm font-medium text-gray-900 mb-5">Топ регионов по субсидиям</h2>
                  {(() => {
                    const max = Math.max(...data.topRegions.map((r: any) => r.amount));
                    return (
                      <div className="space-y-3">
                        {data.topRegions.map((r: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 truncate max-w-[200px]">{r.region}</span>
                              <span className="text-gray-500 shrink-0 ml-2">{(r.amount / 1000000000).toFixed(1)} млрд ₸</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.round(r.amount / max * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

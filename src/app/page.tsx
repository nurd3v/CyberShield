"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-10 text-gray-500">Загрузка...</div>;

  const stats = [
    { title: "Одобрено", value: data.stats.approved, color: "bg-green-500" },
    { title: "На проверке", value: data.stats.pending, color: "bg-yellow-500" },
    { title: "Отклонено", value: data.stats.rejected, color: "bg-red-500" },
    { title: "Бюджет", value: (data.stats.budget / 1000000000).toFixed(1) + " млрд ₸", color: "bg-blue-500" },
  ];

  const navItems = ["Обзор", "Компании", "Проверки", "Регионы", "Аналитика", "Анкета", "Настройки"];
  const navRoutes: Record<string, string> = {
    "Обзор": "/", "Компании": "/companies", "Проверки": "/checks",
    "Регионы": "/regions", "Аналитика": "/analytics", "Анкета": "/apply", "Настройки": "/settings",
  };

  const maxAmount = Math.max(...(data.months || []).map((m: any) => m.amount));

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-gray-900">CyberShield</h1>
        <div className="flex items-center gap-3">
          <input placeholder="Поиск..." className="w-72 h-10 px-4 border border-gray-200 rounded-lg outline-none text-sm bg-white" />
          <button className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm">Экспорт</button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 p-5">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item} onClick={() => router.push(navRoutes[item])}
                className={`px-4 py-3 rounded-lg text-sm cursor-pointer ${
                  item === "Обзор" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}>
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{item.title}</span>
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                </div>
                <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-900 mb-6">Расход бюджета по месяцам</h2>
              <div className="h-72 flex items-end gap-3">
                {(data.months || []).map((m: any, i: number) => {
                  const pct = Math.round((m.amount / maxAmount) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-blue-500 rounded-t-md" style={{ height: `${pct}%` }} />
                      <span className="text-xs text-gray-400">{m.month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-900 mb-5">Использование бюджета</h2>
              <div className="text-3xl font-semibold mb-4">
                {Math.round((data.stats.approved / (data.stats.approved + data.stats.pending + data.stats.rejected)) * 100)}%
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${Math.round((data.stats.approved / (data.stats.approved + data.stats.pending + data.stats.rejected)) * 100)}%` }} />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {data.stats.approved} из {data.stats.approved + data.stats.pending + data.stats.rejected} заявок исполнено
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 font-medium">Топ компании по субсидиям</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3">Компания</th>
                  <th className="px-5 py-3">Сумма</th>
                  <th className="px-5 py-3">Риск</th>
                </tr>
              </thead>
              <tbody>
                {data.companies.map((c: any, i: number) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-5 py-4">{c.name}</td>
                    <td className="px-5 py-4">{(c.amount / 1000000).toFixed(1)} млн ₸</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.risk === "Высокий" ? "bg-red-100 text-red-700" :
                        c.risk === "Средний" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>{c.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

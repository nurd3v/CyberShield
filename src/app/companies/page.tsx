"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Companies() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/companies").then((r) => r.json()).then(setData);
  }, []);

  const navItems = ["Обзор", "Компании", "Проверки", "Регионы", "Аналитика", "Настройки"];
  const navRoutes: Record<string, string> = {
    "Обзор": "/", "Компании": "/companies", "Проверки": "/checks",
    "Регионы": "/regions", "Аналитика": "/analytics", "Настройки": "/settings",
  };

  const filtered = data?.companies?.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-gray-900">Subsidy Analytics</h1>
        <div className="flex items-center gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск компании..."
            className="w-72 h-10 px-4 border border-gray-200 rounded-lg outline-none text-sm bg-white" />
          <button className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm">Экспорт</button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 p-5">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item} onClick={() => router.push(navRoutes[item])}
                className={`px-4 py-3 rounded-lg text-sm cursor-pointer ${
                  item === "Компании" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
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
                  <div className="text-sm text-gray-500 mb-2">Всего компаний</div>
                  <div className="text-2xl font-semibold">{data.companies.length}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="text-sm text-gray-500 mb-2">Высокий риск</div>
                  <div className="text-2xl font-semibold text-red-600">
                    {data.companies.filter((c: any) => c.risk === "Высокий").length}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="text-sm text-gray-500 mb-2">Общая сумма субсидий</div>
                  <div className="text-2xl font-semibold">
                    {(data.companies.reduce((s: number, c: any) => s + c.amount, 0) / 1000000000).toFixed(1)} млрд ₸
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 font-medium">
                  Компании ({filtered.length})
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Компания</th>
                      <th className="px-5 py-3">Регион</th>
                      <th className="px-5 py-3">Сумма</th>
                      <th className="px-5 py-3">Заявок</th>
                      <th className="px-5 py-3">Исполнено</th>
                      <th className="px-5 py-3">Отклонено</th>
                      <th className="px-5 py-3">Риск</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 100).map((c: any, i: number) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3 max-w-xs truncate">{c.name}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{c.region}</td>
                        <td className="px-5 py-3">{(c.amount / 1000000).toFixed(1)} млн ₸</td>
                        <td className="px-5 py-3">{c.total}</td>
                        <td className="px-5 py-3 text-green-600">{c.approved}</td>
                        <td className="px-5 py-3 text-red-500">{c.rejected}</td>
                        <td className="px-5 py-3">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

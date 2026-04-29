"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["", "Исполнена", "Принята", "Отклонена", "Отозвано", "Сформировано поручение", "Отправлена"];

export default function Checks() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    setData(null);
    fetch(`/api/checks?search=${search}&status=${status}&page=${page}`)
      .then((r) => r.json()).then(setData);
  }, [search, status, page]);

  const navItems = ["Обзор", "Компании", "Проверки", "Регионы", "Аналитика", "Настройки"];
  const navRoutes: Record<string, string> = {
    "Обзор": "/", "Компании": "/companies", "Проверки": "/checks",
    "Регионы": "/regions", "Аналитика": "/analytics", "Настройки": "/settings",
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const statusColor: Record<string, string> = {
    "Исполнена": "bg-green-100 text-green-700",
    "Принята": "bg-blue-100 text-blue-700",
    "Отклонена": "bg-red-100 text-red-700",
    "Отозвано": "bg-gray-100 text-gray-600",
    "Сформировано поручение": "bg-purple-100 text-purple-700",
    "Отправлена": "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-gray-900">Subsidy Analytics</h1>
        <div className="flex items-center gap-3">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Поиск по компании..."
            className="w-72 h-10 px-4 border border-gray-200 rounded-lg outline-none text-sm bg-white" />
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 p-5">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item} onClick={() => router.push(navRoutes[item])}
                className={`px-4 py-3 rounded-lg text-sm cursor-pointer ${
                  item === "Проверки" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}>
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="flex gap-2 mb-4 flex-wrap">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  status === s ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {s || "Все статусы"}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 font-medium flex justify-between items-center">
              <span>Заявки {data ? `(${data.total})` : ""}</span>
              {data && <span className="text-sm text-gray-400">Стр. {page} из {totalPages}</span>}
            </div>

            {!data ? <div className="p-10 text-gray-400 text-center">Загрузка...</div> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Компания</th>
                    <th className="px-5 py-3">Регион</th>
                    <th className="px-5 py-3">Сумма</th>
                    <th className="px-5 py-3">Статус</th>
                    <th className="px-5 py-3">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item: any, i: number) => (
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 max-w-xs truncate">{item.enterprise}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{item.state}</td>
                      <td className="px-5 py-3">{(item.subsidiesOwedSum / 1000000).toFixed(1)} млн ₸</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[item.bidStatus] || "bg-gray-100 text-gray-600"}`}>
                          {item.bidStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{new Date(item.sendDate).toLocaleDateString("ru-RU")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {data && (
              <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  ← Назад
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Вперёд →
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

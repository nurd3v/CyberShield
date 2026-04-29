"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="p-10 text-gray-500">Loading...</div>;
  }

  const stats = [
    {
      title: "Одобрено",
      value: data.stats.approved,
      color: "bg-green-500",
    },
    {
      title: "На проверке",
      value: data.stats.pending,
      color: "bg-yellow-500",
    },
    {
      title: "Отклонено",
      value: data.stats.rejected,
      color: "bg-red-500",
    },
    {
      title: "Бюджет",
      value: (data.stats.budget / 1000000000).toFixed(1) + " млрд ₸",
      color: "bg-blue-500",
    },
  ];

  const companies = data.companies.map((c: any) => [
    c.name,
    (c.amount / 1000000).toFixed(1) + " млн ₸",
    c.risk,
  ]);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* header */}
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-gray-900">
          Subsidy Analytics
        </h1>

        <div className="flex items-center gap-3">
          <input
            placeholder="Поиск..."
            className="w-72 h-10 px-4 border border-gray-200 rounded-lg outline-none text-sm bg-white"
          />
          <button className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm">
            Экспорт
          </button>
        </div>
      </header>

      <div className="flex">
        {/* sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 p-5">
          <nav className="space-y-1">
            {[
              "Обзор",
              "Компании",
              "Проверки",
              "Регионы",
              "Аналитика",
              "Настройки",
            ].map((item, i) => (
              <div
                key={item}
                className={`px-4 py-3 rounded-lg text-sm cursor-pointer ${
                  i === 0
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        {/* content */}
        <main className="flex-1 p-6">
          {/* cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{item.title}</span>
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                </div>

                <div className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* chart */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-900 mb-6">
                Расход бюджета по месяцам
              </h2>

              <div className="h-72 flex items-end gap-5">
                {[45, 60, 55, 80, 70, 95, 85].map((v, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className="bg-blue-500 rounded-t-md"
                      style={{ height: `${v}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* right */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-900 mb-5">
                Использование бюджета
              </h2>

              <div className="text-3xl font-semibold mb-4">68%</div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[68%] h-full bg-blue-500" />
              </div>

              <p className="text-sm text-gray-500 mt-3">
                {(data.stats.budget / 1000000000).toFixed(1)} млрд ₸ из{" "}
                {(data.stats.budget / 1000000000).toFixed(1)} млрд ₸
              </p>
            </div>
          </div>

          {/* table */}
          <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 font-medium">
              Последние заявки
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3">Компания</th>
                  <th className="px-5 py-3">Сумма</th>
                  <th className="px-5 py-3">Риск</th>
                </tr>
              </thead>

              <tbody>
                {companies.map((row: any, i: number) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-5 py-4">{row[0]}</td>
                    <td className="px-5 py-4">{row[1]}</td>
                    <td className="px-5 py-4">{row[2]}</td>
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
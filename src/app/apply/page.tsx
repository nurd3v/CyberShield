"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUBSIDY_TYPES = [
  "Заявка на получение субсидий на ведение селекционной и племенной работы с товарным маточным поголовьем",
  "Заявка на получение субсидий на удешевление стоимости производства молока",
  "Заявка на получение субсидий за приобретение племенных быков-производителей",
  "Заявка на получение субсидий на удешевление стоимости производства мяса птицы",
  "Заявка на получение субсидий на удешевление стоимости затрат на корма маточному поголовью",
  "Заявка на получение субсидий на ведение селекционной и племенной работы с племенным маточным поголовьем",
  "Заявка на получение субсидий на удешевление стоимости крупного рогатого скота",
  "Заявка на получение субсидий за приобретение отечественных племенных овец",
  "Заявка на получение субсидий за приобретение отечественного племенного КРС молочного направления",
  "Заявка на удешевление затрат при выращивании племенного молодняка крупного рогатого скота",
  "Заявка на удешевление затрат при выращивании племенного молодняка мелкого рогатого скота",
  "Заявка на получение субсидий за приобретение племенного маточного поголовья КРС из-за рубежа",
  "Заявка на получение субсидий за приобретение суточного молодняка финального гибрида",
  "Заявка на получение субсидий за приобретение племенного маточного поголовья коз",
  "Заявка на получение субсидий за приобретение племенного поголовья свиней",
  "Заявка на получение субсидий за приобретение племенного верблюда-производителя",
  "Заявка на получение субсидий племенным центрам за услуги по искусственному осеменению",
  "Заявка на получение субсидий за приобретенное однополое семя племенных быков",
];

const REGIONS = [
  "Акмолинская область", "Актюбинская область", "Алматинская область",
  "Атырауская область", "Восточно-Казахстанская область", "Жамбылская область",
  "Западно-Казахстанская область", "Карагандинская область", "Костанайская область",
  "Кызылординская область", "Мангистауская область", "Павлодарская область",
  "Северо-Казахстанская область", "Туркестанская область", "г. Астана",
  "г. Алматы", "г. Шымкент", "область Абай", "область Жетісу", "область Улытау",
];

const NAV_ITEMS = ["Обзор", "Компании", "Проверки", "Регионы", "Аналитика", "Анкета", "Настройки"];
const NAV_ROUTES: Record<string, string> = {
  "Обзор": "/", "Компании": "/companies", "Проверки": "/checks",
  "Регионы": "/regions", "Аналитика": "/analytics", "Анкета": "/apply", "Настройки": "/settings",
};

type Result = {
  approvalChance: number;
  risks: { title: string; description: string; weight: string }[];
  tips: string[];
  stats: { typeRejectionRate: number; regionRejectionRate: number; medianAmount: number; totalSimilar: number };
};

export default function Apply() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [form, setForm] = useState({
    region: "",
    subsidyType: "",
    amount: "",
    isNewCompany: false,
    hasDocuments: true,
    previousRejections: 0,
  });

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const weightColor: Record<string, string> = {
    "Критический": "border-red-300 bg-red-50",
    "Высокий": "border-orange-300 bg-orange-50",
    "Средний": "border-yellow-300 bg-yellow-50",
  };
  const weightBadge: Record<string, string> = {
    "Критический": "bg-red-100 text-red-700",
    "Высокий": "bg-orange-100 text-orange-700",
    "Средний": "bg-yellow-100 text-yellow-700",
  };

  const chanceColor = result
    ? result.approvalChance >= 70 ? "text-green-600" : result.approvalChance >= 45 ? "text-yellow-600" : "text-red-600"
    : "";

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-gray-900">Subsidy Analytics</h1>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 p-5">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item} onClick={() => router.push(NAV_ROUTES[item])}
                className={`px-4 py-3 rounded-lg text-sm cursor-pointer ${
                  item === "Анкета" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}>
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">

            {/* Прогресс */}
            <div className="flex items-center gap-3 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}>{s}</div>
                  <span className={`text-sm ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
                    {s === 1 ? "Основные данные" : s === 2 ? "Дополнительно" : "Результат"}
                  </span>
                  {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>

            {/* Шаг 1 */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">Данные о заявке</h2>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">Регион <span className="text-red-500">*</span></label>
                  <select value={form.region} onChange={(e) => set("region", e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none">
                    <option value="">Выберите регион</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">Тип субсидии <span className="text-red-500">*</span></label>
                  <select value={form.subsidyType} onChange={(e) => set("subsidyType", e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none">
                    <option value="">Выберите тип субсидии</option>
                    {SUBSIDY_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">Запрашиваемая сумма (₸) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)}
                    placeholder="Например: 5000000"
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none" />
                  {form.amount && (
                    <p className="text-xs text-gray-400 mt-1">
                      ≈ {(Number(form.amount) / 1000000).toFixed(2)} млн ₸
                    </p>
                  )}
                </div>

                <button onClick={() => setStep(2)}
                  disabled={!form.region || !form.subsidyType || !form.amount}
                  className="w-full h-10 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700">
                  Далее →
                </button>
              </div>
            )}

            {/* Шаг 2 */}
            {step === 2 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">Дополнительные сведения</h2>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.isNewCompany}
                      onChange={(e) => set("isNewCompany", e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">Компания подаёт впервые</div>
                      <div className="text-xs text-gray-500">Нет истории субсидирования в системе</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.hasDocuments}
                      onChange={(e) => set("hasDocuments", e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">Все документы готовы</div>
                      <div className="text-xs text-gray-500">Акты, договоры, электронные копии загружены корректно</div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">
                    Сколько раз ранее отклоняли заявки этой компании?
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <button key={n} onClick={() => set("previousRejections", n)}
                        className={`w-10 h-10 rounded-lg border text-sm font-medium ${
                          form.previousRejections === n
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}>
                        {n === 4 ? "4+" : n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 h-10 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    ← Назад
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 h-10 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-blue-700">
                    {loading ? "Анализируем..." : "Получить анализ"}
                  </button>
                </div>
              </div>
            )}

            {/* Шаг 3 — Результат */}
            {step === 3 && result && (
              <div className="space-y-4">
                {/* Главная карточка */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-500 mb-2">Шанс одобрения заявки</div>
                  <div className={`text-6xl font-bold mb-2 ${chanceColor}`}>
                    {result.approvalChance}%
                  </div>
                  <div className={`text-sm font-medium ${chanceColor}`}>
                    {result.approvalChance >= 70 ? "Высокий шанс одобрения"
                      : result.approvalChance >= 45 ? "Средний шанс — есть риски"
                      : "Низкий шанс — требуется доработка"}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-left">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">% отказов по типу субсидии</div>
                      <div className="text-lg font-semibold">{result.stats.typeRejectionRate}%</div>
                      <div className="text-xs text-gray-400">из {result.stats.totalSimilar} заявок</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">% отказов в вашем регионе</div>
                      <div className="text-lg font-semibold">{result.stats.regionRejectionRate}%</div>
                    </div>
                  </div>
                </div>

                {/* Риски */}
                {result.risks.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Выявленные риски</h3>
                    <div className="space-y-3">
                      {result.risks.map((risk, i) => (
                        <div key={i} className={`border rounded-lg p-4 ${weightColor[risk.weight] || "border-gray-200 bg-gray-50"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{risk.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${weightBadge[risk.weight] || ""}`}>
                              {risk.weight}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Советы */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Рекомендации</h3>
                  <ul className="space-y-3">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={() => { setStep(1); setResult(null); setForm({ region: "", subsidyType: "", amount: "", isNewCompany: false, hasDocuments: true, previousRejections: 0 }); }}
                  className="w-full h-10 border border-gray-200 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Заполнить новую анкету
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

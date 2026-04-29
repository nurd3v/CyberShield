import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { region, subsidyType, amount, isNewCompany, hasDocuments, previousRejections } = body;

  const all = await prisma.application.findMany();

  // --- Статистика по типу субсидии ---
  const byType = all.filter((i) => i.subsidiesName === subsidyType);
  const typeTotal = byType.length;
  const typeRejected = byType.filter((i) => ["Отклонена", "Отозвано"].includes(i.bidStatus)).length;
  const typeRejectionRate = typeTotal > 0 ? typeRejected / typeTotal : 0.15;

  // --- Статистика по региону ---
  const byRegion = all.filter((i) => i.state === region);
  const regionTotal = byRegion.length;
  const regionRejected = byRegion.filter((i) => ["Отклонена", "Отозвано"].includes(i.bidStatus)).length;
  const regionRejectionRate = regionTotal > 0 ? regionRejected / regionTotal : 0.15;

  // --- Статистика по сумме (сравниваем с медианой) ---
  const amounts = all.map((i) => Number(i.subsidiesOwedSum)).sort((a, b) => a - b);
  const median = amounts[Math.floor(amounts.length / 2)];
  const amountNum = Number(amount);
  const isAboveMedian = amountNum > median;

  // --- Расчёт базового шанса ---
  // Начинаем с исторического % одобрения по типу субсидии
  let approvalChance = 1 - typeRejectionRate;

  // Корректировка по региону
  if (regionRejectionRate > 0.2) approvalChance -= 0.08;
  else if (regionRejectionRate < 0.1) approvalChance += 0.05;

  // Корректировка по сумме
  if (isAboveMedian) approvalChance -= 0.07;

  // Корректировка по анкетным данным
  if (!hasDocuments) approvalChance -= 0.25;
  if (isNewCompany) approvalChance -= 0.10;
  if (previousRejections > 0) approvalChance -= 0.05 * Math.min(previousRejections, 4);

  approvalChance = Math.max(0.05, Math.min(0.95, approvalChance));
  const approvalPct = Math.round(approvalChance * 100);

  // --- Риски ---
  const risks: { title: string; description: string; weight: string }[] = [];

  if (!hasDocuments) {
    risks.push({
      title: "Неполный пакет документов",
      description: "Отсутствие или неполнота документов — главная причина отказов (более 60% случаев). Убедитесь, что все электронные копии загружены корректно.",
      weight: "Критический",
    });
  }

  if (regionRejectionRate > 0.2) {
    risks.push({
      title: `Высокий процент отказов в регионе (${Math.round(regionRejectionRate * 100)}%)`,
      description: `В регионе «${region}» исторически высокий процент отклонённых заявок. Возможно, местный акимат применяет более строгие требования.`,
      weight: "Высокий",
    });
  }

  if (typeRejectionRate > 0.2) {
    risks.push({
      title: `Конкурентный тип субсидии (${Math.round(typeRejectionRate * 100)}% отказов)`,
      description: "По данному типу субсидий исторически высокий процент отказов. Убедитесь, что соответствуете всем требованиям правил субсидирования.",
      weight: "Высокий",
    });
  }

  if (isAboveMedian) {
    risks.push({
      title: "Сумма выше медианы по базе",
      description: `Запрашиваемая сумма выше медианной (${(median / 1000000).toFixed(1)} млн ₸). Крупные заявки проходят дополнительную проверку.`,
      weight: "Средний",
    });
  }

  if (isNewCompany) {
    risks.push({
      title: "Новая компания без истории",
      description: "Компании без истории субсидирования одобряются реже. Рекомендуем начать с меньшей суммы для формирования репутации.",
      weight: "Средний",
    });
  }

  if (previousRejections > 0) {
    risks.push({
      title: `История отказов (${previousRejections} раз)`,
      description: "Предыдущие отказы снижают шансы. Перед повторной подачей убедитесь, что устранили все причины предыдущих отказов.",
      weight: previousRejections > 2 ? "Высокий" : "Средний",
    });
  }

  // --- Советы ---
  const tips: string[] = [];

  if (!hasDocuments) {
    tips.push("Подготовьте полный пакет документов: акты, договоры, электронные копии. Проверьте, что все файлы открываются и загружаются корректно.");
  }
  tips.push("Подайте заявку в начале месяца — бюджеты чаще доступны в начале периода.");
  tips.push("Обратитесь в районное управление сельского хозяйства за консультацией перед подачей.");
  if (isAboveMedian) {
    tips.push("Рассмотрите разбивку суммы на несколько заявок меньшего размера.");
  }
  if (typeRejectionRate > 0.2) {
    tips.push("Внимательно изучите Правила субсидирования — особенно пункты 21-22, которые чаще всего становятся основанием для отказа.");
  }
  tips.push("Сохраняйте все квитанции, акты и накладные — они могут потребоваться при проверке.");

  return NextResponse.json({
    approvalChance: approvalPct,
    risks,
    tips,
    stats: {
      typeRejectionRate: Math.round(typeRejectionRate * 100),
      regionRejectionRate: Math.round(regionRejectionRate * 100),
      medianAmount: median,
      totalSimilar: typeTotal,
    },
  });
}

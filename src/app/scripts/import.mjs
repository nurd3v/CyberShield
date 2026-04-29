import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const filePath = path.join(process.cwd(), "data", "all_data.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

async function main() {
  console.log(`Начинаем импорт ${data.length} записей...`);

  const BATCH_SIZE = 500;
  let imported = 0;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);

    await prisma.application.createMany({
      data: batch.map((item) => ({
        enterprise:       item.Enterprise,
        state:            item.State,
        bidStatus:        item.BidStatus,
        subsidiesOwedSum: BigInt(item.SubsidiesOwedSum ?? 0),
        sendDate:         new Date(item.SendDate),
        subsidiesName:    item.SubsidiesName ?? "",
      })),
      skipDuplicates: true,
    });

    imported += batch.length;
    console.log(`Импортировано: ${imported} / ${data.length}`);
  }

  console.log("Импорт завершён");
}

main().catch(console.error).finally(() => prisma.$disconnect());

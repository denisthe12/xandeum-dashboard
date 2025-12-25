// scripts/fix-ports.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up database from wrong ports...');

  // 1. Получаем все ноды
  const allNodes = await prisma.pNode.findMany();
  
  let deletedCount = 0;
  let fixedCount = 0;

  for (const node of allNodes) {
    // Если порт УЖЕ 6000 - пропускаем
    if (node.ipAddress.endsWith(':6000')) {
      continue;
    }

    console.log(`Found bad port: ${node.ipAddress}`);

    // Формируем правильный адрес
    const ipOnly = node.ipAddress.split(':')[0];
    const correctAddress = `${ipOnly}:6000`;

    // Проверяем, существует ли уже нода с правильным адресом
    const existingCorrect = await prisma.pNode.findUnique({
      where: { ipAddress: correctAddress }
    });

    if (existingCorrect) {
      // Если правильная версия уже есть, просто удаляем "кривую"
      // (удаление каскадное для SQLite обычно не работает само, поэтому сначала статы)
      await prisma.nodeStats.deleteMany({
        where: { nodeId: node.id }
      });
      await prisma.pNode.delete({
        where: { id: node.id }
      });
      console.log(` -> Deleted duplicate (correct one exists)`);
      deletedCount++;
    } else {
      // Если правильной версии нет, переименовываем эту в :6000
      // Но нужно быть осторожным, вдруг там мусор. 
      // Давай лучше удалим, а краулер потом найдет нормальную. Это безопаснее.
      
      await prisma.nodeStats.deleteMany({
        where: { nodeId: node.id }
      });
      await prisma.pNode.delete({
        where: { id: node.id }
      });
      console.log(` -> Deleted bad port node`);
      deletedCount++;
    }
  }

  console.log(`\n🎉 Cleanup finished!`);
  console.log(`Deleted nodes: ${deletedCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
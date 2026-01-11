import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('기존 Chain 데이터에 displayOrder 설정 중...');

    // 모든 Chain을 code 순서로 조회
    const chains = await prisma.chain.findMany({
        orderBy: {
            code: 'asc',
        },
    });

    console.log(`총 ${chains.length}개의 Chain을 찾았습니다.`);

    // 각 Chain에 displayOrder 설정
    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        const newDisplayOrder = i + 1;

        await prisma.chain.update({
            where: { id: chain.id },
            data: { displayOrder: newDisplayOrder },
        });

        console.log(`${chain.code} (${chain.name}): displayOrder = ${newDisplayOrder}`);
    }

    console.log('완료!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

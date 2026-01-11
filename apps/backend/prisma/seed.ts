import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Team 생성
  console.log('Creating teams...');
  const team = await prisma.team.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: '포항운영팀',
      location: '포항',
      totalMembers: 9,
    },
  });
  console.log(`✅ Team created: ${team.name}`);

  // 2. Chain (모듈) 생성 - 9개
  console.log('Creating chains...');
  const chains = [
    { code: 'MQC', name: '품질관리', color: '#8114B8', displayOrder: 1 },
    { code: 'MPP', name: '조업관리', color: '#1481B8', displayOrder: 2 },
    { code: 'MLS', name: '물류관리', color: '#14B881', displayOrder: 3 },
    { code: 'MBH', name: 'D-Mega Beam', color: '#B81481', displayOrder: 4 },
    { code: 'APS', name: '공정계획', color: '#81B814', displayOrder: 5 },
    { code: 'MST', name: '검사증명서', color: '#B81414', displayOrder: 6 },
    { code: 'WGT', name: '계량', color: '#B88114', displayOrder: 7 },
    { code: 'MPR', name: '조업진행 Report', color: '#1414B8', displayOrder: 8 },
    { code: 'MCM', name: '공통관리', color: '#14B814', displayOrder: 9 },
  ];

  for (const chain of chains) {
    await prisma.chain.upsert({
      where: { code: chain.code },
      update: { displayOrder: chain.displayOrder, color: chain.color },
      create: chain,
    });
    console.log(`✅ Chain created: ${chain.name}`);
  }

  // 3. AttendanceType (출결 유형) 생성 - 8개
  console.log('Creating attendance types...');
  const attendanceTypes = [
    { code: 'ANNUAL', name: '연차', category: 'LEAVE' as const, isLongTerm: false },
    { code: 'SICK', name: '병가', category: 'LEAVE' as const, isLongTerm: false },
    { code: 'FAMILY_EVENT', name: '경조휴가', category: 'LEAVE' as const, isLongTerm: true },
    { code: 'MATERNITY', name: '출산휴가', category: 'LEAVE' as const, isLongTerm: true },
    { code: 'PARENTAL', name: '육아휴직', category: 'LEAVE' as const, isLongTerm: true },
    { code: 'TRAINING', name: '훈련', category: 'LEAVE' as const, isLongTerm: false },
    { code: 'BUSINESS_TRIP', name: '출장', category: 'BUSINESS_TRIP' as const, isLongTerm: false },
    { code: 'LONG_BUSINESS_TRIP', name: '장기출장', category: 'BUSINESS_TRIP' as const, isLongTerm: true },
  ];

  for (const type of attendanceTypes) {
    await prisma.attendanceType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
    console.log(`✅ AttendanceType created: ${type.name}`);
  }

  // 4. 사용자 생성 - 9명
  console.log('Creating users...');
  const users = [
    { email: 'admin@dongkuk.com', name: '관리자', role: 'ADMIN' as const, position: 'TEAM_LEAD' as const },
    { email: 'pyoungjin.son@dongkuk.com', name: '손병진', role: 'ADMIN' as const, position: 'TEAM_LEAD' as const },
    { email: 'yong.youn@dongkuk.com', name: '윤영', role: 'USER' as const, position: 'MANAGER' as const },
    { email: 'changgeun.lee@dongkuk.com', name: '이창근', role: 'USER' as const, position: 'MANAGER' as const },
    { email: 'ahreum.cho@dongkuk.com', name: '조아름', role: 'USER' as const, position: 'MANAGER' as const },
    { email: 'kyungbong.lee@dongkuk.com', name: '이경봉', role: 'USER' as const, position: 'STAFF' as const },
    { email: 'sunmin.hong@dongkuk.com', name: '홍순민', role: 'USER' as const, position: 'STAFF' as const },
    { email: 'juhyeon1.kim@dongkuk.com', name: '김주현', role: 'USER' as const, position: 'STAFF' as const },
    { email: 'seongho.hong@dongkuk.com', name: '홍성호', role: 'USER' as const, position: 'STAFF' as const },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash('dumes01', 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
        position: user.position,
        teamId: team.id,
      },
    });
    console.log(`✅ User created: ${user.name} (${user.email})`);
  }

  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📌 Default credentials:');
  console.log('   Admin: admin@dongkuk.com / dumes01');
  console.log('   All users: [email]@dongkuk.com / dumes01');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

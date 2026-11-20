import { PrismaClient, GradeLevel } from '@prisma/client';
import { LearningProgressService } from '../modules/learning-progress/learning-progress.service';
import { OldLearningProgressService } from './old.service';

(async () => {
  const prisma = new PrismaClient();
  const oldS = new OldLearningProgressService(prisma as any);
  const newS = new LearningProgressService(prisma as any);
  const users = await prisma.learningProgress.groupBy({ by: ['userId'] });
  const userIds = [...users.map((u) => u.userId).slice(0, 8), 999999];
  let checked = 0, mismatches = 0, tOld = 0, tNew = 0;
  for (const userId of userIds) {
    for (const grade of Object.values(GradeLevel)) {
      const topics = await prisma.topic.findMany({ where: { grade }, orderBy: { order: 'asc' }, select: { id: true } });
      let t = Date.now();
      const oldRes = await Promise.all(topics.map((x) => oldS.getTopicProgress(userId, x.id)));
      tOld += Date.now() - t; t = Date.now();
      const newRes = await newS.getTopicsProgressByGrade(userId, grade);
      tNew += Date.now() - t;
      const singles = await Promise.all(topics.map((x) => newS.getTopicProgress(userId, x.id)));
      const norm = (r: any[]) => JSON.stringify(r);
      checked += topics.length;
      if (norm(oldRes) !== norm(newRes) || norm(oldRes) !== norm(singles)) {
        mismatches++;
        console.log('MISMATCH', userId, grade, '\nold', norm(oldRes), '\nnew', norm(newRes), '\nsingle', norm(singles));
      }
    }
  }
  console.log(`users=${userIds.length} topic-results=${checked} mismatched-grades=${mismatches}`);
  console.log(`total time old=${tOld}ms batch=${tNew}ms`);
  await prisma.$disconnect();
})();

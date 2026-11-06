import { db, SANKALPA_TARGET } from './index';
import { getTodayDateString } from '../utils/date';
import type { Session, CountEvent, DailySummary, Milestone } from '../types';

export interface TapResult {
  success: boolean;
  isTargetReached: boolean;
  isMalaCompleted: boolean;
  newMilestone: Milestone | null;
  newSessionCount: number;
  newTotalCount: number;
}

export async function getLifetimeCount(): Promise<number> {
  // Lifetime count from countEvents table
  const count = await db.countEvents.count();
  return count;
}

export async function getTodaySummary(): Promise<DailySummary> {
  const today = getTodayDateString();
  const summary = await db.dailySummaries.get(today);
  if (summary) return summary;

  const settings = await db.settings.get('current_settings');
  const goalTarget = settings?.dailyGoal || 1000;

  const newSummary: DailySummary = {
    date: today,
    count: 0,
    malas: 0,
    durationSeconds: 0,
    sessionCount: 0,
    goalMet: false,
    goalTarget,
    updatedAt: Date.now(),
  };
  await db.dailySummaries.put(newSummary);
  return newSummary;
}

export async function getOrCreateActiveSession(mantraId: string, mantraName: string): Promise<Session> {
  const today = getTodayDateString();
  // Check for any active or paused session today
  const existing = await db.sessions
    .where('date')
    .equals(today)
    .filter((s) => s.status === 'active' || s.status === 'paused')
    .first();

  if (existing) {
    return existing;
  }

  const newSession: Session = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    mantraId,
    mantraName,
    startTime: Date.now(),
    durationSeconds: 0,
    count: 0,
    completedMalas: 0,
    status: 'active',
    date: today,
  };

  await db.sessions.add(newSession);
  return newSession;
}

export async function incrementRepetition(
  sessionId: string,
  mantraId: string,
  mantraName: string
): Promise<TapResult> {
  return await db.transaction(
    'rw',
    [db.countEvents, db.sessions, db.dailySummaries, db.mantras, db.milestones, db.settings],
    async () => {
      // 1. Check current lifetime count
      const lifetimeCount = await db.countEvents.count();
      if (lifetimeCount >= SANKALPA_TARGET) {
        return {
          success: false,
          isTargetReached: true,
          isMalaCompleted: false,
          newMilestone: null,
          newSessionCount: 0,
          newTotalCount: lifetimeCount,
        };
      }

      // 2. Fetch or prepare session
      let session = await db.sessions.get(sessionId);
      const today = getTodayDateString();
      if (!session) {
        session = {
          id: sessionId,
          mantraId,
          mantraName,
          startTime: Date.now(),
          durationSeconds: 0,
          count: 0,
          completedMalas: 0,
          status: 'active',
          date: today,
        };
        await db.sessions.put(session);
      }

      const nextSessionCount = session.count + 1;
      const isMalaCompleted = nextSessionCount % 108 === 0;

      // 3. Add CountEvent (source of truth)
      const event: CountEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        sessionId: session.id,
        mantraId,
        timestamp: Date.now(),
        delta: 1,
        date: today,
      };
      await db.countEvents.add(event);

      // 4. Update Session
      await db.sessions.update(session.id, {
        count: nextSessionCount,
        completedMalas: Math.floor(nextSessionCount / 108),
        endTime: Date.now(),
      });

      // 5. Update Daily Summary
      let summary = await db.dailySummaries.get(today);
      const settings = await db.settings.get('current_settings');
      const goalTarget = settings?.dailyGoal || 1000;

      if (!summary) {
        summary = {
          date: today,
          count: 1,
          malas: 0,
          durationSeconds: session.durationSeconds,
          sessionCount: 1,
          goalMet: 1 >= goalTarget,
          goalTarget,
          updatedAt: Date.now(),
        };
        await db.dailySummaries.put(summary);
      } else {
        const newCount = summary.count + 1;
        await db.dailySummaries.update(today, {
          count: newCount,
          malas: Math.floor(newCount / 108),
          goalMet: newCount >= summary.goalTarget,
          updatedAt: Date.now(),
        });
      }

      // 6. Update Mantra stats
      const mantra = await db.mantras.get(mantraId);
      if (mantra) {
        await db.mantras.update(mantraId, {
          totalCount: (mantra.totalCount || 0) + 1,
        });
      }

      // 7. Check Milestones
      const newTotal = lifetimeCount + 1;
      let newMilestone: Milestone | null = null;

      const pendingMilestones = await db.milestones.where('reached').equals(0 as any).toArray();
      for (const m of pendingMilestones) {
        if (newTotal >= m.targetCount && !m.reached) {
          await db.milestones.update(m.id, {
            reached: true,
            reachedAt: Date.now(),
          });
          newMilestone = { ...m, reached: true, reachedAt: Date.now() };
          break; // Celebrate highest reached milestone
        }
      }

      return {
        success: true,
        isTargetReached: newTotal >= SANKALPA_TARGET,
        isMalaCompleted,
        newMilestone,
        newSessionCount: nextSessionCount,
        newTotalCount: newTotal,
      };
    }
  );
}

export async function undoLastRepetition(sessionId: string): Promise<boolean> {
  return await db.transaction(
    'rw',
    [db.countEvents, db.sessions, db.dailySummaries, db.mantras],
    async () => {
      const session = await db.sessions.get(sessionId);
      if (!session || session.count <= 0) {
        return false;
      }

      // Find last count event for this session
      const lastEvent = await db.countEvents
        .where('sessionId')
        .equals(sessionId)
        .reverse()
        .first();

      if (!lastEvent) {
        return false;
      }

      // Remove the last event
      await db.countEvents.delete(lastEvent.id);

      // Decrement session
      const updatedSessionCount = Math.max(0, session.count - 1);
      await db.sessions.update(session.id, {
        count: updatedSessionCount,
        completedMalas: Math.floor(updatedSessionCount / 108),
      });

      // Decrement daily summary
      const summary = await db.dailySummaries.get(lastEvent.date);
      if (summary) {
        const updatedDailyCount = Math.max(0, summary.count - 1);
        await db.dailySummaries.update(lastEvent.date, {
          count: updatedDailyCount,
          malas: Math.floor(updatedDailyCount / 108),
          goalMet: updatedDailyCount >= summary.goalTarget,
          updatedAt: Date.now(),
        });
      }

      // Decrement mantra count
      const mantra = await db.mantras.get(lastEvent.mantraId);
      if (mantra && mantra.totalCount > 0) {
        await db.mantras.update(lastEvent.mantraId, {
          totalCount: Math.max(0, mantra.totalCount - 1),
        });
      }

      return true;
    }
  );
}

export async function updateSessionDuration(sessionId: string, additionalSeconds: number): Promise<void> {
  const session = await db.sessions.get(sessionId);
  if (!session) return;
  const newDuration = session.durationSeconds + additionalSeconds;
  await db.sessions.update(sessionId, { durationSeconds: newDuration });

  // Update daily summary duration as well
  const today = getTodayDateString();
  const summary = await db.dailySummaries.get(today);
  if (summary) {
    await db.dailySummaries.update(today, {
      durationSeconds: summary.durationSeconds + additionalSeconds,
      updatedAt: Date.now(),
    });
  }
}

export async function endSession(sessionId: string): Promise<void> {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  await db.sessions.update(sessionId, {
    status: 'completed',
    endTime: Date.now(),
  });

  // Update sessionCount in daily summary
  const today = getTodayDateString();
  const summary = await db.dailySummaries.get(today);
  if (summary) {
    const todayCompletedCount = await db.sessions
      .where('date')
      .equals(today)
      .filter((s) => s.status === 'completed')
      .count();
    await db.dailySummaries.update(today, { sessionCount: todayCompletedCount });
  }
}

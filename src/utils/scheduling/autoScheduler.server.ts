'use server';

import solverModule from 'javascript-lp-solver';
import { WeekCapacity, Shift } from '@/lib/definitions';
import {
  CandidateAssignment,
  DaySpanKey,
  ScheduleModel,
  ScheduleSolution,
  buildScheduleModel,
  buildCandidateVariableName,
  computeUnfilled,
  makeDaySpanKey,
} from './autoScheduler';

const lpSolver: any = (solverModule as any)?.default ?? (solverModule as any);

if (!lpSolver?.Solve || typeof lpSolver.Solve !== 'function') {
  throw new Error('Unable to load javascript-lp-solver.');
}

const timeToMinutes = (time: string | undefined | null): number | null => {
  if (!time) {
    return null;
  }
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
};

const minutesToTime = (value: number): string => {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const solveSchedule = async (
  candidates: CandidateAssignment[],
  capacities: WeekCapacity,
): Promise<ScheduleSolution> => {
  if (!candidates.length) {
    const coverageRatios = new Map<DaySpanKey, number>();
    return {
      assignments: [],
      unfilled: computeUnfilled(capacities, coverageRatios),
    };
  }

  const model: ScheduleModel = buildScheduleModel(candidates, capacities);
  const result = lpSolver.Solve(model);

  if (!result?.feasible) {
    return {
      assignments: [],
      unfilled: computeUnfilled(capacities, new Map()),
    };
  }

  const assignments: Shift[] = [];
  const coverageRatios = new Map<DaySpanKey, number>();
  const coverageSegments = new Map<
    DaySpanKey,
    { start: number; end: number; spanStart: number; spanEnd: number }[]
  >();

  candidates.forEach((candidate) => {
    const variableName = buildCandidateVariableName(candidate);
    const value = result[variableName];
    if (typeof value !== 'number' || value < 0.5) {
      return;
    }

    const key = makeDaySpanKey(candidate.day, candidate.spanId);
    coverageRatios.set(key, (coverageRatios.get(key) ?? 0) + candidate.coverageRatio);

    const segments = coverageSegments.get(key) ?? [];
    const coverageStartMinutes = timeToMinutes(candidate.coverageStart);
    const coverageEndMinutes = timeToMinutes(candidate.coverageEnd);
    const spanStartMinutes = timeToMinutes(candidate.span.start_time);
    const spanEndMinutes = timeToMinutes(candidate.span.end_time);

    if (
      coverageStartMinutes !== null &&
      coverageEndMinutes !== null &&
      spanStartMinutes !== null &&
      spanEndMinutes !== null
    ) {
      segments.push({
        start: coverageStartMinutes,
        end: coverageEndMinutes,
        spanStart: spanStartMinutes,
        spanEnd: spanEndMinutes,
      });
      coverageSegments.set(key, segments);
    }

    assignments.push({
      user_id: candidate.employeeId,
      date: candidate.day,
      start_time: candidate.coverageStart,
      end_time: candidate.coverageEnd,
      status: 'auto-assigned',
    });
  });

  const gapSegments = new Map<DaySpanKey, { start_time: string; end_time: string }[]>();

  coverageSegments.forEach((segments, key) => {
    if (!segments.length) {
      return;
    }

    const sorted = [...segments].sort((a, b) => a.start - b.start);
    const spanStart = sorted[0].spanStart;
    const spanEnd = sorted[0].spanEnd;
    let cursor = spanStart;
    const gaps: { start_time: string; end_time: string }[] = [];

    sorted.forEach((segment) => {
      if (segment.start > cursor) {
        gaps.push({
          start_time: minutesToTime(cursor),
          end_time: minutesToTime(segment.start),
        });
      }
      cursor = Math.max(cursor, segment.end);
    });

    if (cursor < spanEnd) {
      gaps.push({
        start_time: minutesToTime(cursor),
        end_time: minutesToTime(spanEnd),
      });
    }

    if (gaps.length) {
      gapSegments.set(key, gaps);
    }
  });

  return {
    assignments,
    unfilled: computeUnfilled(capacities, coverageRatios, gapSegments),
  };
};

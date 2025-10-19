import { format } from 'date-fns';
import { Availability, Shift, TimeSpan, WeekCapacity } from '@/lib/definitions';

export type DaySpanKey = `${string}__${number}`;

export type CandidateAssignment = {
  employeeId: string;
  day: string; // yyyy-MM-dd
  spanId: number;
  span: TimeSpan;
  coverageStart: string;
  coverageEnd: string;
  coverageRatio: number;
  fullCoverage: boolean;
};

export type ScheduleModel = {
  optimize: string;
  opType: 'max' | 'min';
  constraints: Record<string, { max?: number; equal?: number; min?: number }>;
  variables: Record<string, Record<string, number>>;
  binaries: string[];
};

export type ScheduleSolution = {
  assignments: Shift[];
  unfilled: {
    day: string;
    spanId: number;
    remaining: number;
    gaps: { start_time: string; end_time: string }[];
  }[];
};

const EMPLOYEE_FAIRNESS_WEIGHT = 0.0025;
const HOUR_PENALTY_WEIGHT = 0.001;

export const buildCandidateVariableName = (candidate: CandidateAssignment): string =>
  `x_${candidate.employeeId}_${candidate.day}_${candidate.spanId}`;

const toMinutes = (time: string | undefined | null): number | null => {
  if (!time) {
    return null;
  }
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
};

const spanDurationMinutes = (span: TimeSpan): number => {
  const start = toMinutes(span.start_time);
  const end = toMinutes(span.end_time);

  if (start === null || end === null || end <= start) {
    return 0;
  }
  return end - start;
};

const formatMinutes = (value: number): string => {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}`;
};

const computeCoverage = (availability: { start: string; end: string }, span: TimeSpan) => {
  const availabilityStart = toMinutes(availability.start);
  const availabilityEnd = toMinutes(availability.end);
  const spanStart = toMinutes(span.start_time);
  const spanEnd = toMinutes(span.end_time);

  if (
    availabilityStart === null ||
    availabilityEnd === null ||
    spanStart === null ||
    spanEnd === null
  ) {
    return null;
  }

  const coverageStart = Math.max(availabilityStart, spanStart);
  const coverageEnd = Math.min(availabilityEnd, spanEnd);

  if (coverageEnd <= coverageStart) {
    return null;
  }

  const spanDuration = spanEnd - spanStart;
  const coverageDuration = coverageEnd - coverageStart;
  const coverageRatio = spanDuration > 0 ? coverageDuration / spanDuration : 0;
  const fullCoverage = availabilityStart <= spanStart && availabilityEnd >= spanEnd;

  return {
    coverageStart,
    coverageEnd,
    coverageRatio,
    fullCoverage,
  };
};

const computeDayName = (day: Date) => format(day, 'EEEE');

export const makeDaySpanKey = (day: string, spanId: number): DaySpanKey => `${day}__${spanId}`;

export const mapAvailabilitiesToCandidates = (
  availabilities: Availability[],
  days: Date[],
  spans: TimeSpan[],
): CandidateAssignment[] => {
  const candidates: CandidateAssignment[] = [];

  availabilities.forEach((availability) => {
    const employeeId = availability.employee?.id ?? (availability as any).employee_id;
    if (!employeeId) {
      return;
    }

    days.forEach((day) => {
      const dayName = computeDayName(day);
      const dayAvailability = availability.availability?.[dayName] ?? [];
      if (!Array.isArray(dayAvailability) || dayAvailability.length === 0) {
        return;
      }

      const dayKey = format(day, 'yyyy-MM-dd');

      spans.forEach((span) => {
        dayAvailability.forEach((slot) => {
          const coverage = computeCoverage(slot, span);
          if (!coverage || coverage.coverageRatio <= 0) {
            return;
          }

          const coverageStart = formatMinutes(coverage.coverageStart);
          const coverageEnd = formatMinutes(coverage.coverageEnd);

          const alreadyAdded = candidates.some(
            (candidate) =>
              candidate.employeeId === employeeId &&
              candidate.day === dayKey &&
              candidate.spanId === span.id &&
              candidate.coverageStart === coverageStart &&
              candidate.coverageEnd === coverageEnd,
          );

          if (!alreadyAdded) {
            candidates.push({
              employeeId,
              day: dayKey,
              spanId: span.id,
              span,
              coverageStart,
              coverageEnd,
              coverageRatio: coverage.coverageRatio,
              fullCoverage: coverage.fullCoverage,
            });
          }
        });
      });
    });
  });

  return candidates;
};

export const buildScheduleModel = (
  candidates: CandidateAssignment[],
  capacities: WeekCapacity,
): ScheduleModel => {
  const constraints: ScheduleModel['constraints'] = {};
  const variables: ScheduleModel['variables'] = {};
  const binaries: string[] = [];

  const employeeFairnessIndex = new Map<string, number>();

  const ensureConstraint = (key: string, cap: number | undefined) => {
    if (cap === undefined) {
      return false;
    }

    if (!constraints[key]) {
      constraints[key] = { max: cap };
    }
    return true;
  };

  const FULL_COVERAGE_BONUS = 0.75;

  // Each variable x_employee_day_span ∈ {0,1} indicates that an employee takes a span.
  // Constraints enforce: employee max one span per day, per-day headcount cap,
  // and per-span headcount cap. Objective maximizes filled spans with bonuses for full coverage.
  candidates.forEach((candidate) => {
    const variableName = buildCandidateVariableName(candidate);
    const variable: Record<string, number> = {};

    const fairnessIndex = employeeFairnessIndex.get(candidate.employeeId) ?? 0;
    const spanMinutes = spanDurationMinutes(candidate.span);
    const coverageHours = (spanMinutes * candidate.coverageRatio) / 60;
    const baseScore = candidate.coverageRatio + (candidate.fullCoverage ? FULL_COVERAGE_BONUS : 0);
    const score = Math.max(
      0,
      baseScore - fairnessIndex * EMPLOYEE_FAIRNESS_WEIGHT - coverageHours * HOUR_PENALTY_WEIGHT,
    );

    variable.value = score;

    const employeeDayKey = `empDay_${candidate.employeeId}_${candidate.day}`;
    const perDayCap = capacities.perDay?.[candidate.day];
    const dayCapKey = `dayCap_${candidate.day}`;
    const spanCapKey = `spanCap_${makeDaySpanKey(candidate.day, candidate.spanId)}`;
    const spanCap =
      capacities.perSpan?.[candidate.day]?.[candidate.spanId] ??
      capacities.perSpan?.['*']?.[candidate.spanId];

    variable[employeeDayKey] = 1;
    if (!constraints[employeeDayKey]) {
      constraints[employeeDayKey] = { max: 1 };
    }

    if (ensureConstraint(dayCapKey, perDayCap)) {
      variable[dayCapKey] = 1;
    }

    if (ensureConstraint(spanCapKey, spanCap)) {
      variable[spanCapKey] = candidate.coverageRatio;
    }

    variables[variableName] = variable;
    binaries.push(variableName);
    employeeFairnessIndex.set(
      candidate.employeeId,
      fairnessIndex + Math.max(candidate.coverageRatio, 0.25),
    );
  });

  return {
    optimize: 'value',
    opType: 'max',
    constraints,
    variables,
    binaries,
  };
};

export const computeUnfilled = (
  capacities: WeekCapacity,
  coverageRatios: Map<DaySpanKey, number>,
  gapSegments?: Map<DaySpanKey, { start_time: string; end_time: string }[]>,
) => {
  const unfilled: {
    day: string;
    spanId: number;
    remaining: number;
    gaps: { start_time: string; end_time: string }[];
  }[] = [];

  Object.entries(capacities.perSpan ?? {}).forEach(([day, spanCapacities]) => {
    Object.entries(spanCapacities).forEach(([spanIdRaw, cap]) => {
      const spanId = Number(spanIdRaw);
      if (Number.isNaN(spanId)) {
        return;
      }

      const key = makeDaySpanKey(day, spanId);
      const assigned = coverageRatios.get(key) ?? 0;
      const remainingRaw = Math.max(0, cap - assigned);
      const remaining = Math.max(0, Math.ceil(remainingRaw - 1e-6));
      const gaps = gapSegments?.get(key) ?? [];
      if (remaining > 0 || gaps.length) {
        unfilled.push({ day, spanId, remaining, gaps });
      }
    });
  });

  return unfilled;
};

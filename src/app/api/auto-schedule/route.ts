import { NextResponse } from 'next/server';
import { CandidateAssignment, ScheduleSolution, WeekCapacity } from '@/utils/scheduling/autoScheduler';
import { solveSchedule } from '@/utils/scheduling/autoScheduler.server';

type AutoScheduleRequest = {
  candidates: CandidateAssignment[];
  capacities: WeekCapacity;
};

export async function POST(request: Request) {
  try {
    const { candidates, capacities } = (await request.json()) as AutoScheduleRequest;

    if (!Array.isArray(candidates) || !capacities) {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const solution: ScheduleSolution = await solveSchedule(candidates, capacities);
    return NextResponse.json(solution);
  } catch (error) {
    console.error('Auto schedule API error:', error);
    return NextResponse.json(
      { error: 'Unable to generate schedule.' },
      { status: 500 },
    );
  }
}


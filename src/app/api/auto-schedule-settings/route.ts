import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { AutoScheduleSettings } from '@/lib/definitions';

const DEFAULT_SETTINGS: AutoScheduleSettings = { defaultPerDay: 2 };
const SETTINGS_KEY = 'default';

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('auto_schedule_settings')
    .select('default_per_day')
    .eq('settings_key', SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    console.error('auto_schedule_settings GET error', error);
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  }

  return NextResponse.json({
    defaultPerDay:
      typeof data?.default_per_day === 'number' ? data.default_per_day : DEFAULT_SETTINGS.defaultPerDay,
  });
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const body = (await request.json()) as { defaultPerDay?: number };

  const numeric = Number(body?.defaultPerDay ?? DEFAULT_SETTINGS.defaultPerDay);
  const safeValue = Number.isFinite(numeric) ? Math.round(numeric) : DEFAULT_SETTINGS.defaultPerDay;
  const parsed = Math.max(0, safeValue);

  const { error } = await supabase
    .from('auto_schedule_settings')
    .upsert(
      {
        settings_key: SETTINGS_KEY,
        default_per_day: parsed,
      },
      { onConflict: 'settings_key' },
    );

  if (error) {
    console.error('auto_schedule_settings PUT error', error);
    return NextResponse.json({ error: 'Failed to save auto-schedule settings.' }, { status: 500 });
  }

  return NextResponse.json({ defaultPerDay: parsed });
}

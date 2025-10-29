export type DailyTimesheet = {
  date: string;
  employeeId: string;
  employeeName: string;
  totalMinutes: number;
  shifts: {
    id?: number;
    start_time?: string | null;
    end_time?: string | null;
    minutes: number;
  }[];
};

export type MonthTimesheetSummary = {
  month: string;
  dailyTimesheets: DailyTimesheet[];
};

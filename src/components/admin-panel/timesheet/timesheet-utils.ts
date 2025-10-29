import { MonthTimesheetSummary } from "@/types/timesheet"
import { differenceInMinutes } from "date-fns"
import * as XLSX from 'xlsx';

type ShiftRecord = {
  date: string
  start_time?: string | null
  end_time?: string | null
}

const normalizeTime = (time?: string | null) => {
  if (!time) return null
  const trimmed = time.trim()
  if (!trimmed) return null
  // Ensure we have HH:mm (strip seconds if present)
  const [hours, minutes] = trimmed.split(":")
  if (hours === undefined) return null
  return `${hours.padStart(2, "0")}:${(minutes ?? "00").padStart(2, "0")}`
}

export const combineDateAndTime = (date: string, time?: string | null) => {
  const normalized = normalizeTime(time)
  if (!date || !normalized) return null

  const [hours, minutes] = normalized.split(":").map(Number)

  const baseDate = new Date(date)
  if (Number.isNaN(baseDate.getTime())) {
    const isoCandidate = `${date}T${normalized}`
    const parsed = new Date(isoCandidate)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  baseDate.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return baseDate
}

export const calculateShiftMinutes = (shift: ShiftRecord) => {
  const start = combineDateAndTime(shift.date, shift.start_time)
  const end = combineDateAndTime(shift.date, shift.end_time)

  if (!start || !end) return 0

  const diff = differenceInMinutes(end, start)
  return diff > 0 ? diff : 0
}

export const formatMinutesToHours = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0h 0m"
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}
//Exports month timesheet data to an Excel file
export function exportTimesheetToExcel(
  timesheet: MonthTimesheetSummary,
  filename?: string
): void {
  if (!timesheet || !timesheet.dailyTimesheets.length) {
    console.warn('No timesheet data to export');
    return;
  }

  // Prepare data for Excel
  const excelData = timesheet.dailyTimesheets.map((daily) => ({
    Date: daily.date,
    Employee: daily.employeeName || daily.employeeId,
    'Total Hours': (daily.totalMinutes / 60).toFixed(2),
    'Total Minutes': daily.totalMinutes,
    'Number of Shifts': daily.shifts.length,
    'Shift Details': daily.shifts
      .map((shift) => {
        const hours = (shift.minutes / 60).toFixed(2);
        return `${shift.start_time || 'N/A'} - ${shift.end_time || 'N/A'} (${hours}h)`;
      })
      .join(' | '),
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 20 }, // Employee
    { wch: 12 }, // Total Hours
    { wch: 14 }, // Total Minutes
    { wch: 15 }, // Number of Shifts
    { wch: 50 }, // Shift Details
  ];

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet');

  // Generate filename
  const defaultFilename = `timesheet-${timesheet.month}.xlsx`;
  const finalFilename = filename || defaultFilename;

  // Download file
  XLSX.writeFile(workbook, finalFilename);
}

//Exports month timesheet data to Excel with summary statistics
export function exportTimesheetWithSummary(
  timesheet: MonthTimesheetSummary,
  filename?: string
): void {
  if (!timesheet || !timesheet.dailyTimesheets.length) {
    console.warn('No timesheet data to export');
    return;
  }

  // Calculate employee summaries
  const employeeSummaries = new Map<string, {
    name: string;
    totalMinutes: number;
    totalShifts: number;
    daysWorked: number;
  }>();

  timesheet.dailyTimesheets.forEach((daily) => {
    const key = daily.employeeId;
    if (!employeeSummaries.has(key)) {
      employeeSummaries.set(key, {
        name: daily.employeeName || daily.employeeId,
        totalMinutes: 0,
        totalShifts: 0,
        daysWorked: 0,
      });
    }
    const summary = employeeSummaries.get(key)!;
    summary.totalMinutes += daily.totalMinutes;
    summary.totalShifts += daily.shifts.length;
    summary.daysWorked += 1;
  });

  // Detailed timesheet data
  const detailedData = timesheet.dailyTimesheets.map((daily) => ({
    Date: daily.date,
    Employee: daily.employeeName || daily.employeeId,
    'Total Hours': (daily.totalMinutes / 60).toFixed(2),
    'Shifts': daily.shifts.length,
    'Shift Details': daily.shifts
      .map((shift) => `${shift.start_time || 'N/A'} - ${shift.end_time || 'N/A'}`)
      .join(' | '),
  }));

  // Summary data
  const summaryData = Array.from(employeeSummaries.values()).map((emp) => ({
    Employee: emp.name,
    'Total Hours': (emp.totalMinutes / 60).toFixed(2),
    'Days Worked': emp.daysWorked,
    'Total Shifts': emp.totalShifts,
    'Avg Hours/Day': (emp.totalMinutes / 60 / emp.daysWorked).toFixed(2),
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Add detailed sheet
  const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
  detailedSheet['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 50 }
  ];
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Daily Details');

  // Add summary sheet
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [
    { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Employee Summary');

  // Generate filename
  const defaultFilename = `timesheet-${timesheet.month}.xlsx`;
  const finalFilename = filename || defaultFilename;

  // Download file
  XLSX.writeFile(workbook, finalFilename);
}
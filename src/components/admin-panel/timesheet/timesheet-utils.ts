import { differenceInMinutes } from "date-fns"

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

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { addMonths, format, parse, parseISO } from "date-fns"
import { Loader2, ArrowLeft } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSupabaseData } from "@/contexts/SupabaseContext"
import { createClient } from "@/utils/supabase/client"
import { calculateShiftMinutes, combineDateAndTime, formatMinutesToHours } from "./timesheet-utils"

type EmployeeTimesheetDetailsProps = {
  employeeId: string
  month: string
}

type TimesheetShift = {
  id?: number
  date: string
  start_time?: string | null
  end_time?: string | null
  minutes: number
}

const MONTH_COUNT = 12

const generateMonthOptions = () => {
  const options: { value: string; label: string }[] = []
  let cursor = new Date()

  for (let i = 0; i < MONTH_COUNT; i += 1) {
    options.push({
      value: format(cursor, "yyyy-MM"),
      label: format(cursor, "MMMM yyyy"),
    })
    cursor = addMonths(cursor, -1)
  }

  return options
}

const normalizeMonth = (value: string) => {
  try {
    const parsed = parse(`${value}-01`, "yyyy-MM-dd", new Date())
    return format(parsed, "yyyy-MM")
  } catch {
    const fallback = addMonths(new Date(), -1)
    return format(fallback, "yyyy-MM")
  }
}

export default function EmployeeTimesheetDetails({ employeeId, month }: EmployeeTimesheetDetailsProps) {
  const router = useRouter()
  const { employees, loading: employeesLoading } = useSupabaseData()
  const monthOptions = useMemo(() => generateMonthOptions(), [])

  const [selectedMonth, setSelectedMonth] = useState(normalizeMonth(month))
  const [shifts, setShifts] = useState<TimesheetShift[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const employee = employees?.find((entry) => entry.id === employeeId)
  const employeeName = employee
    ? employee.username || `${employee.first_name} ${employee.last_name}`.trim()
    : "Employee"

  useEffect(() => {
    setSelectedMonth(normalizeMonth(month))
  }, [month])

  useEffect(() => {
    const fetchTimesheetDetails = async () => {
      setIsFetching(true)
      setError(null)

      try {
        const supabase = createClient()
        const startDate = parse(`${selectedMonth}-01`, "yyyy-MM-dd", new Date())
        const nextMonth = addMonths(startDate, 1)

        const { data, error: supabaseError } = await supabase
          .from("past_shifts")
          .select("id, date, start_time, end_time")
          .eq("user_id", employeeId)
          .gte("date", format(startDate, "yyyy-MM-dd"))
          .lt("date", format(nextMonth, "yyyy-MM-dd"))
          .order("date", { ascending: true })

        if (supabaseError) {
          throw supabaseError
        }

        const mapped: TimesheetShift[] =
          data?.map((shift) => ({
            id: shift.id,
            date: shift.date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            minutes: calculateShiftMinutes(shift),
          })) ?? []

        setShifts(mapped)
      } catch (fetchError: any) {
        setError(fetchError.message ?? "Unable to load timesheet details")
        setShifts([])
      } finally {
        setIsFetching(false)
      }
    }

    fetchTimesheetDetails()
  }, [employeeId, selectedMonth])

  const totalMinutes = useMemo(
    () => shifts.reduce((sum, shift) => sum + shift.minutes, 0),
    [shifts],
  )

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    router.push(`/timesheet/${employeeId}/${value}`)
  }

  const formatDate = (dateString: string) => {
    try {
      const parsed = parseISO(dateString)
      if (!Number.isNaN(parsed.getTime())) {
        return format(parsed, "MMM d, yyyy")
      }
    } catch {
      // fallback to manual parsing
    }
    return dateString
  }

  const formatTime = (date: string, time?: string | null) => {
    const composed = combineDateAndTime(date, time)
    if (!composed) return "—"
    return format(composed, "HH:mm")
  }

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{employeeName}</CardTitle>
            <p className="text-sm text-muted-foreground">{formatMinutesToHours(totalMinutes)} this month</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="ghost" asChild className="justify-start sm:justify-center">
              <Link href={`/timesheet`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to overview
              </Link>
            </Button>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isFetching || employeesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No shifts recorded for this month.
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map((shift) => (
                  <TableRow key={shift.id ?? `${shift.date}-${shift.start_time}`}>
                    <TableCell>{formatDate(shift.date)}</TableCell>
                    <TableCell>{formatTime(shift.date, shift.start_time)}</TableCell>
                    <TableCell>{formatTime(shift.date, shift.end_time)}</TableCell>
                    <TableCell className="text-right">{formatMinutesToHours(shift.minutes)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

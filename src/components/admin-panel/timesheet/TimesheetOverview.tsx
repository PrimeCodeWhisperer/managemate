"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format, parse, subMonths, addMonths } from "date-fns"
import { Loader2, ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSupabaseData } from "@/contexts/SupabaseContext"
import { createClient } from "@/utils/supabase/client"
import { calculateShiftMinutes, formatMinutesToHours } from "./timesheet-utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type TimesheetSummary = {
  employeeId: string
  totalMinutes: number
}

type MonthOption = {
  value: string
  label: string
}

const MONTH_COUNT = 12

const generateMonthOptions = (): MonthOption[] => {
  const options: MonthOption[] = []
  let cursor = new Date

  for (let i = 0; i < MONTH_COUNT; i += 1) {
    options.push({
      value: format(cursor, "yyyy-MM"),
      label: format(cursor, "MMMM yyyy"),
    })
    cursor = subMonths(cursor, 1)
  }

  return options
}

export default function TimesheetOverview() {
  const router = useRouter()
  const { employees, loading: employeesLoading } = useSupabaseData()
  const monthOptions = useMemo(() => generateMonthOptions(), [])
  const defaultMonth = monthOptions[0]?.value ?? format(subMonths(new Date(), 1), "yyyy-MM")

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
  const [summaries, setSummaries] = useState<TimesheetSummary[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!employees || employees.length === 0) {
      setSummaries([])
      return
    }

    const fetchTimesheets = async () => {
      setIsFetching(true)
      setError(null)

      try {
        const supabase = createClient()
        const startDate = parse(`${selectedMonth}-01`, "yyyy-MM-dd", new Date())
        const nextMonth = addMonths(startDate, 1)

        const { data, error: supabaseError } = await supabase
          .from("past_shifts")
          .select("user_id, date, start_time, end_time")
          .gte("date", format(startDate, "yyyy-MM-dd"))
          .lt("date", format(nextMonth, "yyyy-MM-dd"))

        if (supabaseError) {
          throw supabaseError
        }

        const totals = new Map<string, number>()

        data?.forEach((shift) => {
          if (!shift.user_id) return
          const minutes = calculateShiftMinutes(shift)
          totals.set(shift.user_id, (totals.get(shift.user_id) ?? 0) + minutes)
        })

        const results = employees.map((employee) => ({
          employeeId: employee.id,
          totalMinutes: totals.get(employee.id) ?? 0,
        }))

        setSummaries(results)
      } catch (fetchError: any) {
        setError(fetchError.message ?? "Unable to load timesheets")
        setSummaries([])
      } finally {
        setIsFetching(false)
      }
    }

    fetchTimesheets()
  }, [employees, selectedMonth])

  const handleViewDetails = (employeeId: string) => {
    router.push(`/timesheet/${employeeId}/${selectedMonth}`)
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find((entry) => entry.id === employeeId)
    return employee?.username ?? "Unknown"
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Monthly Overview</CardTitle>
        <div className="flex w-full sm:w-56 flex-row gap-3 items-center">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button>Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={()=>{}}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                <TableHead>Employee</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No data for selected month.
                  </TableCell>
                </TableRow>
              ) : (
                summaries.map((summary) => (
                  <TableRow key={summary.employeeId}>
                    <TableCell>{getEmployeeName(summary.employeeId)}</TableCell>
                    <TableCell>{formatMinutesToHours(summary.totalMinutes)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(summary.employeeId)}
                      >
                        View
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
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

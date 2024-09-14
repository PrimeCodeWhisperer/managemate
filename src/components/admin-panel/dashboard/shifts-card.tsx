import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock data for shifts
const mockShifts = [
  { id: 1, date: "2023-09-15", startTime: "09:00", endTime: "17:00", role: "Cashier", name: "Alice Johnson" },
  { id: 2, date: "2023-09-15", startTime: "10:00", endTime: "18:00", role: "Stock Clerk", name: "Bob Smith" },
  { id: 3, date: "2023-09-15", startTime: "08:00", endTime: "16:00", role: "Manager", name: "Charlie Brown" },
  { id: 4, date: "2023-09-15", startTime: "12:00", endTime: "20:00", role: "Cashier", name: "Diana Prince" },
]

interface ShiftScheduleCardProps {
  date: Date
}

export default function ShiftsCard({ date }: ShiftScheduleCardProps) {
  const shiftsForSelectedDate = mockShifts.filter(
    (shift) => shift.date === format(date, "yyyy-MM-dd")
  )

  return (
    <Card className=" max-w-md mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Shifts for {format(date, "MMMM d, yyyy")}</h2>
        {shiftsForSelectedDate.length > 0 ? (
          <ul className="space-y-4">
            {shiftsForSelectedDate.map((shift) => (
              <li key={shift.id} className="flex items-center space-x-4 bg-secondary p-3 rounded-md">
                <Avatar>
                  <AvatarFallback>{shift.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{shift.name}</p>
                  <p className="text-sm text-muted-foreground">{shift.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">No shifts scheduled for this date.</p>
        )}
      </CardContent>
    </Card>
  )
}
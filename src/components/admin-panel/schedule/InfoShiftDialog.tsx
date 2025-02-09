'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { format, parseISO } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { Employee, Shift } from '@/lib/definitions'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface InfoShiftDialogProps {
  isOpen: boolean
  onClose: () => void
  shift?: Shift
  employee?: Employee
}
const InfoShiftDialog: React.FC<InfoShiftDialogProps> = ({ isOpen, onClose, shift, employee }) => {
    if (!shift) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shift Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div>
            <Label>Employee</Label>
            <p className="text-sm mt-2">{employee?.name}</p>
          </div>
          <div>
            <Label>Date</Label>
            <p className="text-sm mt-2">
              {format(new Date(shift.date), 'PPP')}
            </p>
          </div>
          <div>
            <Label>Start Time</Label>
            <p className="text-sm mt-2">
              {format(parseISO(`2000-01-01T${shift.start_time}`), 'h:mm a')}
            </p>
          </div>
          <div>
            <Label>Status</Label>
            <div className="mt-2">
              <Badge variant={shift.status === 'availability' ? 'secondary' : 'default'}>
                {(shift.status ?? 'unknown').charAt(0).toUpperCase() + (shift.status ?? 'unknown').slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default InfoShiftDialog;
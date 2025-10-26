'use client'
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee, Shift } from '@/lib/definitions';
import { Label } from '@/components/ui/label';

interface ShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Shift | { user_id: string; start_time: string }) => void;
  shift?: Shift; // Optional for editing
  employees?: Employee[];
  mode: 'edit' | 'create'; // Determine the mode of the dialog
}

const ShiftDialog: React.FC<ShiftDialogProps> = ({ isOpen, onClose, onSave, employees, shift, mode }) => {
  const [employee, setEmployee] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  useEffect(() => {
    if (mode === 'edit' && shift) {
      if(shift.user_id){
        setEmployee(shift?.user_id);
      }
      if(shift.start_time){
        setStartTime(shift?.start_time);
      }
    } else {
      // Reset fields for create mode
      setEmployee('');
      setStartTime('');
      setEndTime('');
    }
  }, [shift, mode]);

  const handleSave = () => {
    if (mode === 'edit' && shift) {
      const updatedShift: Shift = {
        ...shift,
        user_id: employee,
        start_time: startTime,
      };
      onSave(updatedShift);
    } else {
      onSave({ user_id: employee, start_time: startTime });
    }
    onClose(); // Ensure the dialog closes after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Shift' : 'Custom Shift'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label>Select employee</Label>
          <Select onValueChange={setEmployee} value={employee}>
            <SelectTrigger>
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.first_name} {emp.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label>Select start time</Label>
          <Input
            type="time"
            placeholder="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          {mode === 'edit' && (
            <>
              <Label>Select end time</Label>
              <Input
                type="time"
                placeholder="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShiftDialog;
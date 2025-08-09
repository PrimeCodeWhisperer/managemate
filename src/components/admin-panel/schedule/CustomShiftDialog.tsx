'use client'
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from '@/lib/definitions';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CustomShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: { user_id: string; start_time: string ,open_shift:boolean}) => void;
  date: Date | null;
  employees?: Employee[];
}

const CustomShiftDialog: React.FC<CustomShiftDialogProps> = ({ isOpen, onClose, onSave, employees }) => {
  const [employee, setEmployee] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [isOpenShift,setIsOpenShift]=useState<boolean>(false)
  

  const handleSave = () => {
    onSave({ user_id: employee, start_time: startTime ,open_shift:isOpenShift});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom Shift</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Label>Select employee</Label>
          <Select onValueChange={setEmployee} value={employee} disabled={isOpenShift}>
            <SelectTrigger>
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees?.map((emp) => (
                <SelectItem key={emp.user_id} value={emp.user_id.toString()}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='flex items-center space-x-2'>
            <Checkbox id="open_shift" onClick={()=>{isOpenShift===false?setIsOpenShift(true):setIsOpenShift(false)}} checked={isOpenShift}/>
            <Label className=' opacity-75' htmlFor='open_shift'>Select as open shift</Label>
          </div>
          <Label>Select start time</Label>
          <Input
            type="time"
            placeholder="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          {/*//TODOIf end time is setted by settings, show also end time
          <Input
            type="time"
            placeholder="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CustomShiftDialog;
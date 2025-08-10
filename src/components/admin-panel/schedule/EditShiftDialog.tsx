'use client'
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee, Shift } from '@/lib/definitions';
import { Label } from '@/components/ui/label';
import { tree } from 'next/dist/build/templates/app-page';
import { Checkbox } from '@/components/ui/checkbox';

interface CustomShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: { user_id: string; start_time: string ,open_shift:boolean}) => void;
  shift?:Shift;
  employees?: Employee[];
}

const EditShiftDialog: React.FC<CustomShiftDialogProps> = ({ isOpen, onClose, onSave, employees,shift }) => {
  const [employee, setEmployee] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [isOpenShift, setIsOpenShift] = useState<boolean>(false);
  const [endTime, setEndTime] = useState<string>();
  const ogEmployee=shift?.user_id?shift?.user_id:'';
  const ogStartTime=shift?.start_time?shift?.start_time:'';
  const ogOpen=shift?.status==='open'?true:false;

  useEffect(() => {
    if (shift) {
      if(shift.user_id){
        setEmployee(shift?.user_id);
      }
      if(shift.start_time){
        setStartTime(shift?.start_time);
      }
      if(shift.status==='open'){
        setIsOpenShift(true);
      }
    }
  }, [shift]);

  const handleSave = () => {
    if (shift) {
      const updatedShift: Shift = {
        ...shift,
        user_id: employee,
        start_time: startTime,
      };
      onSave({ user_id: employee, start_time: startTime, open_shift: isOpenShift });
    }
    onClose(); // Ensure the dialog closes after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={()=>{onClose(),onSave({user_id: ogEmployee, start_time: ogStartTime, open_shift:ogOpen})}}>
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
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.username}
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
          <Button variant="outline" onClick={()=>{onClose;handleSave}}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditShiftDialog;
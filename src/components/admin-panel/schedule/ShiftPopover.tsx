'use client'
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon } from 'lucide-react';
import { Employee,Shift } from '@/lib/definitions';

interface Availability {
  start: string;
  end: string;
}

interface ShiftPopoverProps {
  shift: Shift;
  employee: Employee | undefined;
  availability: Availability;
  onShiftUpdate: (updatedShift: Shift, field: keyof Shift, value: string) => void;
  onShiftDelete: (shift: Shift) => void;
}

const ShiftPopover: React.FC<ShiftPopoverProps> = ({ 
  shift, 
  employee, 
  availability,
  onShiftUpdate, 
  onShiftDelete 
}) => {
  const [start, setStart] = useState(shift.start_time);
  const [end, setEnd] = useState(shift.end_time);

  const handleSave = () => {
    onShiftUpdate(shift, 'start_time', start);
    onShiftUpdate(shift, 'end_time', end);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="text-sm bg-blue-100 rounded p-1 mb-1 text-blue-800 transition-colors hover:bg-blue-200 select-none cursor-pointer">
          {employee?.name}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt={employee?.name} />
            <AvatarFallback>{employee?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <h4 className="font-semibold">{employee?.name}</h4>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Availability:</span> {availability.start} - {availability.end}
          </p>
        </div>
        
        <div className="space-y-4 mb-4">
          <h5 className="font-semibold">Shift:</h5>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">
              Save Shift
            </Button>
          </div>
        </div>
        
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onShiftDelete(shift)}
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Remove Shift
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default ShiftPopover;
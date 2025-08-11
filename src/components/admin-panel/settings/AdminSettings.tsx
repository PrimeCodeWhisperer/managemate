"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Building2, Bell, Trash2 } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { TimeSpan } from "@/lib/definitions";
import { toast } from "sonner";

const AdminSettings = () => {
  const { timeSpans, addTimeSpan, updateTimeSpan, removeTimeSpan, saveChanges } = useSettings();

  // State for business settings
  const [businessSettings, setBusinessSettings] = useState({
    businessName: "My Business",
    location: "",
    timezone: "UTC-5",
    enableNotifications: true,
    autoSchedule: false,
  });

  const handleTimeSpanChange = (
    id: number,
    field: keyof Omit<TimeSpan, "id">,
    value: string,
  ) => {
    const span = timeSpans.find((s) => s.id === id);
    if (!span) return;
    const updated = { ...span, [field]: value } as TimeSpan;
    updateTimeSpan(updated);
  };

  return (
    <div className="py-6 space-y-6  mx-auto">
      

      {/* Time Spans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Spans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeSpans.map((span) => (
              <div key={span.id} className=" flex border rounded-lg">
                <div
                  //className="grid grid-cols-4 gap-4 p-4 border rounded-lg"
                  className="grid grid-cols-3 gap-4 p-4 w-full "
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shift Name</label>
                    <Input
                      value={span.name}
                      onChange={(e) =>
                        handleTimeSpanChange(span.id, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
                    <Input
                      type="time"
                      value={span.start_time}
                      onChange={(e) =>
                        handleTimeSpanChange(
                          span.id,
                          "start_time",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="time"
                      value={span.end_time}
                      onChange={(e) =>
                        handleTimeSpanChange(span.id, "end_time", e.target.value)
                      }
                    />
                  </div>

                </div>
                <div className="flex items-end justify-end p-4">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeTimeSpan(span.id)}
                  >
                    <Trash2 className="h-6 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                addTimeSpan({ name: "", start_time: "", end_time: "" })
              }
            >
              Add Time Span
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-Schedule</h3>
                <p className="text-sm text-gray-500">
                  Automatically generate schedules based on availability
                </p>
              </div>
              <Switch
                checked={businessSettings.autoSchedule}
                onCheckedChange={(checked) =>
                  setBusinessSettings({
                    ...businessSettings,
                    autoSchedule: checked,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button className="px-6" onClick={()=>{
          saveChanges();
          toast("Settings changes saved correctly!")
          }}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;

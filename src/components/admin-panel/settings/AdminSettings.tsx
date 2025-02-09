'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Building2, Users, Bell, Shield } from 'lucide-react';

const AdminSettings = () => {
  // State for time spans
  const [timeSpans, setTimeSpans] = useState([
    { id: 1, name: 'Morning', startTime: '06:00', endTime: '14:00' },
    { id: 2, name: 'Afternoon', startTime: '14:00', endTime: '22:00' },
    { id: 3, name: 'Night', startTime: '22:00', endTime: '06:00' }
  ]);

  // State for business settings
  const [businessSettings, setBusinessSettings] = useState({
    businessName: 'My Business',
    location: '',
    timezone: 'UTC-5',
    enableNotifications: true,
    autoSchedule: false
  });

  const handleTimeSpanChange = (id: number, field: string, value: string) => {
    setTimeSpans(spans =>
      spans.map(span =>
        span.id === id ? { ...span, [field]: value } : span
      )
    );
  };

  return (
    <div className="py-6 space-y-6  mx-auto">
      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name</label>
              <Input
                value={businessSettings.businessName}
                onChange={(e) => setBusinessSettings({
                  ...businessSettings,
                  businessName: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Select
                value={businessSettings.timezone}
                onValueChange={(value) => setBusinessSettings({
                  ...businessSettings,
                  timezone: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                  <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div key={span.id} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shift Name</label>
                  <Input
                    value={span.name}
                    onChange={(e) => handleTimeSpanChange(span.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={span.startTime}
                    onChange={(e) => handleTimeSpanChange(span.id, 'startTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={span.endTime}
                    onChange={(e) => handleTimeSpanChange(span.id, 'endTime', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
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
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Notifications</h3>
                <p className="text-sm text-gray-500">Receive alerts for schedule changes and requests</p>
              </div>
              <Switch
                checked={businessSettings.enableNotifications}
                onCheckedChange={(checked) => setBusinessSettings({
                  ...businessSettings,
                  enableNotifications: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-Schedule</h3>
                <p className="text-sm text-gray-500">Automatically generate schedules based on availability</p>
              </div>
              <Switch
                checked={businessSettings.autoSchedule}
                onCheckedChange={(checked) => setBusinessSettings({
                  ...businessSettings,
                  autoSchedule: checked
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button className="px-6">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
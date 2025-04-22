
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state for user preferences
  const [preferences, setPreferences] = useState({
    timeZone: user?.preferences.timeZone || "America/New_York",
    workingHours: {
      start: user?.preferences.workingHours.start || "09:00",
      end: user?.preferences.workingHours.end || "17:00",
    },
    meetingPreferences: {
      preferredMeetingDuration: user?.preferences.meetingPreferences.preferredMeetingDuration || 30,
      bufferTime: user?.preferences.meetingPreferences.bufferTime || 15,
      preferMornings: user?.preferences.meetingPreferences.preferMornings || false,
      preferAfternoons: user?.preferences.meetingPreferences.preferAfternoons || false,
    },
    notifications: {
      email: true,
      push: true,
      reminderTime: user?.preferences.notifications.reminderTime || 15,
    }
  });

  const handleSavePreferences = () => {
    setIsLoading(true);
    
    // Simulate saving to backend
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Preferences saved",
        description: "Your scheduling preferences have been updated.",
      });
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-secondary">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-semibold">
                      {user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm">Change avatar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduling Preferences</CardTitle>
              <CardDescription>Customize how your AI assistant schedules meetings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Time Zone</h3>
                <div className="max-w-md">
                  <Select 
                    value={preferences.timeZone}
                    onValueChange={(value) => setPreferences({...preferences, timeZone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">GMT/UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Working Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workStart">Start Time</Label>
                    <Input 
                      id="workStart" 
                      type="time" 
                      value={preferences.workingHours.start} 
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        workingHours: {
                          ...preferences.workingHours,
                          start: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workEnd">End Time</Label>
                    <Input 
                      id="workEnd" 
                      type="time" 
                      value={preferences.workingHours.end} 
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        workingHours: {
                          ...preferences.workingHours,
                          end: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Meeting Preferences</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="meetingDuration">Default Meeting Duration (minutes)</Label>
                      <Select 
                        value={preferences.meetingPreferences.preferredMeetingDuration.toString()}
                        onValueChange={(value) => setPreferences({
                          ...preferences, 
                          meetingPreferences: {
                            ...preferences.meetingPreferences,
                            preferredMeetingDuration: parseInt(value)
                          }
                        })}
                      >
                        <SelectTrigger id="meetingDuration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bufferTime">Buffer Time Between Meetings (minutes)</Label>
                      <Select
                        value={preferences.meetingPreferences.bufferTime.toString()}
                        onValueChange={(value) => setPreferences({
                          ...preferences,
                          meetingPreferences: {
                            ...preferences.meetingPreferences,
                            bufferTime: parseInt(value)
                          }
                        })}
                      >
                        <SelectTrigger id="bufferTime">
                          <SelectValue placeholder="Select buffer time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="preferMornings" 
                      checked={preferences.meetingPreferences.preferMornings}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        meetingPreferences: {
                          ...preferences.meetingPreferences,
                          preferMornings: checked
                        }
                      })}
                    />
                    <Label htmlFor="preferMornings">Prefer morning meetings</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="preferAfternoons"
                      checked={preferences.meetingPreferences.preferAfternoons}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        meetingPreferences: {
                          ...preferences.meetingPreferences,
                          preferAfternoons: checked
                        }
                      })}
                    />
                    <Label htmlFor="preferAfternoons">Prefer afternoon meetings</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="emailNotifications"
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          email: checked
                        }
                      })}
                    />
                    <Label htmlFor="emailNotifications">Email notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="pushNotifications"
                      checked={preferences.notifications.push}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          push: checked
                        }
                      })}
                    />
                    <Label htmlFor="pushNotifications">Push notifications</Label>
                  </div>

                  <div>
                    <Label htmlFor="reminderTime">Default Reminder Time (minutes before meeting)</Label>
                    <Select
                      value={preferences.notifications.reminderTime.toString()}
                      onValueChange={(value) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          reminderTime: parseInt(value)
                        }
                      })}
                    >
                      <SelectTrigger id="reminderTime">
                        <SelectValue placeholder="Select reminder time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={handleSavePreferences} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;

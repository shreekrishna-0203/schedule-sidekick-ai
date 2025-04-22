
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import ChatInterface from "@/components/chat/ChatInterface";
import CalendarView from "@/components/calendar/CalendarView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to sign in if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth/sign-in" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 h-full">
        <div className="flex flex-col space-y-4 h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Welcome to ScheduleSidekick</CardTitle>
                <CardDescription>
                  Your custom scheduling assistant for calendar management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Simply chat with your assistant to schedule meetings, modify your calendar, or get information about your day.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your schedule at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-2 bg-secondary rounded-md">
                    <span className="text-2xl font-bold">3</span>
                    <span className="text-sm text-muted-foreground">Today's Meetings</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-secondary rounded-md">
                    <span className="text-2xl font-bold">8</span>
                    <span className="text-sm text-muted-foreground">This Week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 data-[state=active]:flex flex-col">
              <ChatInterface />
            </TabsContent>
            <TabsContent value="calendar" className="flex-1 data-[state=active]:flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Your Calendar</CardTitle>
                  <CardDescription>View and manage your upcoming schedule</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <CalendarView />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

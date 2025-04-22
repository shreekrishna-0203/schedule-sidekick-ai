
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Time from "@/components/Time";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Calendar, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Demo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTryFeature = (path: string) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(path);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-12 pt-8">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Demo</CardTitle>
          <CardDescription>Live demo of ScheduleSidekick features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Time />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => handleTryFeature("/dashboard")}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <MessageSquare className="h-10 w-10 text-primary my-2" />
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-muted-foreground mt-1">Chat with our intelligent scheduling assistant</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => handleTryFeature("/dashboard?tab=calendar")}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Calendar className="h-10 w-10 text-primary my-2" />
                <h3 className="font-semibold">Calendar</h3>
                <p className="text-sm text-muted-foreground mt-1">View and manage your schedule</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Try these AI assistant prompts:
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="pl-4 border-l-2 border-primary/50">
                "Schedule a team meeting for tomorrow at 2pm"
              </li>
              <li className="pl-4 border-l-2 border-primary/50">
                "What meetings do I have scheduled for this week?"
              </li>
              <li className="pl-4 border-l-2 border-primary/50">
                "Set up a project review on Friday"
              </li>
            </ul>
          </div>
          
          <Button 
            className="w-full" 
            onClick={() => handleTryFeature("/dashboard")}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Try the AI Assistant Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demo;

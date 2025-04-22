
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Time from "@/components/Time";

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-12 pt-8">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your preferences in ScheduleSidekick.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Time />
          </div>
          <p className="text-muted-foreground">Settings functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

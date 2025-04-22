
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Time from "@/components/Time";

const Demo = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-12 pt-8">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Demo</CardTitle>
          <CardDescription>Live demo of ScheduleSidekick features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Time />
          </div>
          <p>Coming soon: Live schedule assistant and examples here!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demo;

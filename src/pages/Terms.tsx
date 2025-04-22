import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Time from "@/components/Time";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-12 pt-8">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Terms &amp; Conditions</CardTitle>
          <CardDescription>The rules for using ScheduleSidekick.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Time />
          <p>
            By using ScheduleSidekick, you agree to use the app in accordance with all applicable laws and regulations. 
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your login information and for all activities that occur under your account.
          </p>
          <p>
            We reserve the right to update these terms at any time. Continued use of the app means you accept any changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;

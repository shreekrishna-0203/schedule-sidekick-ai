
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-12 pt-8">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>How we handle your information at ScheduleSidekick.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your privacy is important to us. ScheduleSidekick does not share your personal data with third parties except as required for providing our services, such as scheduling features. 
          </p>
          <p>
            We strive to protect your information and only ask for the information necessary for you to use our app. For any concerns, contact us via the Contact page.
          </p>
          <p>
            Our policies may update occasionally. Please check back to stay informed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Privacy;

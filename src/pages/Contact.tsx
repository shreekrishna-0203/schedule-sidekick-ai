
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Contact as ContactIcon } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-12 pt-8">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <ContactIcon size={24} /> Contact Us
            </span>
          </CardTitle>
          <CardDescription>
            We would love to hear from you! Reach out to us anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-base">
          <div className="flex items-center space-x-3">
            <Mail size={20} />
            <span className="break-words">skhebbarkd799@gmail.com</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-semibold">Phone:</span>
            <span>8105639425</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;

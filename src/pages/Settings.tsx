import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Time from "@/components/Time";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Sun, Moon, Bell, BellOff, Globe, Info, Mail, Phone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const [emailNotif, setEmailNotif] = useState(() => {
    const saved = localStorage.getItem("emailNotifications");
    return saved ? JSON.parse(saved) : true;
  });
  
  const [pushNotif, setPushNotif] = useState(() => {
    const saved = localStorage.getItem("pushNotifications");
    return saved ? JSON.parse(saved) : true;
  });
  
  
  const { setTheme, resolvedTheme, theme } = useTheme();
  const { toast } = useToast();
  const [timezone, setTimezone] = useState<string>("");

  useEffect(() => {
    // Get the user's timezone
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(userTimezone);
    } catch (e) {
      setTimezone("Unknown");
    }
    
    // Apply saved theme if it exists
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme has been changed to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`,
    });
  };

  const handleNotificationToggle = (type: "email" | "push", value: boolean) => {
    if (type === "email") {
      setEmailNotif(value);
      localStorage.setItem("emailNotifications", JSON.stringify(value));
    } else {
      setPushNotif(value);
      localStorage.setItem("pushNotifications", JSON.stringify(value));
    }
    
    toast({
      title: `${type === "email" ? "Email" : "Push"} Notifications ${value ? "Enabled" : "Disabled"}`,
      description: `You will ${value ? "now" : "no longer"} receive ${type} notifications.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-12 pt-8">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <CardTitle>Settings</CardTitle>
          </div>
          <CardDescription>Manage your preferences in ScheduleSidekick.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-2">
              {resolvedTheme === "dark" ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
              <Label className="font-semibold">Theme</Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => handleThemeChange("light")}
                size="sm"
                type="button"
              >
                <Sun className="w-4 h-4 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => handleThemeChange("dark")}
                size="sm"
                type="button"
              >
                <Moon className="w-4 h-4 mr-1" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => handleThemeChange("system")}
                size="sm"
                type="button"
              >
                <Globe className="w-4 h-4 mr-1" />
                System
              </Button>
            </div>
          </section>
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <Label className="font-semibold">Notifications</Label>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Switch id="emailNotif" checked={emailNotif} onCheckedChange={(value) => handleNotificationToggle("email", value)} />
                <Label htmlFor="emailNotif">Email notifications</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="pushNotif" checked={pushNotif} onCheckedChange={(value) => handleNotificationToggle("push", value)} />
                <Label htmlFor="pushNotif">Push notifications</Label>
              </div>
            </div>
          </section>
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Label className="font-semibold">Time Zone</Label>
            </div>
            <div className="text-sm pl-6 text-muted-foreground">
              <p>Your current time zone is: <span className="font-mono">{timezone}</span></p>
              <p className="text-xs mt-1">Time zone is automatically detected from your browser.</p>
            </div>
          </section>
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-muted-foreground" />
              <Label className="font-semibold">Account & Legal</Label>
            </div>
            <div className="flex flex-col gap-2 ml-6">
              <a href="/privacy" className="underline text-muted-foreground hover:text-primary">Privacy Policy</a>
              <a href="/terms" className="underline text-muted-foreground hover:text-primary">Terms & Conditions</a>
              <a href="/contact" className="underline text-muted-foreground hover:text-primary">Contact Support</a>
            </div>
          </section>
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>support: <a href="mailto:skhebbarkd799@gmail.com" className="underline">skhebbarkd799@gmail.com</a></span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span className="font-mono">8105639425</span>
            </div>
          </section>
          <div>
            <Time />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

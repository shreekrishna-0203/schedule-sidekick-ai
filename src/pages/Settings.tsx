
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Time from "@/components/Time";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Sun, Moon, Bell, BellOff, Globe, Info, Mail, Phone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";

const SettingsPage = () => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [language, setLanguage] = useState("en");
  const { setTheme, resolvedTheme } = useTheme();

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
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Label className="font-semibold">Language</Label>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Pick language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </section>
          <section>
            <div className="flex items-center gap-2 mb-2">
              {resolvedTheme === "dark" ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
              <Label className="font-semibold">Theme</Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant={resolvedTheme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                size="sm"
              >
                <Sun className="w-4 h-4 mr-1" />
                Light
              </Button>
              <Button
                variant={resolvedTheme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                size="sm"
              >
                <Moon className="w-4 h-4 mr-1" />
                Dark
              </Button>
              <Button
                variant={resolvedTheme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                size="sm"
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
                <Switch id="emailNotif" checked={emailNotif} onCheckedChange={setEmailNotif} />
                <Label htmlFor="emailNotif">Email notifications</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="pushNotif" checked={pushNotif} onCheckedChange={setPushNotif} />
                <Label htmlFor="pushNotif">Push notifications</Label>
              </div>
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

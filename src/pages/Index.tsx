import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/30">
      <header className="py-6 px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <span className="text-xl font-bold">ScheduleSidekick</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/auth/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 py-12">
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Your AI-Powered <span className="text-primary">Scheduling Assistant</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Simplify your calendar management with natural language scheduling. Just tell your AI assistant what you need, and it takes care of the details.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <Button size="lg" asChild>
                <Link to="/auth/sign-up">
                  Get Started For Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur-md opacity-50"></div>
              <div className="relative bg-card border rounded-lg shadow-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                        <path d="M9 22V12h6v10" />
                        <path d="M2 10.6L12 2l10 8.6" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold">AI Chat Interface</h2>
                  </div>
                  <div className="space-y-3 pl-12">
                    <div className="bg-accent/50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm">Schedule a call with John next week</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-lg rounded-tr-none">
                      <p className="text-sm">I'll schedule that for you. John is available on Tuesday at 10am or Thursday at 2pm. Which do you prefer?</p>
                    </div>
                    <div className="bg-accent/50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm">Thursday at 2pm works better</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-lg rounded-tr-none">
                      <p className="text-sm">Great! I've scheduled a call with John for Thursday at 2pm. I've added it to your calendar and sent an invitation to John.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ScheduleSidekick. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import TrainersPage from "@/pages/trainers-page";
import ReportsPage from "@/pages/reports-page";
import SettingsPage from "@/pages/settings-page";
import ProfilePage from "@/pages/profile-page";
import FeedbackPage from "@/pages/feedback-page";
import SubmitFeedbackPage from "@/pages/submit-feedback-page";
import HistoryPage from "@/pages/history-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/trainers" roles={["admin"]} component={TrainersPage} />
      <ProtectedRoute path="/reports" roles={["admin"]} component={ReportsPage} />
      <ProtectedRoute path="/settings" roles={["admin"]} component={SettingsPage} />
      
      {/* Trainer Routes */}
      <ProtectedRoute path="/profile" roles={["trainer"]} component={ProfilePage} />
      <ProtectedRoute path="/feedback" roles={["trainer"]} component={FeedbackPage} />
      
      {/* Trainee Routes */}
      <ProtectedRoute path="/submit-feedback" roles={["trainee"]} component={SubmitFeedbackPage} />
      <ProtectedRoute path="/history" roles={["trainee"]} component={HistoryPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

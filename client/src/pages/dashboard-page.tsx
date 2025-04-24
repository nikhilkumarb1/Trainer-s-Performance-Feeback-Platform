import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { AdminDashboard } from "@/components/admin-dashboard";
import { TrainerDashboard } from "@/components/trainer-dashboard";
import { TraineeDashboard } from "@/components/trainee-dashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  // Determine which dashboard to render based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />;
      case "trainer":
        return <TrainerDashboard />;
      case "trainee":
        return <TraineeDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  const dashboardTitle = () => {
    switch (user?.role) {
      case "admin":
        return "Dashboard Overview";
      case "trainer":
        return "Trainer Dashboard";
      case "trainee":
        return "Trainee Dashboard";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 fixed inset-y-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Header title={dashboardTitle()} />
        <main className="p-6">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

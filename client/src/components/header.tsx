import { useState } from "react";
import { Menu, Search, Bell, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarOpen && <Sidebar isMobile onClose={() => setSidebarOpen(false)} />}
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm z-10 relative">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-600 p-2 rounded-md hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="ml-3 lg:ml-0 font-semibold text-slate-700">{title}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

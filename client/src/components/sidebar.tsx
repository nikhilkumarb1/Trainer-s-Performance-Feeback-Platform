import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChevronRightIcon, 
  HomeIcon, 
  BarChart3Icon, 
  FileTextIcon, 
  UsersIcon, 
  SettingsIcon, 
  LogOutIcon,
  MessageSquareTextIcon,
  HistoryIcon,
  UserIcon,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarLink = ({ href, icon, label, isActive, onClick }: SidebarLinkProps) => (
  <li>
    <div
      onClick={() => {
        // Handle the click event manually
        if (onClick) onClick();
        window.location.href = href; // Navigate programmatically
      }}
      className={cn(
        "w-full flex items-center space-x-3 p-3 rounded-md transition cursor-pointer",
        isActive
          ? "bg-slate-700 text-white"
          : "text-slate-300 hover:bg-slate-700"
      )}
    >
      <span className="w-5">{icon}</span>
      <span>{label}</span>
    </div>
  </li>
);

export function Sidebar({ isMobile = false, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => {
    return location === path;
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <aside className="bg-slate-800 text-white h-full flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-primary rounded-md p-2">
            <BarChart3Icon className="text-white" />
          </div>
          <h1 className="text-xl font-bold">TrainerPulse</h1>
        </div>

        {/* Admin Navigation */}
        {user?.role === "admin" && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Administration
            </p>
            <ul className="space-y-2">
              <SidebarLink
                href="/"
                icon={<HomeIcon size={18} />}
                label="Dashboard"
                isActive={isActive("/")}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/trainers"
                icon={<UsersIcon size={18} />}
                label="Trainers"
                isActive={isActive("/trainers")}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/reports"
                icon={<FileTextIcon size={18} />}
                label="Reports"
                isActive={isActive("/reports")}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/settings"
                icon={<SettingsIcon size={18} />}
                label="Settings"
                isActive={isActive("/settings")}
                onClick={handleLinkClick}
              />
            </ul>
          </div>
        )}

        {/* Trainer Navigation */}
        {user?.role === "trainer" && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Trainer Portal
            </p>
            <ul className="space-y-2">
              <SidebarLink
                href="/"
                icon={<HomeIcon size={18} />}
                label="My Dashboard"
                isActive={isActive("/")}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/feedback"
                icon={<MessageSquare size={18} />}
                label="Feedback"
                isActive={isActive("/feedback")}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/profile"
                icon={<UserIcon size={18} />}
                label="Profile"
                isActive={isActive("/profile")}
                onClick={handleLinkClick}
              />
            </ul>
          </div>
        )}

        {/* Trainee Navigation */}
        {user?.role === "trainee" && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Trainee Portal
            </p>
            <ul className="space-y-2">
              <SidebarLink
                href="/"
                icon={<HomeIcon size={18} />}
                label="Home"
                isActive={isActive("/")}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/submit-feedback"
                icon={<MessageSquareTextIcon size={18} />}
                label="Submit Feedback"
                isActive={isActive("/submit-feedback")}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/history"
                icon={<HistoryIcon size={18} />}
                label="My Feedback"
                isActive={isActive("/history")}
                onClick={handleLinkClick}
              />
            </ul>
          </div>
        )}
      </div>

      <div className="mt-auto p-6 pt-6 border-t border-slate-700">
        <div className="flex items-center space-x-3 p-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="font-semibold text-white">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.fullName}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-2 w-full flex items-center justify-center space-x-2 p-2 rounded-md text-slate-300 hover:bg-slate-700 transition"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOutIcon size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}

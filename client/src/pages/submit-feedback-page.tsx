import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { FeedbackForm } from "@/components/feedback-form";

export default function SubmitFeedbackPage() {
  const { user } = useAuth();
  const search = useSearch();
  const sessionId = search ? new URLSearchParams(search).get("sessionId") : null;
  const parsedSessionId = sessionId ? parseInt(sessionId) : undefined;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 fixed inset-y-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Header title="Submit Feedback" />
        <main className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Submit Training Feedback</h1>
              <p className="text-slate-500">Help us improve our training programs by sharing your experience</p>
            </div>

            <FeedbackForm sessionId={parsedSessionId} />

            {/* Additional Guidance Section */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Feedback Guidelines</h3>
              <ul className="list-disc pl-5 space-y-2 text-blue-700">
                <li>Be specific about what worked well and what could be improved</li>
                <li>Focus on the training content and delivery, not personal characteristics</li>
                <li>Provide constructive suggestions where possible</li>
                <li>Rate each category based on your honest experience</li>
                <li>Your feedback directly helps trainers improve their sessions</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

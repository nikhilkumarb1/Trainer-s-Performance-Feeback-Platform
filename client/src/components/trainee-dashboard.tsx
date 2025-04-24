import { useQuery } from "@tanstack/react-query";
import { Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getSentimentBgClass } from "@/lib/sentiment-analysis";

export function TraineeDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-4 text-red-500">
        Error loading dashboard data
      </div>
    );
  }

  const { sessions, submittedFeedback } = data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Trainee Dashboard</h1>
        <p className="text-slate-500">View your training sessions and submitted feedback</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Available Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Training sessions that need your feedback</p>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((session: any) => (
                  <div key={session.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">{session.title || 'Untitled Session'}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(session.date).toLocaleDateString("en-US", { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <Link href={`/submit-feedback?sessionId=${session.id}`}>
                        <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10">
                          Rate Session
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500">
                No upcoming sessions
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/submit-feedback">
                <Button variant="outline" className="w-full">View All Sessions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Your Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Recent feedback you've submitted</p>
            {submittedFeedback && submittedFeedback.length > 0 ? (
              <div className="space-y-3">
                {submittedFeedback.slice(0, 3).map((feedback: any) => {
                  const sentimentCategory = 
                    feedback.sentimentScore >= 70 ? 'positive' : 
                    feedback.sentimentScore >= 40 ? 'neutral' : 'negative';
                  
                  return (
                    <div key={feedback.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800">Session #{feedback.sessionId}</p>
                            <div className={`px-2 py-0.5 text-xs rounded-full ${getSentimentBgClass(sentimentCategory)}`}>
                              {sentimentCategory.charAt(0).toUpperCase() + sentimentCategory.slice(1)}
                            </div>
                          </div>
                          <div className="flex mt-1 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="text-amber-400">
                                {i < feedback.overallRating ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                  </svg>
                                )}
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            {new Date(feedback.createdAt).toLocaleDateString("en-US", { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500">
                No feedback submitted yet
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/history">
                <Button variant="outline" className="w-full">View Your Feedback History</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to action */}
      <Card className="bg-gradient-to-r from-primary/90 to-primary text-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold">Ready to share your feedback?</h3>
              <p className="text-white/90 mt-2">
                Your feedback helps trainers improve and enhances the training experience for everyone.
              </p>
            </div>
            <Link href="/submit-feedback">
              <Button className="w-full md:w-auto bg-white text-primary hover:bg-white/90 hover:text-primary">
                Submit Feedback
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

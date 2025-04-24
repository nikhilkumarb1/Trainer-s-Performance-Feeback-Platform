import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { getSentimentBgClass } from "@/lib/sentiment-analysis";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  History,
  Loader2,
  Filter,
  Star,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Link } from "wouter";

export default function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [viewingFeedback, setViewingFeedback] = useState<any>(null);

  // Fetch feedback history for trainee
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["/api/feedback/trainee"],
    enabled: !!user,
  });

  // Filter feedback based on time period
  const getFilteredFeedback = () => {
    if (!feedbackData) return [];

    let filtered = [...feedbackData];

    // Filter by rating
    if (activeTab === "high") {
      filtered = filtered.filter((item) => item.overallRating >= 4);
    } else if (activeTab === "medium") {
      filtered = filtered.filter((item) => item.overallRating >= 2 && item.overallRating < 4);
    } else if (activeTab === "low") {
      filtered = filtered.filter((item) => item.overallRating < 2);
    }

    // Filter by time period
    if (filterPeriod !== "all") {
      const now = new Date();
      const cutoff = new Date();

      if (filterPeriod === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else if (filterPeriod === "month") {
        cutoff.setMonth(now.getMonth() - 1);
      } else if (filterPeriod === "quarter") {
        cutoff.setMonth(now.getMonth() - 3);
      }

      filtered = filtered.filter(
        (item) => new Date(item.createdAt) >= cutoff
      );
    }

    return filtered;
  };

  const filteredFeedback = getFilteredFeedback();

  // Calculate metrics
  const calculateMetrics = () => {
    if (!feedbackData || feedbackData.length === 0) {
      return {
        total: 0,
        avgRating: 0,
        sessions: 0,
        recent: 0
      };
    }

    const total = feedbackData.length;
    const avgRating = parseFloat(
      (
        feedbackData.reduce((acc, item) => acc + item.overallRating, 0) / total
      ).toFixed(1)
    );

    // Count unique session IDs
    const uniqueSessions = new Set(feedbackData.map(item => item.sessionId)).size;

    // Count recent feedback (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const recent = feedbackData.filter(
      item => new Date(item.createdAt) >= thirtyDaysAgo
    ).length;

    return {
      total,
      avgRating,
      sessions: uniqueSessions,
      recent
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 fixed inset-y-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Header title="Feedback History" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Your Feedback History</h1>
            <p className="text-slate-500">View all the feedback you've submitted for training sessions</p>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{metrics.total}</div>
                  <p className="text-sm text-slate-500">Total Feedback</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{metrics.avgRating}</div>
                  <p className="text-sm text-slate-500">Avg. Rating Given</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{metrics.sessions}</div>
                  <p className="text-sm text-slate-500">Sessions Rated</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{metrics.recent}</div>
                  <p className="text-sm text-slate-500">Last 30 Days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback History List */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Feedback History</CardTitle>
                  <CardDescription>
                    Review all the feedback you've provided
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <Select
                    value={filterPeriod}
                    onValueChange={setFilterPeriod}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Ratings</TabsTrigger>
                  <TabsTrigger value="high">High (4-5)</TabsTrigger>
                  <TabsTrigger value="medium">Medium (2-3)</TabsTrigger>
                  <TabsTrigger value="low">Low (0-1)</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredFeedback && filteredFeedback.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Sentiment</TableHead>
                            <TableHead>Comments</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredFeedback.map((feedback) => {
                            const sentimentCategory =
                              feedback.sentimentScore >= 70
                                ? "positive"
                                : feedback.sentimentScore >= 40
                                ? "neutral"
                                : "negative";

                            return (
                              <TableRow key={feedback.id}>
                                <TableCell>
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  Session #{feedback.sessionId}
                                </TableCell>
                                <TableCell>
                                  <div className="flex text-amber-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < feedback.overallRating
                                            ? "fill-current"
                                            : ""
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div
                                    className={`px-2 py-1 text-xs rounded-full inline-block ${getSentimentBgClass(
                                      sentimentCategory
                                    )}`}
                                  >
                                    {sentimentCategory.charAt(0).toUpperCase() +
                                      sentimentCategory.slice(1)}
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {feedback.comments || "No comments"}
                                </TableCell>
                                <TableCell>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewingFeedback(feedback)}
                                      >
                                        View Details
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Feedback Details</DialogTitle>
                                        <DialogDescription>
                                          Session #{viewingFeedback?.sessionId} | 
                                          {viewingFeedback && new Date(viewingFeedback.createdAt).toLocaleDateString()}
                                        </DialogDescription>
                                      </DialogHeader>
                                      {viewingFeedback && (
                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="font-medium text-sm">Overall Rating</h4>
                                            <div className="flex text-amber-400 mt-1">
                                              {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`h-5 w-5 ${
                                                    i < viewingFeedback.overallRating
                                                      ? "fill-current"
                                                      : ""
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="font-medium text-sm">Knowledge</h4>
                                              <div className="flex text-amber-400 mt-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                      i < viewingFeedback.knowledgeRating
                                                        ? "fill-current"
                                                        : ""
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="font-medium text-sm">Communication</h4>
                                              <div className="flex text-amber-400 mt-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                      i < viewingFeedback.communicationRating
                                                        ? "fill-current"
                                                        : ""
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="font-medium text-sm">Materials</h4>
                                              <div className="flex text-amber-400 mt-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                      i < viewingFeedback.materialsRating
                                                        ? "fill-current"
                                                        : ""
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="font-medium text-sm">Engagement</h4>
                                              <div className="flex text-amber-400 mt-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                      i < viewingFeedback.engagementRating
                                                        ? "fill-current"
                                                        : ""
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          </div>

                                          <div>
                                            <h4 className="font-medium text-sm">Feedback Comments</h4>
                                            <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                                              {viewingFeedback.comments || "No comments provided"}
                                            </p>
                                          </div>

                                          {viewingFeedback.strengths && viewingFeedback.strengths.length > 0 && (
                                            <div>
                                              <h4 className="font-medium text-sm">Strengths</h4>
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                {viewingFeedback.strengths.map((strength: string, i: number) => (
                                                  <div
                                                    key={i}
                                                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                                                  >
                                                    {strength}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {viewingFeedback.improvements && viewingFeedback.improvements.length > 0 && (
                                            <div>
                                              <h4 className="font-medium text-sm">Areas for Improvement</h4>
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                {viewingFeedback.improvements.map((improvement: string, i: number) => (
                                                  <div
                                                    key={i}
                                                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                                                  >
                                                    {improvement}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center">
                                              <div
                                                className={`px-2 py-1 text-xs rounded-full ${getSentimentBgClass(
                                                  viewingFeedback.sentimentScore >= 70
                                                    ? 'positive'
                                                    : viewingFeedback.sentimentScore >= 40
                                                    ? 'neutral'
                                                    : 'negative'
                                                )}`}
                                              >
                                                Sentiment Score: {viewingFeedback.sentimentScore}%
                                              </div>
                                            </div>
                                            <div className="flex items-center">
                                              <Calendar className="h-4 w-4 text-slate-400 mr-1" />
                                              <span className="text-xs text-slate-500">
                                                {new Date(viewingFeedback.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No feedback history found</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {activeTab !== "all"
                          ? `No ${activeTab}-rated feedback available for the selected period`
                          : "You haven't submitted any feedback yet for the selected period"}
                      </p>
                      <Link href="/submit-feedback">
                        <Button className="mt-4">Submit Feedback</Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <div className="mt-8 bg-gradient-to-r from-primary/90 to-primary text-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-3">Why Your Feedback Matters</h3>
            <p className="mb-4">
              Your honest feedback is crucial for improving our training programs and helping trainers develop their skills.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Helps Trainers Improve</h4>
                <p className="text-sm text-white/80">Your feedback provides valuable insights that help trainers enhance their teaching methods.</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Enhances Content Quality</h4>
                <p className="text-sm text-white/80">Your ratings and comments guide us in refining training materials and curriculum.</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Shapes Future Training</h4>
                <p className="text-sm text-white/80">Your input directly influences the design and delivery of upcoming training sessions.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

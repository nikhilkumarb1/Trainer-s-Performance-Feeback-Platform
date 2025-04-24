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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Download, Calendar, Loader2, BarChart2 } from "lucide-react";

// Sample data for reports
const monthlyData = [
  { month: "Jan", avgRating: 4.1, totalFeedback: 87 },
  { month: "Feb", avgRating: 4.0, totalFeedback: 105 },
  { month: "Mar", avgRating: 4.2, totalFeedback: 125 },
  { month: "Apr", avgRating: 4.3, totalFeedback: 150 },
  { month: "May", avgRating: 4.2, totalFeedback: 142 },
  { month: "Jun", avgRating: 4.5, totalFeedback: 172 },
];

const categoryData = [
  { category: "Knowledge", avg: 4.6 },
  { category: "Communication", avg: 4.8 },
  { category: "Materials", avg: 4.2 },
  { category: "Engagement", avg: 4.5 },
];

const departmentData = [
  { department: "Engineering", avgRating: 4.7, feedbackCount: 325 },
  { department: "Sales", avgRating: 4.3, feedbackCount: 210 },
  { department: "HR", avgRating: 4.5, feedbackCount: 175 },
  { department: "Marketing", avgRating: 4.2, feedbackCount: 150 },
  { department: "IT", avgRating: 4.4, feedbackCount: 205 },
];

export default function ReportsPage() {
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["/api/feedback"],
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 fixed inset-y-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Header title="Performance Reports" />
        <main className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
              <p className="text-slate-500">
                Analyze trainer performance and feedback trends
              </p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>

          {/* Date Range Selector */}
          <Card className="mb-6">
            <CardContent className="p-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Time Period:</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Last 30 Days
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  Last Quarter
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  Last Year
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  Custom Range
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overall Metrics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trends</CardTitle>
                <CardDescription>
                  Average rating and feedback volume over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" domain={[3.5, 5]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 200]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgRating"
                      name="Average Rating"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalFeedback"
                      name="Total Feedback"
                      stroke="#8b5cf6"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Ratings by Category</CardTitle>
                <CardDescription>
                  Average ratings across different evaluation categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="avg"
                      name="Average Rating"
                      fill="#3b82f6"
                      minPointSize={5}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>
                Compare performance across different departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Trainers</TableHead>
                      <TableHead>Avg. Rating</TableHead>
                      <TableHead>Feedback Count</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentData.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{2 + index}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span>{dept.avgRating.toFixed(1)}</span>
                            <BarChart2 className="h-4 w-4 ml-2 text-amber-500" />
                          </div>
                        </TableCell>
                        <TableCell>{dept.feedbackCount}</TableCell>
                        <TableCell>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${(dept.avgRating / 5) * 100}%` }}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>
                Latest feedback from training sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : feedbackData && feedbackData.length > 0 ? (
                <div className="space-y-4">
                  {feedbackData.slice(0, 5).map((feedback: any) => {
                    const sentimentCategory =
                      feedback.sentimentScore >= 70
                        ? "positive"
                        : feedback.sentimentScore >= 40
                        ? "neutral"
                        : "negative";

                    return (
                      <div
                        key={feedback.id}
                        className="p-4 border border-slate-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-medium">
                                {feedback.sessionId || "S"}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-slate-700">
                                  Session #{feedback.sessionId}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Trainee #{feedback.traineeId} •{" "}
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex mt-2 text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="text-amber-400">
                                  {i < feedback.overallRating ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                      />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 text-xs rounded-full ${getSentimentBgClass(
                              sentimentCategory
                            )}`}
                          >
                            {sentimentCategory.charAt(0).toUpperCase() +
                              sentimentCategory.slice(1)}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                          {feedback.comments || "No comments provided"}
                        </p>
                        {feedback.strengths && feedback.strengths.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {feedback.strengths.map((strength: string, i: number) => (
                              <div
                                key={i}
                                className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                              >
                                {strength}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No feedback data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

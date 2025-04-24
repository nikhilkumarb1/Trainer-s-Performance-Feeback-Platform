import { useQuery } from "@tanstack/react-query";
import { 
  Presentation, 
  MessageSquare, 
  ChevronUp, 
  ChevronDown,
  Star,
  Smile
} from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getSentimentBgClass, calculateSentimentDistribution, sentimentDistributionToChartData } from "@/lib/sentiment-analysis";
import { Link } from "wouter";

// Sample data for charts
const monthlyData = [
  { name: 'Jan', avgRating: 4.1, sentimentScore: 68 },
  { name: 'Feb', avgRating: 4.0, sentimentScore: 65 },
  { name: 'Mar', avgRating: 4.2, sentimentScore: 71 },
  { name: 'Apr', avgRating: 4.3, sentimentScore: 75 },
  { name: 'May', avgRating: 4.2, sentimentScore: 72 },
  { name: 'Jun', avgRating: 4.5, sentimentScore: 78 }
];

export function AdminDashboard() {
  const { data, isLoading, error } = useQuery<{
    metrics: {
      totalTrainers: number;
      totalFeedback: number;
      avgRating: number;
      sentimentScore: number;
    };
    trainers: any[];
    feedback: any[];
    sessions: any[];
  }>({
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

  const { metrics, trainers, feedback } = data;
  // Calculate sentiment distribution from feedback data, or use empty if no data
  const sentimentDistribution = calculateSentimentDistribution(feedback || []);
  const sentimentChartData = sentimentDistributionToChartData(sentimentDistribution);
  
  // Ensure we have some data for charts even if there's no feedback yet
  const hasFeedbackData = feedback && feedback.length > 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500">Monitor training performance across your organization</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Trainers</p>
                <p className="text-2xl font-bold text-slate-800">{metrics?.totalTrainers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary">
                <Presentation className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" /> 8%
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Feedback</p>
                <p className="text-2xl font-bold text-slate-800">{metrics?.totalFeedback || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" /> 12%
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Avg. Rating</p>
                <p className="text-2xl font-bold text-slate-800">{metrics?.avgRating || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium flex items-center">
                <ChevronDown className="h-4 w-4 mr-1" /> 3%
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Sentiment Score</p>
                <p className="text-2xl font-bold text-slate-800">{metrics?.sentimentScore || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">
                <Smile className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" /> 5%
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Performance Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Monthly Performance Trends</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                  Monthly
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:bg-slate-100">
                  Quarterly
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:bg-slate-100">
                  Yearly
                </Button>
              </div>
            </div>
            <div className="h-64">
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
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" domain={[3.5, 5]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
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
                    dataKey="sentimentScore" 
                    name="Sentiment Score" 
                    stroke="#8b5cf6" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Sentiment Analysis */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Feedback Sentiment Analysis</h2>
              <Button variant="link" size="sm" className="text-primary hover:text-primary-dark">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </Button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Trainers */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Top Performing Trainers</h2>
            <Link href="/trainers">
              <Button variant="link" className="text-primary hover:underline">
                View All Trainers
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Trainer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Sentiment</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Feedback</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trainers && trainers.length > 0 ? (
                  trainers.map((trainer: any, index: number) => {
                    // Calculate trainer metrics (in a real application, this would come from the backend)
                    const trainerRating = 4.9 - (index * 0.2);
                    const sentimentScore = 92 - (index * 5);
                    const feedbackCount = 247 - (index * 30);
                    
                    // Get color classes based on sentiment
                    const initials = trainer.fullName
                      ? trainer.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                      : "TR";

                    return (
                      <tr key={trainer.id}>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full bg-${index === 0 ? 'orange' : index === 1 ? 'blue' : 'purple'}-100 text-${index === 0 ? 'orange' : index === 1 ? 'blue' : 'purple'}-600 flex items-center justify-center font-medium`}>
                              {initials}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-slate-700">{trainer.fullName || 'Unnamed Trainer'}</p>
                              <p className="text-xs text-slate-500">{trainer.specialty || 'General Training'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{trainer.department || 'Unknown'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-slate-700">{trainerRating.toFixed(1)}</span>
                            <div className="ml-2 flex text-amber-400">
                              {Array(5).fill(0).map((_, i) => (
                                <Star key={i} className="h-3 w-3" fill="currentColor" />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`${sentimentScore >= 80 ? 'bg-green-500' : sentimentScore >= 60 ? 'bg-amber-500' : 'bg-red-500'} rounded-full h-2`} 
                                style={{ width: `${sentimentScore}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs font-medium text-slate-600">{sentimentScore}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{feedbackCount}</td>
                        <td className="py-3 px-4">
                          <Button variant="link" className="text-primary hover:text-primary-dark">
                            View Report
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">No trainers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Feedback</h2>
            <Link href="/reports">
              <Button variant="link" className="text-primary hover:underline">
                View All Feedback
              </Button>
            </Link>
          </div>
          {feedback && feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.slice(0, 3).map((item: any, index: number) => {
                // In a real app, we'd have more data from the backend
                const trainerInitials = ["RL", "AP", "MM"][index % 3];
                const trainerName = ["Robert Lee", "Alicia Patel", "Michael Martinez"][index % 3];
                const sessionTitle = ["Technical Workshop", "Communication Skills", "Leadership Fundamentals"][index % 3];
                const daysAgo = index + 2;
                
                const sentimentCategory = 
                  item.sentimentScore >= 70 ? 'positive' : 
                  item.sentimentScore >= 40 ? 'neutral' : 'negative';
                
                const bgColorClass = 
                  index % 3 === 0 ? "bg-green-100 text-green-600" : 
                  index % 3 === 1 ? "bg-purple-100 text-purple-600" : 
                  "bg-blue-100 text-blue-600";

                return (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full ${bgColorClass} flex items-center justify-center font-medium`}>
                            {trainerInitials}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-700">{sessionTitle}</p>
                            <p className="text-xs text-slate-500">Trainer: {trainerName} • {daysAgo} days ago</p>
                          </div>
                        </div>
                        <div className="flex mt-2 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-amber-400">
                              {i < item.overallRating ? (
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
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${getSentimentBgClass(sentimentCategory)}`}>
                        {sentimentCategory.charAt(0).toUpperCase() + sentimentCategory.slice(1)}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{item.comments || 'No comments provided'}</p>
                    {item.strengths && item.strengths.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.strengths.map((strength: string, i: number) => (
                          <div key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
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
            <div className="text-center p-8 text-slate-500">
              No feedback data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

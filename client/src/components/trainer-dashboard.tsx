import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Smile, 
  ChevronUp, 
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Bot
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { calculateSentimentDistribution, getSentimentBgClass, sentimentDistributionToChartData } from "@/lib/sentiment-analysis";

export function TrainerDashboard() {
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

  const { metrics, feedback } = data;
  const sentimentDistribution = calculateSentimentDistribution(feedback || []);
  const sentimentChartData = sentimentDistributionToChartData(sentimentDistribution);

  // Calculate skill ratings
  const calculateSkillAverage = (skillKey: string) => {
    if (!feedback || feedback.length === 0) return 0;
    const sum = feedback.reduce((acc: number, item: any) => acc + item[skillKey], 0);
    return parseFloat((sum / feedback.length).toFixed(1));
  };

  const skillRatings = {
    knowledge: calculateSkillAverage('knowledgeRating'),
    communication: calculateSkillAverage('communicationRating'),
    materials: calculateSkillAverage('materialsRating'),
    engagement: calculateSkillAverage('engagementRating')
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Trainer Dashboard</h1>
        <p className="text-slate-500">Track your performance and feedback</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Overall Rating</p>
                <p className="text-2xl font-bold text-slate-800">{metrics?.avgRating || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" /> 0.2
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Sessions Completed</p>
                <p className="text-2xl font-bold text-slate-800">{metrics?.totalSessions || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" /> 4
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Feedbacks</p>
                <p className="text-2xl font-bold text-slate-800">{metrics?.totalFeedback || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" /> 32
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
                <ChevronUp className="h-4 w-4 mr-1" /> 3%
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Rating Breakdown */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Rating Breakdown</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-slate-600 w-16">5 Stars</span>
                    <div className="w-full bg-slate-200 rounded-full h-2 ml-2">
                      <div className="bg-amber-400 rounded-full h-2" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 ml-2">65%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-slate-600 w-16">4 Stars</span>
                    <div className="w-full bg-slate-200 rounded-full h-2 ml-2">
                      <div className="bg-amber-400 rounded-full h-2" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 ml-2">20%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-slate-600 w-16">3 Stars</span>
                    <div className="w-full bg-slate-200 rounded-full h-2 ml-2">
                      <div className="bg-amber-400 rounded-full h-2" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 ml-2">10%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-slate-600 w-16">2 Stars</span>
                    <div className="w-full bg-slate-200 rounded-full h-2 ml-2">
                      <div className="bg-amber-400 rounded-full h-2" style={{ width: "3%" }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 ml-2">3%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-slate-600 w-16">1 Star</span>
                    <div className="w-full bg-slate-200 rounded-full h-2 ml-2">
                      <div className="bg-amber-400 rounded-full h-2" style={{ width: "2%" }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 ml-2">2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Sentiment Analysis</h2>
            <div className="flex items-center justify-center h-48">
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 p-2 rounded-md">
                <p className="text-xs font-medium text-slate-600">Positive</p>
                <p className="text-lg font-bold text-green-600">
                  {Math.round((sentimentDistribution.positive / Math.max(1, Object.values(sentimentDistribution).reduce((a, b) => a + b, 0))) * 100)}%
                </p>
              </div>
              <div className="bg-amber-50 p-2 rounded-md">
                <p className="text-xs font-medium text-slate-600">Neutral</p>
                <p className="text-lg font-bold text-amber-600">
                  {Math.round((sentimentDistribution.neutral / Math.max(1, Object.values(sentimentDistribution).reduce((a, b) => a + b, 0))) * 100)}%
                </p>
              </div>
              <div className="bg-red-50 p-2 rounded-md">
                <p className="text-xs font-medium text-slate-600">Negative</p>
                <p className="text-lg font-bold text-red-600">
                  {Math.round((sentimentDistribution.negative / Math.max(1, Object.values(sentimentDistribution).reduce((a, b) => a + b, 0))) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Rating */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Skills Evaluation</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-600">Knowledge & Expertise</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-amber-400">
                        {i < Math.floor(skillRatings.knowledge) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ) : i < skillRatings.knowledge ? (
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
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: `${(skillRatings.knowledge / 5) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-600">Communication Skills</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-amber-400">
                        {i < Math.floor(skillRatings.communication) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ) : i < skillRatings.communication ? (
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
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: `${(skillRatings.communication / 5) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-600">Training Materials</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-amber-400">
                        {i < Math.floor(skillRatings.materials) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ) : i < skillRatings.materials ? (
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
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: `${(skillRatings.materials / 5) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-600">Engagement & Interaction</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-amber-400">
                        {i < Math.floor(skillRatings.engagement) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ) : i < skillRatings.engagement ? (
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
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: `${(skillRatings.engagement / 5) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3">
              <Bot className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-800">AI-Generated Insights</h2>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-4">Based on your recent feedback, here are some insights and recommendations:</p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="mt-1 text-green-500 mr-3">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-700"><span className="font-medium">Strength:</span> Your communication skills are consistently rated highly. Trainees appreciate your clear explanations and approachable teaching style.</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1 text-green-500 mr-3">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-700"><span className="font-medium">Strength:</span> Your real-world examples are frequently mentioned as being valuable. Continue integrating these into your sessions.</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1 text-amber-500 mr-3">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-700"><span className="font-medium">Improvement:</span> Some participants mentioned that the pace of sessions could be adjusted. Consider incorporating more check-ins to ensure everyone is following along.</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1 text-amber-500 mr-3">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-700"><span className="font-medium">Improvement:</span> Training materials could benefit from more visual aids. Consider enhancing slide decks with diagrams and illustrations.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Feedback</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          {feedback && feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Training Session</p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("en-US", { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex mt-1 text-amber-400">
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
                    <div className={`px-2 py-1 text-xs rounded-full h-fit ${getSentimentBgClass(
                      item.sentimentScore >= 70 ? 'positive' : 
                      item.sentimentScore >= 40 ? 'neutral' : 
                      'negative'
                    )}`}>
                      {item.sentimentScore >= 70 ? 'Positive' : 
                       item.sentimentScore >= 40 ? 'Neutral' : 
                       'Negative'}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{item.comments}</p>
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
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-slate-500">
              No feedback received yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

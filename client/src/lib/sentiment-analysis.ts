// Basic sentiment analysis helper functions for client-side use

// Define sentiment categories
export type SentimentCategory = 'positive' | 'neutral' | 'negative';

// Calculate sentiment category based on score (0-100)
export function getSentimentCategory(score: number): SentimentCategory {
  if (score >= 70) return 'positive';
  if (score >= 40) return 'neutral';
  return 'negative';
}

// Get background color class for sentiment badges
export function getSentimentBgClass(sentiment: SentimentCategory): string {
  switch (sentiment) {
    case 'positive': return 'bg-green-100 text-green-800';
    case 'neutral': return 'bg-amber-100 text-amber-800';
    case 'negative': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Get color for charts based on sentiment
export function getSentimentChartColor(sentiment: SentimentCategory): string {
  switch (sentiment) {
    case 'positive': return '#10b981'; // Success green
    case 'neutral': return '#f59e0b'; // Warning amber
    case 'negative': return '#ef4444'; // Error red
    default: return '#94a3b8'; // Gray
  }
}

// Calculate sentiments distribution from feedback array
export function calculateSentimentDistribution(feedbackItems: any[]): { 
  positive: number; 
  neutral: number; 
  negative: number; 
} {
  const result = { positive: 0, neutral: 0, negative: 0 };
  
  if (!feedbackItems || feedbackItems.length === 0) {
    return result;
  }
  
  feedbackItems.forEach(item => {
    if (!item.sentimentScore && item.sentimentScore !== 0) return;
    
    const category = getSentimentCategory(item.sentimentScore);
    result[category]++;
  });
  
  return result;
}

// Format sentiment distribution as percentages for display
export function formatSentimentPercentages(distribution: { 
  positive: number; 
  neutral: number; 
  negative: number; 
}): { 
  positive: string; 
  neutral: string; 
  negative: string; 
} {
  const total = distribution.positive + distribution.neutral + distribution.negative;
  
  if (total === 0) {
    return { positive: "0%", neutral: "0%", negative: "0%" };
  }
  
  return {
    positive: Math.round((distribution.positive / total) * 100) + "%",
    neutral: Math.round((distribution.neutral / total) * 100) + "%",
    negative: Math.round((distribution.negative / total) * 100) + "%"
  };
}

// Convert sentiment distribution to chart data
export function sentimentDistributionToChartData(distribution: { 
  positive: number; 
  neutral: number; 
  negative: number; 
}) {
  // If all values are 0, return placeholder values
  if (distribution.positive === 0 && distribution.neutral === 0 && distribution.negative === 0) {
    return [
      {
        name: 'Positive',
        value: 1,
        fill: getSentimentChartColor('positive')
      },
      {
        name: 'Neutral',
        value: 1,
        fill: getSentimentChartColor('neutral')
      },
      {
        name: 'Negative',
        value: 0,
        fill: getSentimentChartColor('negative')
      }
    ];
  }
  
  return [
    {
      name: 'Positive',
      value: distribution.positive || 0,
      fill: getSentimentChartColor('positive')
    },
    {
      name: 'Neutral',
      value: distribution.neutral || 0,
      fill: getSentimentChartColor('neutral')
    },
    {
      name: 'Negative',
      value: distribution.negative || 0,
      fill: getSentimentChartColor('negative')
    }
  ];
}

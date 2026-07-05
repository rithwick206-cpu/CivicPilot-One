export type WardMetrics = {
  kpis: { label: string; value: string; icon?: React.ReactNode }[];
  riskScore: number;
  healthScore: number;
  recommendations: string[];
  chartData: { name: string; value: number }[];
};

// Mock data for each Bangalore ward (simplified)
export const wardMetricsMap: Record<string, WardMetrics> = {
  Whitefield: {
    kpis: [
      { label: 'Traffic Delay', value: '78 min' },
      { label: 'Flood Risk', value: '84%' },
      { label: 'Waste Accumulation', value: '32 tons' },
    ],
    riskScore: 84,
    healthScore: 62,
    recommendations: ['Deploy suction pumps', 'Activate traffic rerouting'],
    chartData: [
      { name: 'Traffic', value: 78 },
      { name: 'Flood', value: 84 },
      { name: 'Waste', value: 32 },
    ],
  },
  "Electronic City": {
    kpis: [
      { label: 'Power Strain', value: '71%' },
      { label: 'Traffic Delay', value: '45 min' },
    ],
    riskScore: 71,
    healthScore: 70,
    recommendations: ['Run grid load balancing'],
    chartData: [
      { name: 'Power', value: 71 },
      { name: 'Traffic', value: 45 },
    ],
  },
  // Add more wards as needed
};

export const getWardMetrics = (ward: string): WardMetrics => {
  return wardMetricsMap[ward] ?? {
    kpis: [],
    riskScore: 0,
    healthScore: 0,
    recommendations: [],
    chartData: [],
  };
};

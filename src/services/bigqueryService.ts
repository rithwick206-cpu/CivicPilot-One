// BigQuery Ready Architecture with local fallback datasets for Bangalore Wards

export interface WardData {
  name: string;
  trafficIndex: number; // 0-100
  wasteCollection: number; // % efficiency
  waterSupply: number; // % coverage
  powerGridStatus: 'Stable' | 'Strain' | 'Outage';
  airQualityIndex: number; // AQI value
  communityHealthScore: number; // 0-100
  riskScore: number; // 0-100
  complaintsCount: number;
  recentAlert: string;
  recommendations: string[];
}

export interface HistoricalRecord {
  date: string;
  trafficIndex: number;
  wasteTons: number;
  waterUsageMillionLiters: number;
  powerConsumptionMWh: number;
  aqi: number;
  complaintsResolved: number;
  complaintsFiled: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  status: 'Success' | 'Warning' | 'Failed';
  details: string;
}

// Fallback BigQuery data
export const bangaloreWards: WardData[] = [
  {
    name: 'Whitefield',
    trafficIndex: 82,
    wasteCollection: 79,
    waterSupply: 65,
    powerGridStatus: 'Strain',
    airQualityIndex: 148,
    communityHealthScore: 78,
    riskScore: 84,
    complaintsCount: 42,
    recentAlert: 'Water pipeline burst near ITPL Road causing localized flooding and heavy traffic congestion.',
    recommendations: [
      'Dispatch immediate pipe-sealing unit to ITPL Main Road',
      'Optimize traffic light timings at Hope Farm Junction by +12s green phase',
      'Redirect non-essential logistics vehicles toward Varthur bypass'
    ]
  },
  {
    name: 'RR Nagar',
    trafficIndex: 58,
    wasteCollection: 91,
    waterSupply: 88,
    powerGridStatus: 'Stable',
    airQualityIndex: 85,
    communityHealthScore: 86,
    riskScore: 76,
    complaintsCount: 28,
    recentAlert: 'Stormwater drain overflowing near double road, risk of residential basement logging.',
    recommendations: [
      'Activate high-capacity suction pumps at Zone-B culvert',
      'Clear organic blockages from stormwater inflow vents',
      'Issue warning alerts to lower-elevation residential complexes'
    ]
  },
  {
    name: 'Koramangala',
    trafficIndex: 75,
    wasteCollection: 88,
    waterSupply: 90,
    powerGridStatus: 'Strain',
    airQualityIndex: 110,
    communityHealthScore: 83,
    riskScore: 68,
    complaintsCount: 31,
    recentAlert: 'Localised commercial area garbage dumping reports on 80ft road.',
    recommendations: [
      'Reroute morning collection trucks to 80ft Road commercial zones',
      'Deploy mobile camera enforcement for illegal night dumping',
      'Upgrade street bins to smart sensor-linked compactors'
    ]
  },
  {
    name: 'Malleshwaram',
    trafficIndex: 62,
    wasteCollection: 94,
    waterSupply: 95,
    powerGridStatus: 'Stable',
    airQualityIndex: 90,
    communityHealthScore: 92,
    riskScore: 45,
    complaintsCount: 15,
    recentAlert: 'Aged tree branch falling hazard reported near 15th Cross.',
    recommendations: [
      'Deploy BBMP horticulture team for preventive tree trimming',
      'Inspect streetlighting poles in Ward 3 for structural rust'
    ]
  },
  {
    name: 'Jayanagar',
    trafficIndex: 55,
    wasteCollection: 95,
    waterSupply: 97,
    powerGridStatus: 'Stable',
    airQualityIndex: 74,
    communityHealthScore: 94,
    riskScore: 35,
    complaintsCount: 12,
    recentAlert: 'Minor water pressure drop reported in 4th T Block.',
    recommendations: [
      'Adjust booster pump speed at Jayanagar central reservoir',
      'Monitor supply pipes for minor sub-surface leakage signatures'
    ]
  },
  {
    name: 'Electronic City',
    trafficIndex: 68,
    wasteCollection: 89,
    waterSupply: 82,
    powerGridStatus: 'Stable',
    airQualityIndex: 125,
    communityHealthScore: 85,
    riskScore: 54,
    complaintsCount: 22,
    recentAlert: 'Substation maintenance scheduled for Phase 1. Load shedding expected for 1 hour.',
    recommendations: [
      'Notify tech parks to enable UPS/Generator fallback arrays',
      'Pre-load power backup grids for emergency street lighting'
    ]
  },
  {
    name: 'Rajajinagar',
    trafficIndex: 65,
    wasteCollection: 90,
    waterSupply: 87,
    powerGridStatus: 'Stable',
    airQualityIndex: 98,
    communityHealthScore: 89,
    riskScore: 50,
    complaintsCount: 19,
    recentAlert: 'Pothole cluster reported on Dr. Rajkumar Road.',
    recommendations: [
      'Schedule quick-setting road repair crew for midnight shift',
      'Post warning signs near Rajajinagar entrance ramp'
    ]
  },
  {
    name: 'Yeshwanthpur',
    trafficIndex: 78,
    wasteCollection: 81,
    waterSupply: 78,
    powerGridStatus: 'Strain',
    airQualityIndex: 135,
    communityHealthScore: 80,
    riskScore: 72,
    complaintsCount: 35,
    recentAlert: 'Heavy congestion near railway station junction due to truck parking violations.',
    recommendations: [
      'Deploy traffic marshals to enforce no-parking zone near terminal',
      'Optimize railway signal phase alignments with municipal road traffic'
    ]
  }
];

export const generateHistoricalData = (days: number = 30): HistoricalRecord[] => {
  const data: HistoricalRecord[] = [];
  const baseDate = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - i);
    const dateString = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    
    // Add realistic trends (e.g. week-end drops, weather variations)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weatherFactor = Math.sin(i / 3) * 5; // Rain effect
    
    data.push({
      date: dateString,
      trafficIndex: Math.round((isWeekend ? 55 : 72) + weatherFactor + Math.random() * 6),
      wasteTons: Math.round(420 + (isWeekend ? -40 : 25) + Math.random() * 30),
      waterUsageMillionLiters: Math.round(580 + weatherFactor * 2 + Math.random() * 20),
      powerConsumptionMWh: Math.round(1200 + (isWeekend ? -150 : 80) + Math.random() * 50),
      aqi: Math.round(105 + weatherFactor * 3 + Math.random() * 15),
      complaintsResolved: Math.round(35 + Math.random() * 10),
      complaintsFiled: Math.round(38 + weatherFactor + Math.random() * 12)
    });
  }
  
  return data;
};

export const auditLogs: AuditLog[] = [
  {
    id: 'LOG-9821',
    timestamp: '2026-07-04 21:45:12',
    user: 'K. R. Rao (Commissioner)',
    role: 'Commissioner',
    action: 'Resource Allocation',
    status: 'Success',
    details: 'Allocated 3 high-volume water pump trucks to RR Nagar sectors 4 and 5.'
  },
  {
    id: 'LOG-9710',
    timestamp: '2026-07-04 20:30:15',
    user: 'M. Shashi (Operations Manager)',
    role: 'Operations Manager',
    action: 'Alert Broadcast',
    status: 'Success',
    details: 'Broadcasted stormwater drain surge warnings to Whitefield residential blocks.'
  },
  {
    id: 'LOG-9689',
    timestamp: '2026-07-04 18:12:00',
    user: 'K. R. Rao (Commissioner)',
    role: 'Commissioner',
    action: 'Settings Change',
    status: 'Success',
    details: 'Modified emergency notification threshold values for Waste Collection bins.'
  },
  {
    id: 'LOG-9642',
    timestamp: '2026-07-04 16:05:40',
    user: 'A. Gupta (Field Supervisor)',
    role: 'Field Supervisor',
    action: 'Incident Resolved',
    status: 'Success',
    details: 'Marked Complaint #28479 (Pothole at Whitefield Main Road) as Resolved.'
  },
  {
    id: 'LOG-9512',
    timestamp: '2026-07-04 14:22:18',
    user: 'System Bot',
    role: 'System',
    action: 'BigQuery DB Sync',
    status: 'Success',
    details: 'Synchronized SCADA flow meters with central BigQuery data warehouse tables.'
  },
  {
    id: 'LOG-9481',
    timestamp: '2026-07-04 11:15:02',
    user: 'K. R. Rao (Commissioner)',
    role: 'Commissioner',
    action: 'API Key Rotated',
    status: 'Warning',
    details: 'Rotated Vertex AI Gemini API credentials key. Checking sandbox latency...'
  }
];

export const queryBigQuery = async (sql: string): Promise<{ rows: any[]; schema: string[] }> => {
  // Simulating BigQuery latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerSql = sql.toLowerCase();
  
  if (lowerSql.includes('audit')) {
    return {
      rows: auditLogs,
      schema: ['id', 'timestamp', 'user', 'role', 'action', 'status', 'details']
    };
  }

  if (lowerSql.includes('wards') || lowerSql.includes('bangalore')) {
    return {
      rows: bangaloreWards,
      schema: ['name', 'trafficIndex', 'wasteCollection', 'waterSupply', 'powerGridStatus', 'airQualityIndex', 'communityHealthScore', 'riskScore', 'complaintsCount', 'recentAlert']
    };
  }

  // General historical metrics output
  const historical = generateHistoricalData(15);
  return {
    rows: historical,
    schema: ['date', 'trafficIndex', 'wasteTons', 'waterUsageMillionLiters', 'powerConsumptionMWh', 'aqi', 'complaintsResolved', 'complaintsFiled']
  };
};

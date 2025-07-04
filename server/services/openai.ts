import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AlertAnalysis {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendations: string[];
  threatLevel: number; // 0-100
  confidence: number; // 0-1
}

export interface BehavioralAnalysis {
  summary: string;
  patterns: string[];
  anomalies: string[];
  confidence: number;
  recommendations: string[];
}

export async function generateAlertAnalysis(
  zoneData: {
    name: string;
    populationDensity: number;
    movementPatterns: string[];
    anomalies: string[];
    historicalData?: any;
  }
): Promise<AlertAnalysis> {
  try {
    const prompt = `
Analyze the following surveillance data for military intelligence purposes and generate a contextual alert:

Zone: ${zoneData.name}
Population Density Change: ${zoneData.populationDensity}%
Movement Patterns: ${zoneData.movementPatterns.join(', ')}
Detected Anomalies: ${zoneData.anomalies.join(', ')}

Provide analysis in JSON format with:
- type: "critical", "warning", or "info"
- title: Brief alert title (max 50 chars)
- description: Detailed analysis (max 200 chars)
- recommendations: Array of actionable recommendations
- threatLevel: Number 0-100 (threat severity)
- confidence: Number 0-1 (analysis confidence)

Focus on patterns indicating coordinated activity, unusual density changes, or suspicious behaviors.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a military surveillance AI analyst. Provide precise, actionable intelligence assessments in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      type: result.type || 'info',
      title: result.title || 'Surveillance Update',
      description: result.description || 'Automated surveillance analysis completed.',
      recommendations: result.recommendations || [],
      threatLevel: Math.max(0, Math.min(100, result.threatLevel || 0)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback alert if API fails
    return {
      type: 'info',
      title: 'System Alert',
      description: 'Automated analysis temporarily unavailable. Manual review recommended.',
      recommendations: ['Review zone manually', 'Check system status'],
      threatLevel: 25,
      confidence: 0.1,
    };
  }
}

export async function analyzeBehavioralPatterns(
  multiZoneData: {
    zones: Array<{
      name: string;
      activityLevel: number;
      patterns: string[];
    }>;
    timeWindow: string;
  }
): Promise<BehavioralAnalysis> {
  try {
    const prompt = `
Analyze behavioral patterns across multiple surveillance zones:

Time Window: ${multiZoneData.timeWindow}
Zones Data: ${JSON.stringify(multiZoneData.zones, null, 2)}

Provide comprehensive behavioral analysis in JSON format:
- summary: Overall behavioral assessment (max 300 chars)
- patterns: Array of identified behavioral patterns
- anomalies: Array of detected anomalies
- confidence: Analysis confidence (0-1)
- recommendations: Array of strategic recommendations

Focus on cross-zone correlations, temporal patterns, and strategic implications.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert behavioral analyst for military surveillance systems. Provide strategic insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: result.summary || 'Behavioral analysis completed.',
      patterns: result.patterns || [],
      anomalies: result.anomalies || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    console.error('OpenAI behavioral analysis error:', error);
    return {
      summary: 'Behavioral analysis temporarily unavailable.',
      patterns: [],
      anomalies: [],
      confidence: 0.1,
      recommendations: ['Manual behavioral assessment recommended'],
    };
  }
}

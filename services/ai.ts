import { EMERGENCY_KEYWORDS } from '@/constants/keywords';

export interface AIAnalysisResult {
  isEmergency: boolean;
  confidence: number;
  detectedKeywords: string[];
  transcript: string;
}

export function analyzeText(text: string): AIAnalysisResult {
  const lowerText = text.toLowerCase().trim();
  const words = lowerText.split(/\s+/);
  const detectedKeywords: string[] = [];
  let confidence = 0;

  // Check for emergency keywords
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      detectedKeywords.push(keyword);
      confidence = Math.min(100, confidence + 25);
    }
  }

  // Check for urgency indicators
  const urgencyIndicators = ['now', 'hurry', 'quick', 'fast', 'immediately', 'urgent'];
  const hasUrgency = urgencyIndicators.some(word => lowerText.includes(word));
  if (hasUrgency && confidence > 0) {
    confidence = Math.min(100, confidence + 15);
  }

  // Check for multiple requests for help
  const helpCount = (lowerText.match(/help/gi) || []).length;
  if (helpCount > 1) {
    confidence = Math.min(100, confidence + 10);
  }

  return {
    isEmergency: confidence >= 50,
    confidence: Math.round(confidence),
    detectedKeywords,
    transcript: text,
  };
}

export async function analyzeVoiceTranscript(transcript: string): Promise<AIAnalysisResult> {
  // In production, integrate with cloud speech-to-text API
  // For now, use local analysis
  return analyzeText(transcript);
}

export function containsEmergencyKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

export function getEmergencyLevel(text: string): 'low' | 'medium' | 'high' {
  const result = analyzeText(text);
  
  if (result.confidence >= 75) return 'high';
  if (result.confidence >= 50) return 'medium';
  return 'low';
}

// Integration points for future AI services
export async function sendToCloudAI(audioBase64: string): Promise<AIAnalysisResult | null> {
  // TODO: Integrate with Google Cloud Speech-to-Text or similar
  // TODO: Send results to backend for processing
  console.log('Would send to cloud AI service');
  return null;
}
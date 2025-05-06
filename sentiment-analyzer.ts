/**
 * Simple server-side sentiment analysis module
 * In a production app, this would likely use a proper NLP library 
 * or machine learning model for more accurate analysis
 */

// Lists of positive and negative words for basic sentiment detection
const positiveWords = [
  'happy', 'excited', 'motivated', 'great', 'good', 'awesome', 'excellent', 'amazing',
  'wonderful', 'fantastic', 'terrific', 'enthusiastic', 'energetic', 'positive',
  'productive', 'strong', 'confident', 'determined', 'proud', 'accomplished',
  'successful', 'inspired', 'hopeful', 'grateful', 'thankful', 'blessed',
  'love', 'enjoy', 'like', 'fun', 'pleased', 'satisfied', 'progress', 'improving',
  'better', 'best', 'achievement', 'gain', 'win', 'victory', 'succeed'
];

const negativeWords = [
  'sad', 'tired', 'exhausted', 'frustrated', 'angry', 'upset', 'disappointed',
  'depressed', 'unmotivated', 'anxious', 'stressed', 'worried', 'overwhelmed',
  'discouraged', 'unhappy', 'bad', 'terrible', 'horrible', 'awful', 'weak',
  'difficult', 'hard', 'tough', 'challenging', 'pain', 'sore', 'hurt',
  'failure', 'fail', 'lose', 'lost', 'worse', 'worst', 'hate', 'dislike',
  'struggle', 'suffering', 'sick', 'ill', 'ache', 'worried', 'concerned',
  'doubt', 'uncertain', 'confused', 'lazy', 'procrastinating', 'quit', 'giving up'
];

/**
 * Analyzes text for sentiment and returns the analysis result
 * @param text The text to analyze
 * @returns An object with sentiment classification and confidence score
 */
export function analyzeText(text: string): { sentiment: string; score: number; mood?: string } {
  if (!text) return { sentiment: 'neutral', score: 0.5 };
  
  const lowerCaseText = text.toLowerCase();
  const words = lowerCaseText.split(/\s+/);
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  // Calculate positive and negative scores
  words.forEach(word => {
    // Remove punctuation for matching
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    if (positiveWords.includes(cleanWord)) {
      positiveScore++;
    }
    if (negativeWords.includes(cleanWord)) {
      negativeScore++;
    }
  });
  
  // Check for negation words that might flip sentiment
  const negationWords = ['not', 'no', "don't", "doesn't", "didn't", "won't", "can't", "couldn't", "shouldn't", "isn't", "aren't", "wasn't", "weren't"];
  let negationCount = 0;
  
  negationWords.forEach(negation => {
    if (lowerCaseText.includes(negation)) {
      negationCount++;
    }
  });
  
  // Adjust scores based on negations (odd number of negations flips sentiment)
  if (negationCount % 2 !== 0) {
    const temp = positiveScore;
    positiveScore = negativeScore;
    negativeScore = temp;
  }
  
  // Calculate total words with sentiment
  const totalSentimentWords = positiveScore + negativeScore;
  
  // Determine overall sentiment and confidence score
  let sentiment: string;
  let score: number;
  
  if (totalSentimentWords === 0) {
    sentiment = 'neutral';
    score = 0.5;
  } else if (positiveScore > negativeScore) {
    sentiment = 'positive';
    score = 0.5 + (positiveScore / (2 * totalSentimentWords));
  } else if (negativeScore > positiveScore) {
    sentiment = 'negative';
    score = 0.5 - (negativeScore / (2 * totalSentimentWords));
  } else {
    sentiment = 'neutral';
    score = 0.5;
  }
  
  // Determine mood based on sentiment
  let mood: string = 'neutral';
  
  if (sentiment === 'positive') {
    if (score > 0.8) {
      mood = 'enthusiastic';
    } else if (score > 0.65) {
      mood = 'motivated';
    } else {
      mood = 'positive';
    }
  } else if (sentiment === 'negative') {
    if (score < 0.2) {
      mood = 'frustrated';
    } else if (score < 0.35) {
      mood = 'tired';
    } else {
      mood = 'concerned';
    }
  }
  
  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    mood
  };
}

/**
 * Get fitness recommendations based on mood
 * @param mood The detected mood
 * @returns A fitness recommendation suitable for the mood
 */
export function getMoodRecommendation(mood: string): string {
  switch (mood) {
    case 'enthusiastic':
      return "Your enthusiasm is perfect for a high-intensity workout today!";
    case 'motivated':
      return "Great motivation! Challenge yourself with increasing weights or reps today.";
    case 'positive':
      return "Your positive attitude will help you maintain good form during your workout.";
    case 'frustrated':
      return "Channel your frustration into a strength training session - it can be therapeutic.";
    case 'tired':
      return "Consider a lighter workout today, focusing on form rather than intensity.";
    case 'concerned':
      return "A mindful workout with deep breathing can help ease your concerns.";
    default:
      return "Stay consistent with your routine. Every workout brings you closer to your goals.";
  }
}

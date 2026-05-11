/**
 * Source Credibility Database
 * 
 * This database contains ratings for major news sources based on:
 * - Fact-checking accuracy (how often their reporting is accurate)
 * - Editorial standards (corrections policy, sources cited, etc)
 * - Bias level (left/right/center spectrum)
 * - Transparency (disclosure of ownership, funding, conflicts)
 * 
 * Scores range from 0-100:
 * - 80-100: Highly credible (strong editorial standards)
 * - 60-79: Moderately credible (generally reliable)
 * - 40-59: Mixed credibility (some issues with accuracy/bias)
 * - 20-39: Low credibility (significant accuracy/bias concerns)
 * - 0-19: Very low credibility (unreliable)
 */

export interface SourceCredibility {
  name: string
  credibilityScore: number // 0-100
  bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right'
  factCheckerRating?: string // from FactCheck.org, Snopes, etc
  notableIssues?: string[]
  strengths?: string[]
}

export const sourceDatabase: Record<string, SourceCredibility> = {
  // Highly Credible (80-100)
  'apnews.com': {
    name: 'Associated Press',
    credibilityScore: 95,
    bias: 'center',
    factCheckerRating: 'High accuracy',
    strengths: ['Extensive editorial process', 'Wide-ranging sources', 'Corrections policy'],
  },
  'reuters.com': {
    name: 'Reuters',
    credibilityScore: 94,
    bias: 'center',
    factCheckerRating: 'High accuracy',
    strengths: ['International news network', 'Strict editorial standards', 'Diverse sources'],
  },
  'bbc.com': {
    name: 'BBC',
    credibilityScore: 92,
    bias: 'center',
    factCheckerRating: 'Generally accurate',
    strengths: ['Public broadcasting', 'Fact-checks own work', 'Global coverage'],
  },
  'theguardian.com': {
    name: 'The Guardian',
    credibilityScore: 85,
    bias: 'center-left',
    factCheckerRating: 'Generally accurate',
    strengths: ['Investigative journalism', 'Strong corrections policy', 'Diverse voices'],
  },
  'nytimes.com': {
    name: 'The New York Times',
    credibilityScore: 84,
    bias: 'center-left',
    factCheckerRating: 'Generally accurate',
    strengths: ['Pulitzer Prize winner', 'Rigorous fact-checking', 'Strong editorial board'],
  },
  'washingtonpost.com': {
    name: 'Washington Post',
    credibilityScore: 83,
    bias: 'center-left',
    factCheckerRating: 'Generally accurate',
    strengths: ['Award-winning journalism', 'Strong fact-checking', 'Diverse coverage'],
  },
  'ft.com': {
    name: 'Financial Times',
    credibilityScore: 88,
    bias: 'center-right',
    factCheckerRating: 'Generally accurate',
    strengths: ['Business expertise', 'Global perspective', 'High editorial standards'],
  },
  'economist.com': {
    name: 'The Economist',
    credibilityScore: 87,
    bias: 'center-right',
    factCheckerRating: 'Generally accurate',
    strengths: ['In-depth analysis', 'Data-driven reporting', 'Corrections policy'],
  },
  'pbs.org': {
    name: 'PBS',
    credibilityScore: 90,
    bias: 'center',
    factCheckerRating: 'High accuracy',
    strengths: ['Public broadcasting', 'Editorial oversight', 'Educational focus'],
  },
  'npr.org': {
    name: 'NPR',
    credibilityScore: 89,
    bias: 'center',
    factCheckerRating: 'High accuracy',
    strengths: ['Public radio', 'Diverse reporting', 'Fact-checking rigor'],
  },

  // Moderately Credible (60-79)
  'cnn.com': {
    name: 'CNN',
    credibilityScore: 72,
    bias: 'center-left',
    notableIssues: ['Sensationalism at times', 'Breaking news can be inaccurate'],
    strengths: ['Global news network', 'Large reporting staff', 'Often corrects errors'],
  },
  'foxnews.com': {
    name: 'Fox News',
    credibilityScore: 70,
    bias: 'center-right',
    notableIssues: ['Opinion/news blur', 'Selective reporting'],
    strengths: ['Large audience', 'Business expertise', 'Some fact-checks'],
  },
  'bbc.co.uk': {
    name: 'BBC (UK)',
    credibilityScore: 92,
    bias: 'center',
    factCheckerRating: 'Generally accurate',
    strengths: ['Public service', 'Editorial standards', 'Fact-checking'],
  },
  'aljazeera.com': {
    name: 'Al Jazeera',
    credibilityScore: 75,
    bias: 'center',
    factCheckerRating: 'Generally accurate',
    strengths: ['International perspective', 'Investigative journalism', 'Global bureaus'],
  },
  'cbsnews.com': {
    name: 'CBS News',
    credibilityScore: 74,
    bias: 'center-left',
    strengths: ['Long history', 'Breaking news network', 'Corrections policy'],
  },
  'nbcnews.com': {
    name: 'NBC News',
    credibilityScore: 73,
    bias: 'center',
    strengths: ['News network', 'Breaking news coverage', 'Editorial process'],
  },
  'abcnews.go.com': {
    name: 'ABC News',
    credibilityScore: 72,
    bias: 'center',
    strengths: ['Established news network', 'Multiple reporters', 'Corrections policy'],
  },
  'independent.co.uk': {
    name: 'The Independent',
    credibilityScore: 71,
    bias: 'center-left',
    strengths: ['UK coverage', 'Editorial standards', 'Diverse views'],
  },
  'thehill.com': {
    name: 'The Hill',
    credibilityScore: 68,
    bias: 'center',
    notableIssues: ['Opinion pieces mixed with news', 'Clickbait headlines sometimes'],
    strengths: ['Political coverage', 'Quick reporting', 'Multiple perspectives'],
  },
  'politico.com': {
    name: 'Politico',
    credibilityScore: 70,
    bias: 'center',
    strengths: ['Political expertise', 'Breaking news', 'Washington coverage'],
  },

  // Mixed Credibility (40-59)
  'buzzfeed.com': {
    name: 'BuzzFeed',
    credibilityScore: 55,
    bias: 'center-left',
    notableIssues: ['Clickbait headlines', 'Uneven editorial standards'],
    strengths: ['Some investigative journalism', 'Social media savvy', 'Corrections published'],
  },
  'huffpost.com': {
    name: 'HuffPost',
    credibilityScore: 52,
    bias: 'center-left',
    notableIssues: ['Sensationalism', 'Opinion-news blur'],
    strengths: ['Breaking news speed', 'Some investigations', 'Diverse voices'],
  },
  'breitbart.com': {
    name: 'Breitbart',
    credibilityScore: 42,
    bias: 'right',
    notableIssues: ['Selective reporting', 'Inflammatory language', 'Fact-check failures'],
    strengths: ['Audience engagement', 'Quick reporting'],
  },
  'dailywire.com': {
    name: 'The Daily Wire',
    credibilityScore: 48,
    bias: 'right',
    notableIssues: ['Opinion dominates', 'Inflammatory headlines'],
    strengths: ['Conservative perspective', 'Audience loyalty', 'High traffic'],
  },
  'salon.com': {
    name: 'Salon',
    credibilityScore: 50,
    bias: 'center-left',
    notableIssues: ['Sensationalism', 'Clickbait', 'Opinion-news confusion'],
    strengths: ['Long history', 'Cultural criticism', 'investigative pieces'],
  },
  'slate.com': {
    name: 'Slate',
    credibilityScore: 56,
    bias: 'center-left',
    notableIssues: ['Opinion-focused', 'Provocative headlines'],
    strengths: ['Thoughtful analysis', 'Long-form journalism', 'Corrections policy'],
  },
  'theblaze.com': {
    name: 'TheBlaze',
    credibilityScore: 44,
    bias: 'right',
    notableIssues: ['Inflammatory framing', 'Selective facts', 'Opinion emphasis'],
    strengths: ['Conservative viewpoint', 'Audience loyal'],
  },

  // Low Credibility (20-39)
  'infowars.com': {
    name: 'InfoWars',
    credibilityScore: 8,
    bias: 'right',
    notableIssues: ['Conspiracy theories', 'Repeated false claims', 'No editorial standards', 'Misinformation source'],
    strengths: [],
  },
  'naturalnews.com': {
    name: 'Natural News',
    credibilityScore: 15,
    bias: 'right',
    notableIssues: ['Pseudoscience', 'False health claims', 'Sensationalism', 'No editorial process'],
    strengths: [],
  },
  'globalresearch.ca': {
    name: 'Global Research',
    credibilityScore: 20,
    bias: 'left',
    notableIssues: ['Conspiracy theories', 'Unverified claims', 'Loose fact-checking'],
    strengths: ['International coverage attempt'],
  },
  'newsguardtech.com': {
    name: 'NewsGuard',
    credibilityScore: 85,
    bias: 'center',
    factCheckerRating: 'Fact-checking organization',
    strengths: ['Transparent methodology', 'Regular updates', 'News source rater'],
  },

  // Add more sources as needed
  'default': {
    name: 'Unknown Source',
    credibilityScore: 50,
    bias: 'center',
    notableIssues: ['Source not in database - use caution'],
    strengths: [],
  },
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return ''
  }
}

/**
 * Look up source credibility by URL
 */
export function getSourceCredibility(url: string): SourceCredibility {
  const domain = extractDomain(url)
  return sourceDatabase[domain] || sourceDatabase['default']
}

/**
 * Get credibility label based on score
 */
export function getCredibilityLabel(score: number): {
  label: string
  color: string
  bgColor: string
  textColor: string
} {
  if (score >= 80) {
    return { label: 'Highly Credible', color: 'green', bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-900 dark:text-green-200' }
  }
  if (score >= 60) {
    return { label: 'Moderately Credible', color: 'blue', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-900 dark:text-blue-200' }
  }
  if (score >= 40) {
    return { label: 'Mixed Credibility', color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', textColor: 'text-yellow-900 dark:text-yellow-200' }
  }
  if (score >= 20) {
    return { label: 'Low Credibility', color: 'orange', bgColor: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-900 dark:text-orange-200' }
  }
  return { label: 'Very Low Credibility', color: 'red', bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-900 dark:text-red-200' }
}

/**
 * Get bias label and color
 */
export function getBiasLabel(bias: string): {
  label: string
  shortLabel: string
  color: string
} {
  const biasMap = {
    'left': { label: 'Left-leaning', shortLabel: 'Left', color: 'text-blue-600 dark:text-blue-400' },
    'center-left': { label: 'Center-left', shortLabel: 'Center-L', color: 'text-blue-500 dark:text-blue-400' },
    'center': { label: 'Center', shortLabel: 'Center', color: 'text-gray-600 dark:text-gray-400' },
    'center-right': { label: 'Center-right', shortLabel: 'Center-R', color: 'text-red-500 dark:text-red-400' },
    'right': { label: 'Right-leaning', shortLabel: 'Right', color: 'text-red-600 dark:text-red-400' },
  }
  return biasMap[bias as keyof typeof biasMap] || biasMap['center']
}

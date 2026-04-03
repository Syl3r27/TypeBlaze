const COMMON_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need',
  'large', 'often', 'hand', 'high', 'place', 'hold', 'turn', 'face', 'sun',
  'long', 'find', 'same', 'tell', 'keep', 'show', 'move', 'live', 'every',
  'draw', 'ask', 'write', 'door', 'light', 'voice', 'power', 'town', 'fine',
  'drive', 'short', 'road', 'book', 'stop', 'without', 'second', 'late', 'miss',
  'idea', 'enough', 'eat', 'face', 'watch', 'far', 'Indian', 'real', 'almost',
  'let', 'above', 'girl', 'sometimes', 'mountain', 'cut', 'young', 'talk', 'soon',
  'list', 'song', 'being', 'leave', 'family', 'body', 'music', 'color', 'stand',
  'sun', 'questions', 'fish', 'area', 'mark', 'dog', 'horse', 'birds', 'problem',
  'complete', 'room', 'knew', 'since', 'ever', 'piece', 'told', 'usually', 'didn\'t',
  'friends', 'easy', 'heard', 'order', 'red', 'door', 'sure', 'become', 'top',
  'ship', 'across', 'today', 'during', 'short', 'better', 'best', 'however', 'low',
  'hours', 'black', 'products', 'happened', 'whole', 'measure', 'remember', 'early',
  'waves', 'reached', 'listen', 'wind', 'rock', 'space', 'covered', 'fast', 'several',
  'hold', 'himself', 'toward', 'five', 'step', 'morning', 'passed', 'vowel', 'true',
  'hundred', 'against', 'pattern', 'numeral', 'table', 'north', 'slowly', 'money',
  'map', 'farm', 'pulled', 'draw', 'voice', 'seen', 'cold', 'cried', 'plan', 'notice',
  'south', 'sing', 'war', 'ground', 'fall', 'king', 'town', 'unit', 'figure',
  'certain', 'field', 'travel', 'wood', 'fire', 'upon', 'done', 'english', 'road',
  'half', 'ten', 'fly', 'gave', 'box', 'finally', 'wait', 'correct', 'oh', 'quickly',
  'person', 'became', 'shown', 'minutes', 'strong', 'verb', 'stars', 'front', 'feel',
  'fact', 'inches', 'street', 'decided', 'contain', 'course', 'surface', 'produce',
  'building', 'ocean', 'class', 'note', 'nothing', 'rest', 'carefully', 'scientists',
  'inside', 'wheels', 'stay', 'green', 'known', 'island', 'week', 'less', 'machine',
  'base', 'ago', 'stood', 'plane', 'system', 'behind', 'ran', 'round', 'boat', 'game',
  'force', 'brought', 'understand', 'warm', 'common', 'bring', 'explain', 'dry', 'though',
  'language', 'shape', 'deep', 'thousands', 'yes', 'clear', 'equation', 'yet', 'government',
];

const ADVANCED_WORDS = [
  'algorithm', 'abstraction', 'bandwidth', 'coefficient', 'cryptography',
  'derivative', 'encryption', 'frequency', 'gradient', 'hypothesis',
  'infrastructure', 'jurisdiction', 'kinematics', 'logarithm', 'magnitude',
  'nomenclature', 'optimization', 'parameter', 'quadratic', 'recursion',
  'simultaneous', 'tangential', 'ultraviolet', 'variable', 'wavelength',
  'exponential', 'polynomial', 'computational', 'differential', 'thermodynamic',
  'electromagnetic', 'philosophical', 'psychological', 'archaeological', 'biochemical',
  'constitutional', 'extraordinary', 'telecommunications', 'perpendicular', 'simultaneous',
  'revolutionary', 'comprehensive', 'sophisticated', 'unprecedented', 'interconnected',
  'multidimensional', 'transcendental', 'phenomenological', 'epistemological', 'ontological',
];

export function generateWordList(count: number, mode: string = 'common'): string[] {
  const pool = mode === 'advanced' ? [...COMMON_WORDS, ...ADVANCED_WORDS] : COMMON_WORDS;
  const words: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    words.push(pool[randomIndex]);
  }

  return words;
}

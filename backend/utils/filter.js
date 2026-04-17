/**
 * Keyword Sieve to filter out irrelevant news articles before sending to AI.
 */
const LOGISTICS_KEYWORDS = [
  "port", "strike", "shipping", "supply chain", "typhoon",
  "hurricane", "storm", "flood", "congestion", "blockage",
  "embargo", "sanctions", "rail disruption", "freight", "cargo",
  "vessel", "container", "terminal", "customs", "piracy"
];

export const isRelevant = (article) => {
  const text = ((article.title || "") + " " + (article.description || "")).toLowerCase();
  return LOGISTICS_KEYWORDS.some(keyword => text.includes(keyword));
};

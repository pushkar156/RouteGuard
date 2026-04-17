import dotenv from 'dotenv';
dotenv.config();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_BASE_URL = 'https://gnews.io/api/v4/search';

/**
 * Fetches recent news articles related to global logistics, shipping, and supply chain.
 * If no API key is provided, falls back to a simulated production response for testing.
 */
export const fetchGNewsArticles = async () => {
  if (!GNEWS_API_KEY || GNEWS_API_KEY === 'your_api_key_here') {
    console.log('⚠️ No GNEWS_API_KEY found. Falling back to simulated GNews data.');
    return getSimulatedGNewsData();
  }

  try {
    // We search for broad logistics terms. The 'Keyword Sieve' will filter them further.
    const query = encodeURIComponent('("supply chain" OR shipping OR port OR cargo OR freight OR logistics)');
    const response = await fetch(`${GNEWS_BASE_URL}?q=${query}&lang=en&max=10&apikey=${GNEWS_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching from GNews:', error);
    return [];
  }
};

/**
 * Provides realistic mock data structured exactly like the GNews API response.
 * Useful for development and ensuring the demo works without consuming API quota.
 */
function getSimulatedGNewsData() {
  return [
    {
      title: "Massive Typhoon expected to hit Shanghai Port this weekend",
      description: "Meteorologists are preparing for a category 4 storm that will likely force a complete shutdown of maritime operations in the region.",
      content: "Full content here...",
      url: "https://example.com/news/1",
      image: "https://example.com/img1.jpg",
      publishedAt: new Date().toISOString(),
      source: { name: "Global Logistics Daily", url: "https://example.com" }
    },
    {
      title: "Tech stocks rally as quarterly earnings exceed expectations",
      description: "Major technology companies post record profits for Q3, driving the Nasdaq higher.",
      content: "Full content here...",
      url: "https://example.com/news/2",
      image: "https://example.com/img2.jpg",
      publishedAt: new Date().toISOString(),
      source: { name: "Financial Times", url: "https://example.com" }
    },
    {
      title: "Labor strike escalates at Rotterdam ECT Delta terminal",
      description: "Dockworkers have walked out indefinitely, severely disrupting container processing and causing a buildup of vessels at anchorage.",
      content: "Full content here...",
      url: "https://example.com/news/3",
      image: "https://example.com/img3.jpg",
      publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      source: { name: "Maritime Executive", url: "https://example.com" }
    }
  ];
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface SitemapData {
  urls: SitemapUrl[];
  totalUrls: number;
  lastUpdated?: string;
}

export class SitemapService {
    
  static async getRawSitemapXml(url: string): Promise<{ success: boolean; xml?: string; error?: string }> {
    try {
      const sitemapUrl = url.endsWith('sitemap.xml') ? url : `${url.replace(/\/$/, '')}/sitemap.xml`;
      const corsProxies = [
        'https://cors-anywhere.com/',
        'https://thingproxy.freeboard.io/fetch/',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?'
      ];

      // Try each proxy until one works
      let response: Response | undefined;
      let lastError: string | undefined;
      for (const proxy of corsProxies) {
        try {
          const proxyUrl = proxy.endsWith('=') || proxy.endsWith('?') ? proxy + encodeURIComponent(sitemapUrl) : proxy + sitemapUrl;
          response = await fetch(proxyUrl);
          if (response.ok) break;
          lastError = `Failed with proxy ${proxy}: ${response.status} ${response.statusText}`;
        } catch (err) {
          lastError = `Error with proxy ${proxy}: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
      if (!response || !response.ok) {
        return {
          success: false,
          error: lastError || 'Failed to fetch sitemap with all proxies'
        };
      }
      // const response = await fetch(corsProxy + sitemapUrl);

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch sitemap: ${response.status} ${response.statusText}`
        };
      }

      const xml = await response.text();
      return { success: true, xml };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sitemap XML'
      };
    }
  }

  static async readSitemap(url: string): Promise<{ success: boolean; data?: SitemapData; error?: string }> {
    try {
      // Ensure URL ends with sitemap.xml if not already specified
      const sitemapUrl = url.endsWith('sitemap.xml') ? url : `${url.replace(/\/$/, '')}/sitemap.xml`;
      
      //console.log('Fetching sitemap from:', sitemapUrl);
      //const response = await fetch(sitemapUrl);
      const corsProxies = [
        'https://cors-anywhere.com/',
        'https://thingproxy.freeboard.io/fetch/',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?'
      ];

      // Try each proxy until one works
      let response: Response | undefined;
      let lastError: string | undefined;
      for (const proxy of corsProxies) {
        try {
          const proxyUrl = proxy.endsWith('=') || proxy.endsWith('?') ? proxy + encodeURIComponent(sitemapUrl) : proxy + sitemapUrl;
          response = await fetch(proxyUrl);
          if (response.ok) break;
          lastError = `Failed with proxy ${proxy}: ${response.status} ${response.statusText}`;
        } catch (err) {
          lastError = `Error with proxy ${proxy}: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
      if (!response || !response.ok) {
        return {
          success: false,
          error: lastError || 'Failed to fetch sitemap with all proxies'
        };
      }
      // const response = await fetch(corsProxy + sitemapUrl);

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch sitemap: ${response.status} ${response.statusText}`
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch sitemap: ${response.status} ${response.statusText}`
        };
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        return {
          success: false,
          error: 'Invalid XML format in sitemap'
        };
      }
      
      const urls: SitemapUrl[] = [];
      const urlElements = xmlDoc.querySelectorAll('url');
      
      urlElements.forEach(urlElement => {
        const loc = urlElement.querySelector('loc')?.textContent;
        if (loc) {
          const sitemapUrl: SitemapUrl = { loc };
          
          const lastmod = urlElement.querySelector('lastmod')?.textContent;
          if (lastmod) sitemapUrl.lastmod = lastmod;
          
          const changefreq = urlElement.querySelector('changefreq')?.textContent;
          if (changefreq) sitemapUrl.changefreq = changefreq;
          
          const priority = urlElement.querySelector('priority')?.textContent;
          if (priority) sitemapUrl.priority = priority;
          
          urls.push(sitemapUrl);
        }
      });
      
      // Find the most recent lastmod date
      const lastUpdated = urls
        .map(url => url.lastmod)
        .filter(Boolean)
        .sort()
        .pop();
      
      return {
        success: true,
        data: {
          urls,
          totalUrls: urls.length,
          lastUpdated
        }
      };
    } catch (error) {
      console.error('Error reading sitemap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read sitemap'
      };
    }
  }
  
  static extractPageInfo(urls: SitemapUrl[]): { pages: string[]; categories: string[] } {
    const pages = urls.map(url => {
      const path = new URL(url.loc).pathname;
      return path === '/' ? 'Home' : path.split('/').filter(Boolean).join(' > ');
    });
    
    const categories = [...new Set(
      urls.map(url => {
        const path = new URL(url.loc).pathname;
        const segments = path.split('/').filter(Boolean);
        return segments[0] || 'Home';
      })
    )];
    
    return { pages, categories };
  }
  static async getPageContent(url: string): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      const corsProxy = 'https://cors-anywhere.com/';
      const response = await fetch(corsProxy + url);
      
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch page: ${response.status} ${response.statusText}`
        };
      }
      const content = await response.text();
      //const content = "<html><body><h1>Page Content</h1></body></html>"; // Placeholder content
      return { success: true, content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch page content'
      };
    }
  }
}

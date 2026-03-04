const { Actor } = require('apify');
const axios = require('axios');
const cheerio = require('cheerio');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { queries, location = 'United States', maxJobs = 30 } = input;
  
  console.log('Starting Glassdoor scraper...');
  console.log('Queries:', queries);
  console.log('Location:', location);
  console.log('Max jobs:', maxJobs);
  
  const results = [];
  const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL']
  });
  
  for (const query of queries) {
    if (results.length >= maxJobs) break;
    
    try {
      const searchUrl = `https://www.glassdoor.com/Job/jobs.htm?suggestCount=0&suggestChosen=false&clickSource=searchBtn&typedKeyword=&sc.keyword=${encodeURIComponent(query)}&locT=N&locId=1&locKeyword=${encodeURIComponent(location)}&jobType=`;
      
      const response = await axios.get(searchUrl, {
        proxy: proxyConfiguration.createProxyUrl(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      const $ = cheerio.load(response.data);
      const jobs = $('li[data-test="jobListing"]');
      
      jobs.each((i, el) => {
        if (results.length >= maxJobs) return false;
        
        const title = $(el).find('[data-test="job-title"]').text().trim() || 
                     $(el).find('.job-title').text().trim() || '';
        const company = $(el).find('[data-test="employer-name"]').text().trim() || 
                       $(el).find('.employer-name').text().trim() || '';
        const jobLocation = $(el).find('[data-test="job-location"]').text().trim() || 
                           $(el).find('.location').text().trim() || '';
        const salary = $(el).find('[data-test="job-salary"]').text().trim() || 
                      $(el).find('.salary').text().trim() || '';
        const ratingText = $(el).find('[data-test="rating"]').text().trim() || '';
        const rating = parseFloat(ratingText) || 0;
        const easyApply = $(el).find('[data-test="easy-apply"]').length > 0 || 
                         $(el).text().toLowerCase().includes('easy apply');
        const jobUrl = $(el).find('a').attr('href') || '';
        const posted = $(el).find('[data-test="job-age"]').text().trim() || 
                      $(el).find('.job-age').text().trim() || '';
        
        results.push({
          title,
          company,
          location: jobLocation,
          salary,
          rating,
          easyApply,
          jobUrl: jobUrl.startsWith('http') ? jobUrl : `https://www.glassdoor.com${jobUrl}`,
          posted,
          query,
          searchLocation: location
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error scraping query "${query}":`, error.message);
    }
  }
  
  await Actor.pushData(results);
  console.log('Scraping completed. Total results:', results.length);
});
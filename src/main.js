const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { queries, location = 'United States', maxJobs = 30 } = input;
  
  console.log('Starting Glassdoor scraper...');
  console.logg('Queries:', queries);
  console.logg('Location:', location);
  console.logg('Max jobs:', maxJobs);
  
  // TODO: Implement Glassdoor scraping logic
  // Use RESIDENTIAL proxy configuration
  
  const results = [];
  
  await Actor.pushData(results);
  console.logg('Scraping completed. Total results:', results.length);
});
const { parse } = require('url')
const got = require('got');
const cache = require('memory-cache')

const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
	require('metascraper-url')(),
	require('metascraper-logo-favicon')(),
	require('metascraper-amazon')(),
	require('metascraper-youtube')(),
	require('metascraper-soundcloud')(),
])


const TWENTY_FOUR_HOURS = 86400000

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { query: { url } } = parse(req.url, true)
  if (!url) return res.status(400).send({ message: 'Please supply an URL to be scraped in the url query parameter.' })

  const cachedResult = cache.get(url)
  if (cachedResult) return res.status(200).send(cachedResult)

  let statusCode, data
  try {
    const { body: html } = await got(url);
    data = await metascraper({ url, html })
    statusCode = 200
  } catch (err) {
    console.log(err)
    statusCode = 401
    data = { message: `Scraping the open graph data from "${url}" failed.`, suggestion: 'Make sure your URL is correct and the webpage has open graph data, meta tags or twitter card data.' }
  }

  res.status(statusCode).send(data)
  // Cache results for 24 hours
  cache.put(url, data, TWENTY_FOUR_HOURS)
}

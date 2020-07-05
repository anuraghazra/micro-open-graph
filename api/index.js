const { parse } = require('url')
const got = require('got');
const cache = require('memory-cache')

const metascraperAuthor = require('metascraper-author');
const metascraperDate = require('metascraper-date');
const metascraperDescription = require('metascraper-description');
const metascraperImage = require('metascraper-image');
const metascraperLogo = require('metascraper-logo');
const metascraperClearbit = require('metascraper-clearbit-logo');
const metascraperLogo = require('metascraper-logo-favicon');
const metascraperPublisher = require('metascraper-publisher');
const metascraperTitle = require('metascraper-title');
const metascraperUrl = require('metascraper-url');
const metascraperLogo = require('metascraper-logo-favicon');
const metascraperAmazon = require('metascraper-amazon');
const metascraperYoutube = require('metascraper-youtube');
const metascraperSoundcloud = require('metascraper-soundcloud');

const metascraper = require('metascraper').load([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperImage(),
  metascraperLogo(),
  metascraperClearbit(),
  metascraperLogo(),
  metascraperPublisher(),
  metascraperTitle(),
  metascraperUrl(),
  metascraperLogo(),
  metascraperAmazon(),
  metascraperYoutube(),
  metascraperSoundcloud()
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

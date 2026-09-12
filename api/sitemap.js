const { getListings, listingSlug, escapeHtml } = require('../lib/seo-data');

const SITE = 'https://kats-trr-edit.vercel.app';

module.exports = function handler(req, res) {
  const listings = getListings();
  const urls = [
    `<url><loc>${SITE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...listings.map(item => `<url><loc>${SITE}/shop/${escapeHtml(listingSlug(item))}</loc><changefreq>weekly</changefreq><priority>${item.status === 'sold' ? '0.5' : '0.8'}</priority></url>`)
  ];
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
};

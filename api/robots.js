const SITE = 'https://kats-trr-edit.vercel.app';

module.exports = function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.end(`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
};

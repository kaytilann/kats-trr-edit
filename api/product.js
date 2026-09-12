const { getListings, listingSlug, escapeHtml } = require('../lib/seo-data');

const SITE = 'https://kats-trr-edit.vercel.app';

module.exports = function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();
  const listings = getListings();
  const item = listings.find(listing => listingSlug(listing) === slug);

  if (!item) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(`<!doctype html><html><head><title>Item not found | Kat's TRR Edit</title><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><p>That piece isn't in the edit right now. <a href="/">Shop Kat's TRR Edit</a>.</p></body></html>`);
  }

  const canonical = `${SITE}/shop/${listingSlug(item)}`;
  const available = item.status !== 'sold';
  const title = `${item.brand} ${item.name}${item.size ? ` ${item.size}` : ''} | Kat's TRR Edit`;
  const description = available
    ? `Shop this ${item.condition ? `${item.condition.toLowerCase()} condition ` : ''}${item.brand} ${item.name}${item.size ? ` in size ${item.size}` : ''} from Kat's curated designer closet. ${item.price ? `Listed at ${item.price}. ` : ''}Purchase and fulfillment through The RealReal.`
    : `See the sold ${item.brand} ${item.name}${item.size ? ` in size ${item.size}` : ''} from Kat's curated designer closet, then browse similar pre-owned designer pieces currently available.`;
  const details = [item.size && `Size ${item.size}`, item.condition, item.price].filter(Boolean);
  const image = item.image || '';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${item.brand} ${item.name}`,
    brand: { '@type': 'Brand', name: item.brand },
    description,
    url: canonical,
    ...(image ? { image: [image] } : {}),
    ...(item.condition ? { itemCondition: `https://schema.org/${/pristine|excellent|very good|good/i.test(item.condition) ? 'UsedCondition' : 'UsedCondition'}` } : {}),
    ...(item.price ? {
      offers: {
        '@type': 'Offer',
        url: item.url,
        priceCurrency: 'USD',
        price: String(item.price).replace(/[$,]/g, ''),
        availability: available ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        seller: { '@type': 'Organization', name: 'The RealReal' }
      }
    } : {})
  };

  const jsonLd = JSON.stringify(productSchema).replace(/</g, '\\u003c');
  const imageMarkup = image
    ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(`${item.brand} ${item.name}`)}" width="900" height="900">`
    : `<div class="placeholder">${escapeHtml(item.brand)}<br>${escapeHtml(item.name)}</div>`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.end(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${jsonLd}</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-1S9CN2M7YJ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-1S9CN2M7YJ');</script>
  <style>
    :root{--ink:#171414;--paper:#fbfaf8;--muted:#756f6b;--line:#ddd7d2;--rose:#f8eeee}
    *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Georgia,'Times New Roman',serif}a{color:inherit}.wrap{max-width:1100px;margin:auto;padding:28px 22px 64px}.top{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:34px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.16em;font-size:11px}.top a{text-decoration:none}.product{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:58px;align-items:center}.visual{background:#f4f0ed;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;overflow:hidden}.visual img{width:100%;height:100%;object-fit:contain}.placeholder{text-align:center;line-height:1.2;font-size:28px;padding:30px;background:linear-gradient(#f9eeee,#edf3f5);width:100%;height:100%;display:flex;align-items:center;justify-content:center}.eyebrow{font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.18em;font-size:11px;margin:0 0 15px}.brand{font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.18em;font-size:12px;margin:0 0 12px}.info h1{font-weight:400;font-size:42px;line-height:1.04;margin:0 0 18px}.details{display:flex;flex-wrap:wrap;gap:8px 14px;font-family:Arial,sans-serif;color:var(--muted);font-size:13px;margin-bottom:26px}.description{font-size:18px;line-height:1.6;color:#3f3936;max-width:560px}.cta{display:inline-block;margin-top:24px;padding:15px 20px;background:#1c1918;color:white;text-decoration:none;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.13em;font-size:11px}.sold{display:inline-block;margin-top:24px;padding:12px 16px;background:var(--rose);font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.13em;font-size:11px}.back{display:inline-block;margin-top:25px;font-family:Arial,sans-serif;font-size:12px;color:var(--muted)}footer{border-top:1px solid var(--line);margin-top:60px;padding-top:20px;font-family:Arial,sans-serif;font-size:11px;color:var(--muted)}
    @media(max-width:760px){.wrap{padding:20px 16px 44px}.product{grid-template-columns:1fr;gap:30px}.info h1{font-size:34px}.top{margin-bottom:22px}.description{font-size:17px}}
  </style>
</head>
<body>
  <main class="wrap">
    <nav class="top"><a href="/">Kat's TRR Edit</a><a href="https://www.instagram.com/kaytilan/" target="_blank" rel="noreferrer">@kaytilan ↗</a></nav>
    <article class="product">
      <div class="visual">${imageMarkup}</div>
      <div class="info">
        <p class="eyebrow">${available ? 'From Kat’s closet' : 'Previously loved'}</p>
        <p class="brand">${escapeHtml(item.brand)}</p>
        <h1>${escapeHtml(item.name)}</h1>
        <div class="details">${details.map(detail => `<span>${escapeHtml(detail)}</span>`).join('')}</div>
        <p class="description">${escapeHtml(description)}</p>
        ${available ? `<a class="cta" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" onclick="if(window.gtag)gtag('event','trr_product_click',{product_name:'${escapeHtml(item.name)}',brand:'${escapeHtml(item.brand)}',destination_url:'${escapeHtml(item.url)}'})">Shop on The RealReal ↗</a>` : `<span class="sold">Sold</span>`}
        <br><a class="back" href="/">← Browse the full closet</a>
      </div>
    </article>
    <footer>Independent closet edit · Purchases are completed on The RealReal.</footer>
  </main>
  <script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script><script defer src="/_vercel/insights/script.js"></script>
</body>
</html>`);
};

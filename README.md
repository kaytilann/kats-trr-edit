# Kat's TRR Edit

A mobile-first personal closet landing page linking to Kat's listings on The RealReal.

- Clean editorial layout with subtle pink/blue accents
- Category filters
- Sold archive at the bottom
- Runtime listing refresh via `/api/listings` for status, price and product imagery when TRR is reachable
- Static fallback inventory so the page still works if TRR blocks automated requests

Deploy on Vercel as a static site with a Node serverless function.

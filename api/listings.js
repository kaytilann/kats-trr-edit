const URLS = [
'https://www.therealreal.com/products/women/accessories/sunglasses/fendi-zucca-ff-logo-square-sunglasses-wdmpi','https://www.therealreal.com/products/women/accessories/scarves-and-shawls/louis-vuitton-silk-2023-scarf-wdmny','https://www.therealreal.com/products/women/clothing/tops/a-p-c-crew-neck-long-sleeve-hoodie-wdmvj','https://www.therealreal.com/products/women/handbags/handle-bags/louis-vuitton-taurillon-leather-capucines-mini-wdmr2','https://www.therealreal.com/products/women/shoes/sandals/bottega-veneta-quilted-pattern-leather-sandals-wdmrr','https://www.therealreal.com/products/women/clothing/dresses/reformation-square-neckline-mini-dress-vx034','https://www.therealreal.com/products/women/clothing/tops/balenciaga-graphic-print-crew-neck-t-shirt-vwzye','https://www.therealreal.com/products/women/clothing/knitwear/comme-des-garcons-play-wool-crew-neck-sweater-vwzv0','https://www.therealreal.com/products/women/handbags/handle-bags/louis-vuitton-lv-monogram-capucines-mm-vwzjn','https://www.therealreal.com/products/women/handbags/crossbody-bags/chanel-pearl-boy-mini-bag-vwzon','https://www.therealreal.com/products/women/clothing/dresses/diane-von-furstenberg-wool-mini-dress-vi4h2','https://www.therealreal.com/products/women/shoes/sandals/alexander-wang-leather-sandals-vwz58','https://www.therealreal.com/products/women/handbags/shoulder-bags/louis-vuitton-lv-monogram-very-vwzd2','https://www.therealreal.com/products/jewelry/earrings/stud/valentino-v-logo-stud-earring-vi49n','https://www.therealreal.com/products/women/clothing/dresses/comme-des-garcons-graphic-print-mini-dress-vi4mw','https://www.therealreal.com/products/women/clothing/tops/a-p-c-crew-neck-long-sleeve-top-vi4qz','https://www.therealreal.com/products/women/shoes/pumps/christian-louboutin-patent-leather-slingback-pumps-vi49q','https://www.therealreal.com/products/women/handbags/shoulder-bags/louis-vuitton-monogram-giant-multi-pochette-accessoires-tcw0n'];
function clean(s=''){ return s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim(); }
function one(html, re){ const m=html.match(re); return m ? clean(m[1]) : ''; }
function textContent(html){ return clean(html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')); }
async function scrape(url){
  const res = await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (compatible; KatsTRREdit/1.0)','accept-language':'en-US,en;q=0.9'},redirect:'follow'});
  if(!res.ok) throw new Error(`TRR ${res.status}`);
  const html=await res.text(), text=textContent(html);
  const image=one(html,/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)||one(html,/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  const title=one(html,/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)||one(html,/<title>([^<]+)<\/title>/i);
  const sold=/Sorry this item sold out!/i.test(text)||(/\bSold\b/.test(text)&&/Add to Waitlist/i.test(text));
  const price=one(text,/(?:Now\s+\d+% Off\s+)?(\$[\d,]+(?:\.\d{2})?)(?:\s+\[Button: (?:Add to Bag|Add to Waitlist)\]|\s+Add to (?:Bag|Waitlist))/i)||one(text,/(\$[\d,]+(?:\.\d{2})?)\s+(?:Add to Bag|Add to Waitlist)/i);
  const size=one(text,/(?:Women's Size:|Size:)\s*([^|]+(?:\|\s*(?:IT|US)\s*\S+)*)\s+Condition:/i);
  const condition=one(text,/Condition:\s*(?:\[Button:\s*)?([A-Za-z ]+?)(?:\]|\s+(?:Est\.|Was:|\$|\d+%))/i);
  const shortTitle=clean(title.replace(/\s+-\s+[^-]+(?:\s+-\s+[^-]+)?\s+\|\s+The RealReal.*$/i,''));
  return {url,image,price,size,condition,status:sold?'sold':'available',pageTitle:shortTitle};
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=3600, stale-while-revalidate=86400');
  const settled=await Promise.allSettled(URLS.map(scrape));
  const listings=settled.map((r,i)=>r.status==='fulfilled'?r.value:{url:URLS[i]});
  res.status(200).json({checkedAt:new Date().toISOString(),listings});
}

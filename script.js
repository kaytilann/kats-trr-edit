(() => {
  const fallback = window.KAT_LISTINGS || [];
  let listings = fallback;
  let activeFilter = 'All';
  const availableGrid = document.getElementById('available-grid');
  const soldGrid = document.getElementById('sold-grid');
  const updated = document.getElementById('updated');
  function esc(str=''){return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function isLaunched(item){if(!item.launchDate)return true;const launch=new Date(`${item.launchDate}T07:00:00Z`);return Date.now()>=launch.getTime();}
  function imageMarkup(item){if(item.image)return `<img class="product-image" src="${esc(item.image)}" alt="${esc(item.brand+' '+item.name)}" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="image-placeholder" style="display:none">${esc(item.brand)}<br>${esc(item.name)}</div>`;return `<div class="image-placeholder">${esc(item.brand)}<br>${esc(item.name)}</div>`;}
  function card(item,sold=false){
    const details=[item.size,item.condition].filter(Boolean).join(' · ');
    const interest=Number.isFinite(Number(item.interest))&&Number(item.interest)>0?`<span class="interest" title="Interest on The RealReal">♡ ${Number(item.interest).toLocaleString()}</span>`:'';
    const info=`<div class="product-info"><div class="brand-row"><p class="brand">${esc(item.brand)}</p>${interest}</div><p class="product-name">${esc(item.name)}</p><div class="meta"><span>${esc(details||item.category)}</span><span class="price">${esc(item.price||'')}</span></div>${sold?'':'<span class="shop-arrow">Shop on TRR <span aria-hidden="true">↗</span></span>'}</div>`;
    const visual=`<div class="image-shell">${sold?'<span class="sold-badge">Sold</span>':''}${imageMarkup(item)}</div>`;
    if(sold)return `<article class="card sold-card">${visual}${info}</article>`;
    return `<article class="card"><a class="card-link" data-product-id="${esc(item.id||'')}" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${visual}${info}</a></article>`;
  }
  function render(){const available=listings.filter(i=>isLaunched(i)&&i.status!=='sold'&&(activeFilter==='All'||i.category===activeFilter));const sold=listings.filter(i=>isLaunched(i)&&i.status==='sold');availableGrid.innerHTML=available.length?available.map(i=>card(i)).join(''):'<p class="loading">Nothing in this category right now ♡</p>';soldGrid.innerHTML=sold.length?sold.map(i=>card(i,true)).join(''):'<p class="loading">No sold pieces yet.</p>';}
  function trackProductClick(link){
    const item=listings.find(i=>i.id===link.dataset.productId || i.url===link.href);
    if(!item||typeof window.gtag!=='function')return;
    const numericPrice=Number(String(item.price||'').replace(/[$,]/g,''))||0;
    window.gtag('event','select_item',{item_list_name:'Kat’s TRR Edit',items:[{item_id:item.id||item.url,item_name:item.name,item_brand:item.brand,item_category:item.category,price:numericPrice,quantity:1}]});
    window.gtag('event','trr_product_click',{product_id:item.id||'',product_name:item.name,brand:item.brand,category:item.category,price:numericPrice,destination_url:item.url});
  }
  document.addEventListener('click',e=>{const link=e.target.closest('a.card-link');if(link)trackProductClick(link);});
  document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===btn));render();}));
  render();
  fetch('/api/listings?ts='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('refresh unavailable'))).then(data=>{
    if(!Array.isArray(data.listings)||!data.listings.length)return;
    const liveByUrl=new Map(data.listings.map(x=>[x.url,x]));
    listings=fallback.map(saved=>{
      const live=liveByUrl.get(saved.url)||{};
      const cleanedLive=Object.fromEntries(Object.entries(live).filter(([,value])=>value!==''&&value!==null&&value!==undefined));
      const merged={...saved,...cleanedLive};
      // TRR's just-listed First Look state has been misreported as sold by their structured data.
      // Keep this known-active listing live until the public page exposes a reliable purchase state.
      if(saved.id==='lv-capucines-mini') merged.status='available';
      return merged;
    });
    if(data.checkedAt){const dt=new Date(data.checkedAt);updated.textContent=`Live TRR status · ${dt.toLocaleDateString(undefined,{month:'short',day:'numeric'})} ${dt.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}`;}
    render();
  }).catch(()=>{updated.textContent='Showing latest saved listing details';});
})();

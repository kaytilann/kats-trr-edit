(() => {
  const fallback = window.KAT_LISTINGS || [];
  let listings = fallback;
  let activeFilter = 'All';
  const availableGrid = document.getElementById('available-grid');
  const soldGrid = document.getElementById('sold-grid');
  const updated = document.getElementById('updated');
  function esc(str='') { return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function imageMarkup(item) {
    if (item.image) return `<img class="product-image" src="${esc(item.image)}" alt="${esc(item.brand + ' ' + item.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="image-placeholder" style="display:none">${esc(item.brand)}<br>${esc(item.name)}</div>`;
    return `<div class="image-placeholder">${esc(item.brand)}<br>${esc(item.name)}</div>`;
  }
  function card(item, sold=false) {
    const details = [item.size, item.condition].filter(Boolean).join(' · ');
    const info = `<div class="product-info"><p class="brand">${esc(item.brand)}</p><p class="product-name">${esc(item.name)}</p><div class="meta"><span>${esc(details || item.category)}</span><span class="price">${esc(item.price || '')}</span></div>${sold ? '' : '<span class="shop-arrow">Shop on TRR →</span>'}</div>`;
    const visual = `<div class="image-shell">${sold ? '<span class="sold-badge">Sold</span>' : ''}${imageMarkup(item)}</div>`;
    if (sold) return `<article class="card sold-card">${visual}${info}</article>`;
    return `<article class="card"><a class="card-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${visual}${info}</a></article>`;
  }
  function render() {
    const available = listings.filter(i => i.status !== 'sold' && (activeFilter === 'All' || i.category === activeFilter));
    const sold = listings.filter(i => i.status === 'sold');
    availableGrid.innerHTML = available.length ? available.map(i => card(i)).join('') : '<p class="loading">Nothing in this category right now ♡</p>';
    soldGrid.innerHTML = sold.map(i => card(i, true)).join('');
  }
  document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === btn));
    render();
  }));
  render();
  fetch('/api/listings').then(r => r.ok ? r.json() : Promise.reject(new Error('refresh unavailable'))).then(data => {
    if (Array.isArray(data.listings) && data.listings.length) {
      const byUrl = new Map(fallback.map(x => [x.url, x]));
      listings = data.listings.map(x => ({...(byUrl.get(x.url)||{}), ...x}));
      if (data.checkedAt) {
        const dt = new Date(data.checkedAt);
        updated.textContent = `Availability checked ${dt.toLocaleDateString(undefined,{month:'short',day:'numeric'})} at ${dt.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}`;
      }
      render();
    }
  }).catch(() => { updated.textContent = 'Availability based on latest saved listing details'; });
})();

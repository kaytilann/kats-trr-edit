const fs = require('fs');
const path = require('path');
const vm = require('vm');

function getListings() {
  const source = fs.readFileSync(path.join(process.cwd(), 'listings.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  return Array.isArray(sandbox.window.KAT_LISTINGS) ? sandbox.window.KAT_LISTINGS : [];
}

function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function listingSlug(item) {
  return slugify(`${item.brand} ${item.name}`);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

module.exports = { getListings, slugify, listingSlug, escapeHtml };

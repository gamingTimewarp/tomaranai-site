// enhanced-404.js — Enhanced 404 page with search and suggestions
(function() {
  'use strict';

  // Check if feature is enabled
  const config = window.SiteConfig || {};
  if (!config.features || !config.features.enhanced404) {
    return;
  }

  const searchInput = document.getElementById('404-search-input');
  const searchResults = document.getElementById('404-search-results');
  const popularContent = document.getElementById('popular-content');

  if (!searchInput || !searchResults || !popularContent) return;

  let contentIndex = [];

  // Load content
  fetch('content-manifest.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      // Build index
      contentIndex = [
        ...(data.stories || []).map(item => ({ ...item, type: 'story' })),
        ...(data.blog || []).map(item => ({ ...item, type: 'blog' })),
        ...(data.projects || []).map(item => ({ ...item, type: 'project' }))
      ];

      // Show popular content (most recent 6)
      showPopularContent();
    })
    .catch(function(err) {
      console.warn('Could not load content:', err);
    });

  // Simple search
  searchInput.addEventListener('input', function() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    const results = contentIndex.filter(function(item) {
      return item.title.toLowerCase().includes(query) ||
             item.excerpt.toLowerCase().includes(query) ||
             item.tags.some(tag => tag.toLowerCase().includes(query));
    }).slice(0, 5);

    if (results.length === 0) {
      searchResults.innerHTML = '<p style="text-align: center; color: #999;">No results found</p>';
      return;
    }

    searchResults.innerHTML = results.map(function(item) {
      return '<div class="search-result-404">' +
        '<a href="' + item.path + '">' +
        '<strong>' + item.title + '</strong>' +
        '<p>' + item.excerpt.substring(0, 100) + '...</p>' +
        '</a>' +
        '</div>';
    }).join('');
  });

  // Escape key to clear search
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchResults.innerHTML = '';
    }
  });

  // Show popular content
  function showPopularContent() {
    const recent = contentIndex.slice(0, 6);

    if (recent.length === 0) {
      popularContent.innerHTML = '<p style="text-align: center; color: #999;">No content available</p>';
      return;
    }

    popularContent.innerHTML = recent.map(function(item) {
      const tagsHTML = item.tags.slice(0, 3).map(tag =>
        '<span class="card-tag">' + tag + '</span>'
      ).join('');

      return '<article class="card">' +
        '<div class="card-meta">' + tagsHTML + '</div>' +
        '<h3 class="card-title"><a href="' + item.path + '">' + item.title + '</a></h3>' +
        '<p class="card-excerpt">' + item.excerpt + '</p>' +
        '<a href="' + item.path + '" class="card-read">' + item.readText + '</a>' +
        '</article>';
    }).join('');
  }
})();

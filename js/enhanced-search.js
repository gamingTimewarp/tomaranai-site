// enhanced-search.js — Enhanced search functionality with fuzzy matching
(function() {
  'use strict';

  // Load config from window.SiteConfig (set by config.js)
  const config = window.SiteConfig || {};
  const searchConfig = config.search || {};

  if (!searchConfig.enabled) {
    console.log('Enhanced search disabled in config');
    return;
  }

  const FUZZY_THRESHOLD = searchConfig.fuzzyThreshold || 0.3;
  const MAX_RESULTS = searchConfig.maxResults || 10;

  let contentIndex = [];
  let searchInput = null;
  let searchResults = null;

  // Initialize search
  function init() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');

    if (!searchInput) {
      console.log('Search input not found');
      return;
    }

    // Load content index from manifest
    loadContentIndex();

    // Add keyboard shortcut (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

    // Add search handler
    searchInput.addEventListener('input', handleSearch);

    // Clear search on Escape
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        handleSearch();
      }
    });
  }

  // Load content from manifest
  function loadContentIndex() {
    fetch('../content-manifest.json')
      .then(response => response.json())
      .then(data => {
        contentIndex = [];

        // Index stories
        if (data.stories) {
          data.stories.forEach(item => {
            contentIndex.push({
              title: item.title,
              excerpt: item.excerpt,
              tags: item.tags || [],
              path: item.path,
              date: item.date,
              type: 'Story',
              readingTime: item.readingTime
            });
          });
        }

        // Index blog posts
        if (data.blog) {
          data.blog.forEach(item => {
            contentIndex.push({
              title: item.title,
              excerpt: item.excerpt,
              tags: item.tags || [],
              path: item.path,
              date: item.date,
              type: 'Blog',
              readingTime: item.readingTime
            });
          });
        }

        // Index projects
        if (data.projects) {
          data.projects.forEach(item => {
            contentIndex.push({
              title: item.title,
              excerpt: item.excerpt,
              tags: item.tags || [],
              path: item.path,
              date: item.date,
              type: 'Project',
              readingTime: item.readingTime
            });
          });
        }

        console.log('Indexed ' + contentIndex.length + ' items');
      })
      .catch(err => {
        console.error('Failed to load content index:', err);
      });
  }

  // Simple fuzzy matching score (0-1, higher is better)
  function fuzzyScore(text, query) {
    text = text.toLowerCase();
    query = query.toLowerCase();

    // Exact match
    if (text.includes(query)) {
      return 1.0;
    }

    // Character-by-character matching
    let queryIndex = 0;
    let textIndex = 0;
    let matches = 0;

    while (queryIndex < query.length && textIndex < text.length) {
      if (query[queryIndex] === text[textIndex]) {
        matches++;
        queryIndex++;
      }
      textIndex++;
    }

    if (queryIndex < query.length) {
      return 0; // Didn't match all query characters
    }

    // Score based on how many characters matched vs total text length
    return matches / text.length;
  }

  // Search content
  function searchContent(query) {
    if (!query || query.length < 2) {
      return [];
    }

    const results = [];

    contentIndex.forEach(item => {
      // Search in title, excerpt, and tags
      const titleScore = fuzzyScore(item.title, query);
      const excerptScore = fuzzyScore(item.excerpt, query) * 0.7; // Lower weight
      const tagsScore = Math.max(...item.tags.map(tag => fuzzyScore(tag, query))) * 0.9;

      const maxScore = Math.max(titleScore, excerptScore, tagsScore);

      if (maxScore > FUZZY_THRESHOLD) {
        results.push({
          item: item,
          score: maxScore,
          titleMatch: titleScore > FUZZY_THRESHOLD,
          excerptMatch: excerptScore > FUZZY_THRESHOLD,
          tagMatch: tagsScore > FUZZY_THRESHOLD
        });
      }
    });

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, MAX_RESULTS);
  }

  // Highlight matching text
  function highlightText(text, query) {
    if (!query) return text;

    const regex = new RegExp('(' + escapeRegex(query) + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Handle search input
  function handleSearch() {
    const query = searchInput.value.trim();

    if (!query) {
      searchResults.innerHTML = '';
      // Also trigger the original filterCards if it exists
      if (window.filterCards) {
        window.filterCards();
      }
      return;
    }

    const results = searchContent(query);

    if (results.length === 0) {
      searchResults.innerHTML = '<span style="color: #999;">No results found for "' +
        escapeHtml(query) + '"</span>';
      return;
    }

    // Display results count
    searchResults.innerHTML = '<span>Found ' + results.length + ' result' +
      (results.length === 1 ? '' : 's') + '</span>';

    // If we're on the homepage, also filter visible cards
    if (window.filterCards) {
      window.filterCards();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

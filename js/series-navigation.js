// series-navigation.js — Previous/Next navigation for series posts
(function() {
  'use strict';

  // Check if feature is enabled
  const config = window.SiteConfig || {};
  if (!config.features || !config.features.seriesNavigation) {
    return;
  }

  // Only activate on content pages
  const article = document.querySelector('.story-post');
  if (!article) return;

  // Get current page path
  const currentPath = window.location.pathname;

  // Check if this page is part of a series
  const seriesElement = article.querySelector('.story-series');
  if (!seriesElement) return;

  const currentSeries = seriesElement.textContent.trim();
  if (!currentSeries) return;

  // Load manifest and find series posts
  fetch('../content-manifest.json')
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to load manifest');
      return response.json();
    })
    .then(function(data) {
      // Combine all content
      const allContent = [
        ...(data.stories || []),
        ...(data.blog || []),
        ...(data.projects || [])
      ];

      // Filter posts in this series
      const seriesPosts = allContent.filter(function(item) {
        return item.series === currentSeries;
      });

      if (seriesPosts.length < 2) return; // Need at least 2 posts to navigate

      // Find current post index
      let currentIndex = -1;
      for (let i = 0; i < seriesPosts.length; i++) {
        if (currentPath.includes(seriesPosts[i].path.replace('.html', ''))) {
          currentIndex = i;
          break;
        }
      }

      if (currentIndex === -1) return;

      // Determine prev/next posts
      const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
      const nextPost = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null;

      // Create series navigation
      const seriesNav = document.createElement('div');
      seriesNav.className = 'series-navigation';

      let navHTML = '<div class="series-nav-header">' +
        '<h4>Series: ' + currentSeries + '</h4>' +
        '<p>Part ' + (currentIndex + 1) + ' of ' + seriesPosts.length + '</p>' +
        '</div>' +
        '<div class="series-nav-links">';

      if (prevPost) {
        navHTML += '<a href="../' + prevPost.path.replace('.html', '') + '" class="series-nav-link series-nav-prev">' +
          '<span class="series-nav-label">← Previous</span>' +
          '<span class="series-nav-title">' + prevPost.title + '</span>' +
          '</a>';
      } else {
        navHTML += '<div class="series-nav-link series-nav-disabled">' +
          '<span class="series-nav-label">← Previous</span>' +
          '<span class="series-nav-title">First post</span>' +
          '</div>';
      }

      if (nextPost) {
        navHTML += '<a href="../' + nextPost.path.replace('.html', '') + '" class="series-nav-link series-nav-next">' +
          '<span class="series-nav-label">Next →</span>' +
          '<span class="series-nav-title">' + nextPost.title + '</span>' +
          '</a>';
      } else {
        navHTML += '<div class="series-nav-link series-nav-disabled">' +
          '<span class="series-nav-label">Next →</span>' +
          '<span class="series-nav-title">Last post</span>' +
          '</div>';
      }

      navHTML += '</div>';
      seriesNav.innerHTML = navHTML;

      // Insert after story body
      const storyBody = article.querySelector('.story-body');
      if (storyBody && storyBody.nextSibling) {
        article.insertBefore(seriesNav, storyBody.nextSibling);
      } else {
        article.appendChild(seriesNav);
      }
    })
    .catch(function(err) {
      console.warn('Could not load series navigation:', err);
    });
})();

// related-posts.js — Show related posts based on tags
(function() {
  'use strict';

  // Check if feature is enabled
  const config = window.SiteConfig || {};
  const relatedConfig = config.relatedPosts || {};

  if (!config.features || !config.features.relatedPosts) {
    return;
  }

  // Only activate on content pages
  const article = document.querySelector('.story-post');
  if (!article) return;

  const COUNT = relatedConfig.count || 3;
  const MIN_COMMON_TAGS = relatedConfig.minCommonTags || 1;

  // Get current page URL
  const currentPath = window.location.pathname;

  // Extract tags from current page
  function getCurrentTags() {
    const tags = [];
    const tagElements = article.querySelectorAll('.card-tag, .story-tags .card-tag');
    tagElements.forEach(function(el) {
      tags.push(el.textContent.trim());
    });
    return tags;
  }

  // Calculate tag overlap score
  function calculateScore(item, currentTags) {
    if (!item.tags || !Array.isArray(item.tags)) return 0;

    let commonTags = 0;
    item.tags.forEach(function(tag) {
      if (currentTags.indexOf(tag) !== -1) {
        commonTags++;
      }
    });

    return commonTags;
  }

  // Generate related post HTML
  function generateRelatedHTML(item) {
    const basePath = currentPath.includes('/blog/') ? '../' :
                     currentPath.includes('/stories/') ? '../' :
                     currentPath.includes('/projects/') ? '../' : '';

    const tagsHTML = item.tags.slice(0, 3).map(function(tag) {
      return '<span class="card-tag">' + tag + '</span>';
    }).join('');

    return '<article class="related-post-card">' +
      '<div class="related-post-tags">' + tagsHTML + '</div>' +
      '<h4 class="related-post-title"><a href="' + basePath + item.path.replace('.html', '') + '">' + item.title + '</a></h4>' +
      '<p class="related-post-excerpt">' + item.excerpt + '</p>' +
      '<a href="' + basePath + item.path.replace('.html', '') + '" class="related-post-read">' + item.readText + '</a>' +
      '</article>';
  }

  // Load and display related posts
  fetch('../content-manifest.json')
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to load manifest');
      return response.json();
    })
    .then(function(data) {
      const currentTags = getCurrentTags();
      if (currentTags.length === 0) return;

      // Combine all content
      const allContent = [
        ...(data.stories || []),
        ...(data.blog || []),
        ...(data.projects || [])
      ];

      // Filter out current page and calculate scores
      // Strip .html before comparing since redirect.js rewrites URLs to extensionless
      const scored = allContent
        .filter(function(item) {
          return !currentPath.includes(item.path.replace('.html', ''));
        })
        .map(function(item) {
          return {
            item: item,
            score: calculateScore(item, currentTags)
          };
        })
        .filter(function(scored) {
          return scored.score >= MIN_COMMON_TAGS;
        });

      // Sort by score (descending)
      scored.sort(function(a, b) {
        return b.score - a.score;
      });

      // Take top N
      const related = scored.slice(0, COUNT);

      if (related.length === 0) return;

      // Create related posts section
      const relatedSection = document.createElement('div');
      relatedSection.className = 'related-posts';
      relatedSection.innerHTML = '<h3>You might also like</h3><div class="related-posts-grid"></div>';

      const grid = relatedSection.querySelector('.related-posts-grid');
      related.forEach(function(scored) {
        grid.innerHTML += generateRelatedHTML(scored.item);
      });

      // Insert before feedback section or at end
      const feedbackSection = article.querySelector('.story-feedback');
      const shareSection = article.querySelector('.social-share');

      if (feedbackSection) {
        article.insertBefore(relatedSection, feedbackSection);
      } else if (shareSection && shareSection.nextSibling) {
        article.insertBefore(relatedSection, shareSection.nextSibling);
      } else {
        article.appendChild(relatedSection);
      }
    })
    .catch(function(err) {
      console.warn('Could not load related posts:', err);
    });
})();

// comments.js — Load giscus comments system
(function() {
  'use strict';

  // Check if feature is enabled
  const config = window.SiteConfig || {};
  const commentsConfig = config.comments || {};

  if (!config.features || !config.features.comments) {
    return;
  }

  // Only activate on content pages
  const article = document.querySelector('.story-post');
  if (!article) return;

  // Verify giscus is configured
  if (!commentsConfig.repo || !commentsConfig.repoId) {
    console.log('Comments disabled: giscus not fully configured in config.json');
    return;
  }

  // Create comments section
  const commentsSection = document.createElement('div');
  commentsSection.className = 'comments-section';
  commentsSection.innerHTML = '<h3>Comments</h3><div class="giscus"></div>';

  // Insert before feedback section or at end
  const feedbackSection = article.querySelector('.story-feedback');
  if (feedbackSection) {
    article.insertBefore(commentsSection, feedbackSection);
  } else {
    article.appendChild(commentsSection);
  }

  // Load giscus script
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo', commentsConfig.repo);
  script.setAttribute('data-repo-id', commentsConfig.repoId);
  script.setAttribute('data-category', commentsConfig.category || 'General');
  script.setAttribute('data-category-id', commentsConfig.categoryId || '');
  script.setAttribute('data-mapping', commentsConfig.mapping || 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', commentsConfig.reactionsEnabled ? '1' : '0');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', commentsConfig.theme || 'preferred_color_scheme');
  script.setAttribute('data-lang', 'en');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;

  commentsSection.querySelector('.giscus').appendChild(script);
})();

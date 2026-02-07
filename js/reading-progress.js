// reading-progress.js — Reading progress indicator
(function() {
  'use strict';

  // Check if feature is enabled
  const config = window.SiteConfig || {};
  if (!config.features || !config.features.readingProgress) {
    return;
  }

  // Only activate on content pages (story-post)
  const article = document.querySelector('.story-post');
  if (!article) return;

  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.id = 'reading-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #00f, #0ff);
    z-index: 9999;
    transition: width 0.2s ease-out;
  `;
  document.body.appendChild(progressBar);

  // Update progress on scroll
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calculate progress percentage
    const maxScroll = documentHeight - windowHeight;
    const scrollPercent = (scrollTop / maxScroll) * 100;

    progressBar.style.width = Math.min(scrollPercent, 100) + '%';
  }

  // Listen for scroll events
  window.addEventListener('scroll', updateProgress);
  window.addEventListener('resize', updateProgress);

  // Initial update
  updateProgress();
})();

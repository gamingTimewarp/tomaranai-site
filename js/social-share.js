// social-share.js — Social sharing buttons
(function() {
  'use strict';

  // Check if feature is enabled
  const config = window.SiteConfig || {};
  const shareConfig = config.socialShare || {};

  if (!config.features || !config.features.socialShareButtons) {
    return;
  }

  // Only activate on content pages
  const article = document.querySelector('.story-post');
  if (!article) return;

  const platforms = shareConfig.platforms || ['twitter', 'facebook', 'linkedin', 'email'];
  const twitterVia = shareConfig.twitterVia || '';

  // Get page info
  const pageTitle = document.title;
  const pageUrl = window.location.href;
  const titleElement = document.querySelector('.story-title');
  const shareTitle = titleElement ? titleElement.textContent : pageTitle;

  // Create share container
  const shareContainer = document.createElement('div');
  shareContainer.className = 'social-share';
  shareContainer.innerHTML = '<h3>Share this post</h3><div class="share-buttons"></div>';

  const buttonsContainer = shareContainer.querySelector('.share-buttons');

  // Share URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(pageUrl)}${twitterVia ? '&via=' + twitterVia.replace('@', '') : ''}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent('Check out this post: ' + pageUrl)}`
  };

  // Button labels
  const labels = {
    twitter: '𝕏 Twitter',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    email: '✉ Email'
  };

  // Create buttons
  platforms.forEach(platform => {
    if (shareUrls[platform]) {
      const button = document.createElement('a');
      button.className = 'share-button share-button--' + platform;
      button.href = shareUrls[platform];
      button.textContent = labels[platform];
      button.target = '_blank';
      button.rel = 'noopener noreferrer';

      // Open in popup for social platforms
      if (platform !== 'email') {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          window.open(this.href, 'share', 'width=550,height=450');
        });
      }

      buttonsContainer.appendChild(button);
    }
  });

  // Insert after story body or before feedback section
  const feedbackSection = article.querySelector('.story-feedback');
  if (feedbackSection) {
    article.insertBefore(shareContainer, feedbackSection);
  } else {
    const storyBody = article.querySelector('.story-body');
    if (storyBody && storyBody.nextSibling) {
      article.insertBefore(shareContainer, storyBody.nextSibling);
    } else {
      article.appendChild(shareContainer);
    }
  }
})();

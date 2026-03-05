// post-navigation.js — Previous/Next navigation between posts in the same section
(function() {
  'use strict';

  var config = window.SiteConfig || {};
  if (!config.features || !config.features.postNavigation) return;

  var article = document.querySelector('.story-post');
  if (!article) return;

  // Determine content type from URL path
  var path = window.location.pathname;
  var contentType = null;
  if (path.indexOf('/stories/') !== -1) contentType = 'stories';
  else if (path.indexOf('/blog/') !== -1) contentType = 'blog';
  else if (path.indexOf('/projects/') !== -1) contentType = 'projects';
  if (!contentType) return;

  // Parse "Month Year" dates into a sortable number (YYYYMM)
  var MONTHS = {
    january: '01', february: '02', march: '03',    april: '04',
    may:     '05', june:     '06', july:   '07',   august:    '08',
    september:'09',october:  '10', november:'11',  december:  '12'
  };

  function parseDate(dateStr) {
    if (!dateStr || dateStr === 'Coming Soon') return 0;
    var parts = dateStr.trim().split(' ');
    if (parts.length < 2) return 0;
    var month = MONTHS[parts[0].toLowerCase()] || '01';
    var year  = parts[parts.length - 1];
    return parseInt(year + month, 10);
  }

  fetch('../content-manifest.json')
    .then(function(r) {
      if (!r.ok) throw new Error('manifest unavailable');
      return r.json();
    })
    .then(function(data) {
      var posts = (data[contentType] || []).slice();

      // Sort chronologically oldest → newest
      posts.sort(function(a, b) { return parseDate(a.date) - parseDate(b.date); });

      // Find current post — strip .html since redirect.js rewrites URLs to extensionless
      var currentIndex = -1;
      for (var i = 0; i < posts.length; i++) {
        var postSlug = posts[i].path.replace(contentType + '/', '').replace('.html', '');
        if (path.indexOf(postSlug) !== -1) {
          currentIndex = i;
          break;
        }
      }
      if (currentIndex === -1) return;

      var prevPost = currentIndex > 0               ? posts[currentIndex - 1] : null;
      var nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
      if (!prevPost && !nextPost) return; // only post in the section

      // Build navigation block
      var nav = document.createElement('nav');
      nav.className = 'post-navigation';
      nav.setAttribute('aria-label', 'Post navigation');

      var sectionLabel = contentType.charAt(0).toUpperCase() + contentType.slice(1, -1); // "Storie" → "Stori" — fix below
      var sectionLabels = { stories: 'Story', blog: 'Post', projects: 'Project' };
      sectionLabel = sectionLabels[contentType] || 'Post';

      var html = '<div class="post-nav-links">';

      if (prevPost) {
        html += '<a href="../' + prevPost.path.replace('.html', '') + '" class="post-nav-link post-nav-prev">' +
          '<span class="post-nav-label">← Older ' + sectionLabel + '</span>' +
          '<span class="post-nav-title">' + prevPost.title + '</span>' +
          '</a>';
      } else {
        html += '<div class="post-nav-link post-nav-empty"></div>';
      }

      if (nextPost) {
        html += '<a href="../' + nextPost.path.replace('.html', '') + '" class="post-nav-link post-nav-next">' +
          '<span class="post-nav-label">Newer ' + sectionLabel + ' →</span>' +
          '<span class="post-nav-title">' + nextPost.title + '</span>' +
          '</a>';
      } else {
        html += '<div class="post-nav-link post-nav-empty"></div>';
      }

      html += '</div>';
      nav.innerHTML = html;

      // Insert after .story-feedback if present, otherwise after .story-body
      var feedback = article.querySelector('.story-feedback');
      var body     = article.querySelector('.story-body');
      var anchor   = feedback || body;
      if (anchor && anchor.nextSibling) {
        article.insertBefore(nav, anchor.nextSibling);
      } else {
        article.appendChild(nav);
      }
    })
    .catch(function(err) {
      console.warn('post-navigation: could not load manifest:', err);
    });
})();

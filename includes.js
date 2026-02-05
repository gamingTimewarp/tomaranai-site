(function() {
  'use strict';

  // Determine which nav link should be active based on current URL
  function getActiveLink() {
    var path = window.location.pathname.toLowerCase();
    var filename = path.split('/').pop() || 'ject.html';

    if (filename === '' || filename === 'ject.html') {
      return 'ject.html';
    }
    if (filename.includes('stories') || filename.includes('story-')) {
      return 'stories.html';
    }
    if (filename.includes('blog') || filename.includes('whois-fancyboots')) {
      return 'blog.html';
    }
    if (filename.includes('projects') || filename.includes('project-')) {
      return 'projects.html';
    }
    if (filename.includes('contact')) {
      return 'contact.html';
    }

    return null;
  }

  // Determine base path based on current location
  function getBasePath() {
    var path = window.location.pathname;
    var depth = path.split('/').filter(function(s) { return s; }).length - 1;
    return depth > 0 ? '../' : '';
  }

  // Load and replace header
  function loadHeader() {
    var basePath = getBasePath();
    return fetch(basePath + 'partials/header.html')
      .then(function(response) {
        if (!response.ok) throw new Error('Failed to load header');
        return response.text();
      })
      .then(function(html) {
        var existingNav = document.querySelector('nav.nav');
        if (existingNav) {
          var temp = document.createElement('div');
          temp.innerHTML = html.trim();
          var newNav = temp.firstChild;

          // Fix relative paths for subdirectories
          var basePath = getBasePath();
          var allLinks = newNav.querySelectorAll('a[href]');
          allLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
              link.setAttribute('href', basePath + href);
            }
          });

          // Set active link
          var activeHref = getActiveLink();
          if (activeHref) {
            var links = newNav.querySelectorAll('.nav-links a');
            links.forEach(function(link) {
              var href = link.getAttribute('href');
              if (href === activeHref || href === basePath + activeHref) {
                link.classList.add('active');
              }
            });
          }

          existingNav.parentNode.replaceChild(newNav, existingNav);
        }
      });
  }

  // Load and replace footer
  function loadFooter() {
    var basePath = getBasePath();
    return fetch(basePath + 'partials/footer.html')
      .then(function(response) {
        if (!response.ok) throw new Error('Failed to load footer');
        return response.text();
      })
      .then(function(html) {
        var existingFooter = document.querySelector('footer.footer');
        if (existingFooter) {
          var temp = document.createElement('div');
          temp.innerHTML = html.trim();
          var newFooter = temp.firstChild;

          // Fix relative paths for subdirectories
          var basePath = getBasePath();
          var allLinks = newFooter.querySelectorAll('a[href]');
          allLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
              link.setAttribute('href', basePath + href);
            }
          });

          existingFooter.parentNode.replaceChild(newFooter, existingFooter);
        }
      });
  }

  // Load both partials - errors are caught silently so fallback stays in place
  Promise.all([loadHeader(), loadFooter()]).catch(function(error) {
    console.warn('Could not load includes:', error.message);
  });
})();

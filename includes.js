(function() {
  'use strict';

  // Determine which nav link should be active based on current URL
  function getActiveLink() {
    var path = window.location.pathname.toLowerCase();
    var filename = path.split('/').pop() || 'index.html';

    if (filename === '' || filename === 'index.html') {
      return 'index.html';
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

  // Load and replace header
  function loadHeader() {
    return fetch('partials/header.html')
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

          // Set active link
          var activeHref = getActiveLink();
          if (activeHref) {
            var links = newNav.querySelectorAll('.nav-links a');
            links.forEach(function(link) {
              if (link.getAttribute('href') === activeHref) {
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
    return fetch('partials/footer.html')
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
          existingFooter.parentNode.replaceChild(newFooter, existingFooter);
        }
      });
  }

  // Load both partials - errors are caught silently so fallback stays in place
  Promise.all([loadHeader(), loadFooter()]).catch(function(error) {
    console.warn('Could not load includes:', error.message);
  });
})();

// GitHub Pages URL cleanup: redirect .html URLs to extensionless versions
(function() {
  'use strict';

  var path = window.location.pathname;

  // If URL ends with .html (but not index.html or 404.html), redirect to extensionless version
  if (path.endsWith('.html') && !path.endsWith('index.html') && !path.endsWith('404.html')) {
    var newPath = path.slice(0, -5); // Remove .html
    var newUrl = window.location.origin + newPath + window.location.search + window.location.hash;
    window.location.replace(newUrl);
  }
})();

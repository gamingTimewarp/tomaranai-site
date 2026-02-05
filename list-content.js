(function() {
  'use strict';

  // Determine which page we're on
  var path = window.location.pathname.toLowerCase();
  var filename = path.split('/').pop() || '';
  var pageType = null;

  if (filename === 'stories.html' || filename === 'stories') {
    pageType = 'stories';
  } else if (filename === 'blog.html' || filename === 'blog') {
    pageType = 'blog';
  } else if (filename === 'projects.html' || filename === 'projects') {
    pageType = 'projects';
  }

  // Only run on list pages
  if (!pageType) return;

  // Get active tag from URL parameter
  var urlParams = new URLSearchParams(window.location.search);
  var activeTag = urlParams.get('tag');

  // Global variables
  var allItems = [];
  var allTags = [];

  // Filter items by tag
  function filterByTag(items, tag) {
    if (!tag) return items;
    return items.filter(function(item) {
      return item.tags.some(function(t) {
        return t.toLowerCase() === tag.toLowerCase();
      });
    });
  }

  // Generate tag cloud
  function generateTagCloud(tags, currentTag) {
    var tagCounts = {};
    tags.forEach(function(tag) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    var uniqueTags = Object.keys(tagCounts).sort();
    var tagClass = pageType === 'blog' ? 'tag-filter tag-filter--blog' : 'tag-filter';

    var tagsHTML = uniqueTags.map(function(tag) {
      var isActive = currentTag && tag.toLowerCase() === currentTag.toLowerCase();
      var activeClass = isActive ? ' tag-filter--active' : '';
      var count = tagCounts[tag];
      return '<a href="?' + pageType + '.html?tag=' + encodeURIComponent(tag) + '" ' +
             'class="' + tagClass + activeClass + '" ' +
             'data-tag="' + tag + '">' +
             tag + ' <span class="tag-count">(' + count + ')</span>' +
             '</a>';
    }).join(' ');

    var clearButton = currentTag ?
      '<a href="' + pageType + '.html" class="tag-filter-clear">✕ Clear filter</a>' : '';

    return '<div class="tag-cloud">' +
           '<div class="tag-cloud-header">' +
           '<span class="tag-cloud-label">Filter by tag:</span>' +
           clearButton +
           '</div>' +
           '<div class="tag-cloud-tags">' + tagsHTML + '</div>' +
           '</div>';
  }

  // Generate cards HTML
  function generateCards(items) {
    return items.map(function(item) {
      // Generate tags HTML
      var tagsHTML = item.tags.map(function(tag) {
        var tagClass = pageType === 'blog' ? 'card-tag card-tag--blog' : 'card-tag';
        return '<a href="' + pageType + '.html?tag=' + encodeURIComponent(tag) + '" ' +
               'class="' + tagClass + '" data-tag="' + tag + '">' + tag + '</a>';
      }).join('');

      return '<article class="card">' +
        '<div class="card-meta">' +
        tagsHTML +
        '<span class="card-date">' + item.date + '</span>' +
        '</div>' +
        '<h3 class="card-title"><a href="' + item.path + '">' + item.title + '</a></h3>' +
        '<p class="card-excerpt">' + item.excerpt + '</p>' +
        '<a href="' + item.path + '" class="card-read">' + item.readText + '</a>' +
        '</article>';
    }).join('\n');
  }

  // Render content
  function renderContent(items, tag) {
    var cardGrid = document.querySelector('.card-grid');
    if (!cardGrid) return;

    // Filter items if tag is specified
    var filteredItems = filterByTag(items, tag);

    // Generate and insert tag cloud
    var tagCloudHTML = generateTagCloud(allTags, tag);
    var existingTagCloud = document.querySelector('.tag-cloud');
    if (existingTagCloud) {
      existingTagCloud.remove();
    }
    cardGrid.insertAdjacentHTML('beforebegin', tagCloudHTML);

    // Generate and insert cards
    var cardsHTML = generateCards(filteredItems);

    // Show "no results" message if filtered but empty
    if (filteredItems.length === 0 && tag) {
      cardsHTML = '<div class="no-results">' +
                 '<p>No content found with tag "' + tag + '"</p>' +
                 '<a href="' + pageType + '.html" class="button">Show all</a>' +
                 '</div>';
    }

    cardGrid.innerHTML = cardsHTML;

    // Add click handlers to tag links (prevent default and update URL)
    var tagLinks = document.querySelectorAll('.card-tag[data-tag], .tag-filter[data-tag]');
    tagLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var tag = this.getAttribute('data-tag');
        var newUrl = pageType + '.html?tag=' + encodeURIComponent(tag);
        window.history.pushState({tag: tag}, '', newUrl);
        renderContent(allItems, tag);
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    });

    // Add click handler to clear filter button
    var clearButton = document.querySelector('.tag-filter-clear');
    if (clearButton) {
      clearButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.history.pushState({}, '', pageType + '.html');
        renderContent(allItems, null);
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    var urlParams = new URLSearchParams(window.location.search);
    var tag = urlParams.get('tag');
    renderContent(allItems, tag);
  });

  // Fetch and load content from manifest
  fetch('content-manifest.json')
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to load content manifest');
      return response.json();
    })
    .then(function(manifest) {
      var items = manifest[pageType];
      if (!items || items.length === 0) return;

      // Store items globally
      allItems = items;

      // Collect all tags from all items
      items.forEach(function(item) {
        item.tags.forEach(function(tag) {
          if (allTags.indexOf(tag) === -1) {
            allTags.push(tag);
          }
        });
      });

      // Initial render with active tag from URL
      renderContent(items, activeTag);
    })
    .catch(function(error) {
      console.warn('Could not load content:', error.message);
    });
})();

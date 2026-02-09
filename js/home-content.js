(function() {
  'use strict';

  // Only run on index/home page
  var path = window.location.pathname.toLowerCase();
  var filename = path.split('/').pop() || 'ject.html';
  if (filename !== '' && filename !== 'ject.html' && filename !== 'ject') {
    return;
  }

  // Configuration for each section
  var sections = [
    {
      sectionTitle: 'Latest Stories',
      category: 'stories',
      cardClass: 'card-tag--story',
      readText: 'Read story →'
    },
    {
      sectionTitle: 'From the Blog',
      category: 'blog',
      cardClass: 'card-tag--blog',
      readText: 'Read post →'
    },
    {
      sectionTitle: 'Other Projects',
      category: 'projects',
      cardClass: 'card-tag--project',
      readText: null // Keep original
    }
  ];

  // Find section by title
  function findSectionByTitle(title) {
    var headers = document.querySelectorAll('.section-title');
    for (var i = 0; i < headers.length; i++) {
      // Get text content, excluding the collapse button
      var text = headers[i].textContent.trim();
      // Remove the collapse button symbol (▼ or ▶)
      text = text.replace(/^[▼▶]\s*/, '');
      if (text === title) {
        return headers[i].closest('.section');
      }
    }
    return null;
  }

  // Parse date string (e.g., "May 2025") into comparable value
  function parseDate(dateStr) {
    var months = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    var parts = dateStr.toLowerCase().split(' ');
    var month = months[parts[0]] || 0;
    var year = parseInt(parts[1]) || 0;
    return year * 12 + month;
  }

  // Generate card HTML
  function generateCardHTML(item, tagClass, defaultReadText, category) {
    var tagsHTML = item.tags.map(function(tag) {
      var cls = 'card-tag';
      if (tagClass) {
        cls += ' ' + tagClass;
      }
      // Make tags clickable - link to filtered list page
      var listPage = category + '.html';
      return '<a href="' + listPage + '?tag=' + encodeURIComponent(tag) + '" class="' + cls + '">' + tag + '</a>';
    }).join('');

    var readText = defaultReadText || item.readText;

    return '<article class="card">' +
      tagsHTML +
      '<h3 class="card-title"><a href="' + item.path + '">' + item.title + '</a></h3>' +
      '<p class="card-excerpt">' + item.excerpt + '</p>' +
      '<a href="' + item.path + '" class="card-read">' + readText + '</a>' +
      '</article>';
  }

  // Load and populate a section
  function loadSection(config, manifest) {
    var items = manifest[config.category];
    if (!items || items.length === 0) return;

    var section = findSectionByTitle(config.sectionTitle);
    if (!section) return;

    var cardGrid = section.querySelector('.card-grid');
    if (!cardGrid) return;

    // Generate cards HTML
    var cardsHTML = items.map(function(item) {
      return generateCardHTML(item, config.cardClass, config.readText, config.category);
    }).join('\n');

    // Replace card grid contents
    cardGrid.innerHTML = cardsHTML;

    // Re-run collapse logic for this section
    var toggle = section.querySelector('.section-toggle');
    var allCards = section.querySelectorAll('.card');
    var MAX_VISIBLE = 4;

    if (allCards.length <= MAX_VISIBLE) {
      if (toggle) toggle.style.display = 'none';
    } else {
      if (toggle) {
        toggle.style.display = 'block';
        toggle.textContent = 'Show more';
      }
      allCards.forEach(function(card, i) {
        if (i >= MAX_VISIBLE) {
          card.classList.add('card--hidden');
        }
      });
    }
  }

  // Load all content and create "New Content" section
  function loadNewContentSection(manifest) {
    var allCards = [];

    // Collect all items from all categories
    sections.forEach(function(config) {
      var items = manifest[config.category] || [];
      items.forEach(function(item) {
        item.sourceConfig = config;
        item.dateValue = parseDate(item.date);
        allCards.push(item);
      });
    });

    // Filter cards that have dates and sort by date (newest first)
    var datedCards = allCards.filter(function(card) {
      return card.dateValue !== undefined;
    });

    datedCards.sort(function(a, b) {
      return b.dateValue - a.dateValue;
    });

    // Take top 6 newest
    var newestCards = datedCards.slice(0, 6);

    if (newestCards.length === 0) return;

    // Generate HTML for new content section
    var cardsHTML = newestCards.map(function(card) {
      return generateCardHTML(card, card.sourceConfig.cardClass, card.sourceConfig.readText, card.sourceConfig.category);
    }).join('\n');

    var sectionHTML =
      '<section class="section">' +
      '<div class="section-header">' +
      '<h2 class="section-title">' +
      '<button class="section-collapse-btn" onclick="collapseSection(this)" aria-label="Collapse section">▼</button>' +
      'New Content' +
      '</h2>' +
      '</div>' +
      '<div class="card-grid">' +
      cardsHTML +
      '</div>' +
      '<button class="section-toggle" onclick="toggleSection(this)">Show more</button>' +
      '</section>';

    // Insert at the beginning of main content
    var content = document.querySelector('.content');
    if (content) {
      var firstSection = content.querySelector('.section');
      if (firstSection) {
        firstSection.insertAdjacentHTML('beforebegin', sectionHTML);

        // Apply collapse logic
        var newSection = content.querySelector('.section');
        var toggle = newSection.querySelector('.section-toggle');
        var allNewCards = newSection.querySelectorAll('.card');
        var MAX_VISIBLE = 4;

        if (allNewCards.length <= MAX_VISIBLE) {
          if (toggle) toggle.style.display = 'none';
        } else {
          allNewCards.forEach(function(card, i) {
            if (i >= MAX_VISIBLE) {
              card.classList.add('card--hidden');
            }
          });
        }
      }
    }
  }

  // Fetch manifest and load all content
  fetch('content-manifest.json')
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to load content manifest');
      return response.json();
    })
    .then(function(manifest) {
      // Load new content section first
      loadNewContentSection(manifest);

      // Load regular sections
      sections.forEach(function(config) {
        loadSection(config, manifest);
      });
    })
    .catch(function(error) {
      console.warn('Could not load home content:', error.message);
    });
})();

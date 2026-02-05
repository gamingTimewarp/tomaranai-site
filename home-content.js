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
      source: 'stories.html',
      sectionTitle: 'Latest Stories',
      cardClass: '',
      readText: 'Read story →'
    },
    {
      source: 'blog.html',
      sectionTitle: 'From the Blog',
      cardClass: 'card-tag--blog',
      readText: 'Read post →'
    },
    {
      source: 'projects.html',
      sectionTitle: 'Other Projects',
      cardClass: '',
      readText: null // Keep original
    }
  ];

  // Find section by title
  function findSectionByTitle(title) {
    var headers = document.querySelectorAll('.section-title');
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].textContent.trim() === title) {
        return headers[i].closest('.section');
      }
    }
    return null;
  }

  // Extract card data from a parsed document
  function extractCards(doc, includeDate) {
    var cards = doc.querySelectorAll('.card-grid .card');
    var cardData = [];

    cards.forEach(function(card) {
      var tags = [];
      card.querySelectorAll('.card-tag').forEach(function(tag) {
        tags.push({
          text: tag.textContent.trim(),
          isBlog: tag.classList.contains('card-tag--blog')
        });
      });

      var titleEl = card.querySelector('.card-title a');
      var excerptEl = card.querySelector('.card-excerpt');
      var readEl = card.querySelector('.card-read');
      var dateEl = card.querySelector('.card-date');

      if (titleEl && excerptEl) {
        var data = {
          tags: tags,
          title: titleEl.textContent.trim(),
          href: titleEl.getAttribute('href'),
          excerpt: excerptEl.textContent.trim(),
          readHref: readEl ? readEl.getAttribute('href') : titleEl.getAttribute('href'),
          readText: readEl ? readEl.textContent.trim() : 'Read more →'
        };

        if (includeDate && dateEl) {
          data.date = dateEl.textContent.trim();
          data.dateValue = parseDate(data.date);
        }

        cardData.push(data);
      }
    });

    return cardData;
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

  // Generate card HTML for index page
  function generateCardHTML(cardData, tagClass, defaultReadText) {
    var tagsHTML = cardData.tags.map(function(tag) {
      var cls = 'card-tag';
      if (tag.isBlog || tagClass) {
        cls += ' ' + (tagClass || 'card-tag--blog');
      }
      return '<span class="' + cls + '">' + tag.text + '</span>';
    }).join('');

    var readText = defaultReadText || cardData.readText;

    return '<article class="card">' +
      tagsHTML +
      '<h3 class="card-title"><a href="' + cardData.href + '">' + cardData.title + '</a></h3>' +
      '<p class="card-excerpt">' + cardData.excerpt + '</p>' +
      '<a href="' + cardData.readHref + '" class="card-read">' + readText + '</a>' +
      '</article>';
  }

  // Load and populate a section
  function loadSection(config) {
    return fetch(config.source)
      .then(function(response) {
        if (!response.ok) throw new Error('Failed to load ' + config.source);
        return response.text();
      })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var cards = extractCards(doc, false);

        if (cards.length === 0) return;

        var section = findSectionByTitle(config.sectionTitle);
        if (!section) return;

        var cardGrid = section.querySelector('.card-grid');
        if (!cardGrid) return;

        // Generate new cards HTML
        var cardsHTML = cards.map(function(card) {
          return generateCardHTML(card, config.cardClass, config.readText);
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
      });
  }

  // Load all content and create "New Content" section
  function loadNewContentSection() {
    var allCardsPromises = sections.map(function(config) {
      return fetch(config.source)
        .then(function(response) {
          if (!response.ok) throw new Error('Failed to load ' + config.source);
          return response.text();
        })
        .then(function(html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var cards = extractCards(doc, true);

          // Add source info to each card
          return cards.map(function(card) {
            card.sourceConfig = config;
            return card;
          });
        });
    });

    Promise.all(allCardsPromises)
      .then(function(results) {
        // Flatten array of card arrays
        var allCards = [];
        results.forEach(function(cards) {
          allCards = allCards.concat(cards);
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
          return generateCardHTML(card, card.sourceConfig.cardClass, card.sourceConfig.readText);
        }).join('\n');

        var sectionHTML =
          '<section class="section">' +
          '<div class="section-header">' +
          '<h2 class="section-title">New Content</h2>' +
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
      })
      .catch(function(error) {
        console.warn('Could not load new content section:', error.message);
      });
  }

  // Load new content section first, then regular sections
  loadNewContentSection();

  Promise.all(sections.map(loadSection)).catch(function(error) {
    console.warn('Could not load home content:', error.message);
  });
})();

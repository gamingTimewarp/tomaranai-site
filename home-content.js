(function() {
  'use strict';

  // Only run on index/home page
  var path = window.location.pathname.toLowerCase();
  var filename = path.split('/').pop() || 'index.html';
  if (filename !== '' && filename !== 'index.html') {
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
  function extractCards(doc) {
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

      if (titleEl && excerptEl) {
        cardData.push({
          tags: tags,
          title: titleEl.textContent.trim(),
          href: titleEl.getAttribute('href'),
          excerpt: excerptEl.textContent.trim(),
          readHref: readEl ? readEl.getAttribute('href') : titleEl.getAttribute('href'),
          readText: readEl ? readEl.textContent.trim() : 'Read more →'
        });
      }
    });

    return cardData;
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
        var cards = extractCards(doc);

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

  // Load all sections
  Promise.all(sections.map(loadSection)).catch(function(error) {
    console.warn('Could not load home content:', error.message);
  });
})();

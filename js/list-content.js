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

  // Get active filters from URL parameters
  var urlParams = new URLSearchParams(window.location.search);
  var activeTag = urlParams.get('tag');
  var activeYear = urlParams.get('year');
  var activeMonth = urlParams.get('month');

  // Global variables
  var allItems = [];
  var allTags = [];
  var allDates = []; // Array of {year, month, count}

  // Parse date string (e.g., "May 2025") into {year, month}
  function parseDate(dateStr) {
    if (!dateStr || dateStr === 'Coming Soon') return null;
    var parts = dateStr.split(' ');
    if (parts.length !== 2) return null;
    return {
      month: parts[0],
      year: parts[1]
    };
  }

  // Filter items by tag
  function filterByTag(items, tag) {
    if (!tag) return items;
    return items.filter(function(item) {
      return item.tags.some(function(t) {
        return t.toLowerCase() === tag.toLowerCase();
      });
    });
  }

  // Filter items by date
  function filterByDate(items, year, month) {
    if (!year && !month) return items;
    return items.filter(function(item) {
      var itemDate = parseDate(item.date);
      if (!itemDate) return false;

      if (year && month) {
        return itemDate.year === year && itemDate.month === month;
      } else if (year) {
        return itemDate.year === year;
      } else if (month) {
        return itemDate.month === month;
      }
      return true;
    });
  }

  // Apply all active filters
  function applyFilters(items, tag, year, month) {
    var filtered = items;
    if (tag) filtered = filterByTag(filtered, tag);
    if (year || month) filtered = filterByDate(filtered, year, month);
    return filtered;
  }

  // Generate archive dropdown
  function generateArchiveDropdown(dates, currentYear, currentMonth) {
    // Group by year
    var yearGroups = {};
    dates.forEach(function(dateObj) {
      var year = dateObj.year;
      if (!yearGroups[year]) {
        yearGroups[year] = {count: 0, months: {}};
      }
      yearGroups[year].count += dateObj.count;
      yearGroups[year].months[dateObj.month] = dateObj.count;
    });

    var years = Object.keys(yearGroups).sort().reverse();
    var options = ['<option value="">All dates</option>'];

    years.forEach(function(year) {
      var yearData = yearGroups[year];
      var isYearSelected = currentYear === year && !currentMonth;
      options.push('<option value="year:' + year + '"' + (isYearSelected ? ' selected' : '') + '>' +
                   year + ' (' + yearData.count + ')' +
                   '</option>');

      // Add months for this year
      var months = Object.keys(yearData.months).sort(function(a, b) {
        var monthOrder = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return monthOrder.indexOf(b) - monthOrder.indexOf(a);
      });

      months.forEach(function(month) {
        var isMonthSelected = currentYear === year && currentMonth === month;
        options.push('<option value="date:' + year + ':' + month + '"' + (isMonthSelected ? ' selected' : '') + '>' +
                     '  ' + month + ' ' + year + ' (' + yearData.months[month] + ')' +
                     '</option>');
      });
    });

    return '<div class="archive-filter">' +
           '<label for="archive-select" class="archive-label">Archive:</label>' +
           '<select id="archive-select" class="archive-select">' +
           options.join('\n') +
           '</select>' +
           '</div>';
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

  // Build URL with current filters
  function buildFilterURL(tag, year, month) {
    var params = [];
    if (tag) params.push('tag=' + encodeURIComponent(tag));
    if (year && month) {
      params.push('year=' + encodeURIComponent(year));
      params.push('month=' + encodeURIComponent(month));
    } else if (year) {
      params.push('year=' + encodeURIComponent(year));
    }
    return pageType + '.html' + (params.length ? '?' + params.join('&') : '');
  }

  // Render content
  function renderContent(items, tag, year, month) {
    var cardGrid = document.querySelector('.card-grid');
    if (!cardGrid) return;

    // Filter items by all active filters
    var filteredItems = applyFilters(items, tag, year, month);

    // Generate and insert archive dropdown
    var archiveHTML = generateArchiveDropdown(allDates, year, month);
    var existingArchive = document.querySelector('.archive-filter');
    if (existingArchive) {
      existingArchive.remove();
    }
    cardGrid.insertAdjacentHTML('beforebegin', archiveHTML);

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
    if (filteredItems.length === 0 && (tag || year || month)) {
      var filterDesc = [];
      if (tag) filterDesc.push('tag "' + tag + '"');
      if (year && month) filterDesc.push('date "' + month + ' ' + year + '"');
      else if (year) filterDesc.push('year "' + year + '"');

      cardsHTML = '<div class="no-results">' +
                 '<p>No content found with ' + filterDesc.join(' and ') + '</p>' +
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
        var newUrl = buildFilterURL(tag, year, month);
        window.history.pushState({tag: tag, year: year, month: month}, '', newUrl);
        renderContent(allItems, tag, year, month);
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    });

    // Add change handler to archive dropdown
    var archiveSelect = document.getElementById('archive-select');
    if (archiveSelect) {
      archiveSelect.addEventListener('change', function(e) {
        var value = this.value;
        var newYear = null;
        var newMonth = null;

        if (value.startsWith('year:')) {
          newYear = value.split(':')[1];
        } else if (value.startsWith('date:')) {
          var parts = value.split(':');
          newYear = parts[1];
          newMonth = parts[2];
        }

        var newUrl = buildFilterURL(tag, newYear, newMonth);
        window.history.pushState({tag: tag, year: newYear, month: newMonth}, '', newUrl);
        renderContent(allItems, tag, newYear, newMonth);
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    }

    // Add click handler to clear filter button
    var clearButton = document.querySelector('.tag-filter-clear');
    if (clearButton) {
      clearButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.history.pushState({}, '', pageType + '.html');
        renderContent(allItems, null, null, null);
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    var urlParams = new URLSearchParams(window.location.search);
    var tag = urlParams.get('tag');
    var year = urlParams.get('year');
    var month = urlParams.get('month');
    renderContent(allItems, tag, year, month);
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

      // Collect all dates from all items
      var dateCounts = {};
      items.forEach(function(item) {
        var dateObj = parseDate(item.date);
        if (dateObj) {
          var key = dateObj.year + ':' + dateObj.month;
          if (!dateCounts[key]) {
            dateCounts[key] = {
              year: dateObj.year,
              month: dateObj.month,
              count: 0
            };
          }
          dateCounts[key].count++;
        }
      });

      // Convert to array
      allDates = Object.keys(dateCounts).map(function(key) {
        return dateCounts[key];
      });

      // Initial render with active filters from URL
      renderContent(items, activeTag, activeYear, activeMonth);
    })
    .catch(function(error) {
      console.warn('Could not load content:', error.message);
    });
})();

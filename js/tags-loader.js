// tags-loader.js — Load and display all tags
(function() {
  'use strict';

  const grid = document.getElementById('tags-grid');
  if (!grid) return;

  fetch('content-manifest.json')
    .then(response => response.json())
    .then(data => {
      const allContent = [
        ...data.stories,
        ...data.blog,
        ...data.projects
      ];

      // Count tags
      const tagCounts = {};
      const tagTypes = {}; // Track which content types use each tag

      allContent.forEach(item => {
        const contentType = item.path.startsWith('blog/') ? 'blog' :
                           item.path.startsWith('stories/') ? 'stories' : 'projects';

        item.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;

          if (!tagTypes[tag]) {
            tagTypes[tag] = new Set();
          }
          tagTypes[tag].add(contentType);
        });
      });

      // Sort tags by count (descending) then alphabetically
      const sortedTags = Object.keys(tagCounts).sort((a, b) => {
        const countDiff = tagCounts[b] - tagCounts[a];
        if (countDiff !== 0) return countDiff;
        return a.localeCompare(b);
      });

      if (sortedTags.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No tags found.</p>';
        return;
      }

      // Create tag cards
      sortedTags.forEach(tag => {
        const count = tagCounts[tag];
        const types = Array.from(tagTypes[tag]);

        const card = document.createElement('div');
        card.className = 'tag-card';

        // Determine which pages this tag appears on
        const links = types.map(type => {
          const url = `${type}.html?tag=${encodeURIComponent(tag)}`;
          const label = type.charAt(0).toUpperCase() + type.slice(0, -1); // Stories -> Story, etc.
          return `<a href="${url}">${label}</a>`;
        }).join(' · ');

        card.innerHTML = `
          <h3 class="tag-card-title">${tag}</h3>
          <p class="tag-card-count">${count} post${count === 1 ? '' : 's'}</p>
          <p class="tag-card-links">${links}</p>
        `;

        grid.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Failed to load tags:', err);
      grid.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Error loading tags.</p>';
    });
})();

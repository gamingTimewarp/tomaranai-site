// archive-loader.js — Load content for archive pages
(function() {
  'use strict';

  const grid = document.querySelector('[data-archive-date]');
  if (!grid) return;

  const archiveDate = grid.getAttribute('data-archive-date');

  fetch('../content-manifest.json')
    .then(response => response.json())
    .then(data => {
      const allContent = [
        ...data.stories.map(item => ({ ...item, type: 'story' })),
        ...data.blog.map(item => ({ ...item, type: 'blog' })),
        ...data.projects.map(item => ({ ...item, type: 'project' }))
      ];

      // Filter by date
      const filtered = allContent.filter(item => item.date === archiveDate);

      if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No content found for this date.</p>';
        return;
      }

      // Generate cards
      filtered.forEach(item => {
        const card = document.createElement('article');
        card.className = 'card';

        const tagsHtml = item.tags.map(tag =>
          `<span class="card-tag${item.type === 'blog' ? ' card-tag--blog' : ''}">${tag}</span>`
        ).join('');

        card.innerHTML = `
          <div class="card-meta">
            ${tagsHtml}
            <span class="card-date">${item.date}</span>
          </div>
          <h3 class="card-title"><a href="../${item.path}">${item.title}</a></h3>
          <p class="card-excerpt">${item.excerpt}</p>
          <a href="../${item.path}" class="card-read">${item.readText}</a>
        `;

        grid.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Failed to load content:', err);
      grid.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Error loading content.</p>';
    });
})();

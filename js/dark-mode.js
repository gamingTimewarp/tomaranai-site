// dark-mode.js — Dark mode toggle with localStorage persistence
(function() {
  'use strict';

  // Check if feature is enabled
  const config = window.SiteConfig || {};
  const darkModeConfig = config.darkMode || {};

  if (!config.features || !config.features.darkMode) {
    return;
  }

  const STORAGE_KEY = darkModeConfig.storageKey || 'theme-preference';
  const DEFAULT_THEME = darkModeConfig.defaultTheme || 'auto';

  // Get stored theme or default
  function getTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    // Auto mode: detect system preference
    if (DEFAULT_THEME === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return DEFAULT_THEME;
  }

  // Apply theme
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleButton(theme);
  }

  // Toggle theme
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Update toggle button icon
  function updateToggleButton(theme) {
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.textContent = theme === 'dark' ? '☀️' : '🌙';
      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  // Create toggle button
  function createToggleButton() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.addEventListener('click', toggleTheme);
    document.body.appendChild(button);
    return button;
  }

  // Listen for system theme changes (if in auto mode)
  function watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function(e) {
      // Only apply if user hasn't manually set a preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Initialize
  const theme = getTheme();
  applyTheme(theme);
  createToggleButton();
  watchSystemTheme();

  // Keyboard shortcut: Ctrl+Shift+D
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      toggleTheme();
    }
  });
})();

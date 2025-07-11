// This script prevents theme flashing on page load
// It should be placed in the <head> section and run before the page renders

(function() {
  try {
    const theme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const actualTheme = theme === 'system' || !theme ? systemTheme : theme;
    
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (error) {
    // Fallback to light theme if there's an error
    document.documentElement.classList.remove('dark');
  }
})();

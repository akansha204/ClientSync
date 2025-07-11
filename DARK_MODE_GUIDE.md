# Dark Mode Implementation Guide

## Overview
This project includes a simple dark mode implementation with the following features:

- **Theme Toggle**: Switch between light and dark themes
- **Persistent Settings**: Theme preference is saved in localStorage
- **Default Light Mode**: Application starts in light mode by default
- **No Flash**: Prevents theme flashing on page load
- **Responsive**: Works across all pages and components

## Components

### 1. Theme Context (`contexts/theme-context.tsx`)
- Manages theme state across the application (light/dark only)
- Handles localStorage persistence
- Provides `useTheme` hook for components
- Defaults to light mode

### 2. Theme Toggle (`components/theme-toggle.tsx`)
- Dropdown with Light/Dark options
- Used in the main dashboard sidebar and header
- Shows current theme with appropriate icon

### 3. Simple Theme Toggle (`components/simple-theme-toggle.tsx`)
- Simple toggle button for light/dark themes
- Used on landing page and simpler layouts
- Quick switching between modes

### 4. Dynamic Logo (`components/dynamic-logo.tsx`)
- Automatically switches between black and white logo based on theme
- Black logo for light theme, white logo for dark theme
- Used in the landing page header
- Supports forceTheme prop for specific use cases

### 5. Theme Script (in `app/layout.tsx`)
- Prevents theme flashing on page load
- Runs before React hydration
- Checks localStorage for saved theme preference
- Prevents theme flashing on page load
- Runs before React hydration
- Checks localStorage and system preference

## Usage

### Basic Implementation
```tsx
import { useTheme } from '@/contexts/theme-context';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
    </div>
  );
}
```

### Adding Theme Toggle to Other Pages
```tsx
import { ThemeToggle } from '@/components/theme-toggle';
import { DynamicLogo } from '@/components/dynamic-logo';
// or
import { SimpleThemeToggle } from '@/components/simple-theme-toggle';

function MyPage() {
  return (
    <div>
      <header>
        <DynamicLogo />
        <ThemeToggle />
      </header>
      {/* rest of your page */}
    </div>
  );
}
```

### Dynamic Logo Usage
```tsx
// Basic usage - automatically switches based on theme
<DynamicLogo />

// With custom props
<DynamicLogo 
  width={40} 
  height={40} 
  className="w-10 h-10"
  alt="My App Logo"
/>

// Force a specific theme (useful for special cases)
<DynamicLogo forceTheme="dark" />
```

## Theme Values

The theme context provides:
- `theme`: The user's selected theme ('light' | 'dark')
- `setTheme`: Function to change the theme

## Default Behavior

- **Default Theme**: Light mode
- **Persistence**: Theme choice is saved in localStorage
- **Initial Load**: Always starts in light mode unless user has previously selected dark mode

## CSS Variables

The dark mode uses CSS custom properties defined in `app/globals.css`:
- Light theme colors are defined in `:root`
- Dark theme colors are defined in `.dark`
- Tailwind CSS automatically uses these variables

## Customization

To customize colors:
1. Edit the CSS variables in `app/globals.css`
2. Use Tailwind's color system (e.g., `bg-background`, `text-foreground`)
3. Colors will automatically adapt to the selected theme

## Browser Support

- Modern browsers with localStorage support
- CSS custom properties support
- `prefers-color-scheme` media query support

## Files Modified/Created

1. **Created**: `contexts/theme-context.tsx` - Theme context provider
2. **Created**: `components/theme-toggle.tsx` - Full theme toggle component
3. **Created**: `components/simple-theme-toggle.tsx` - Simple theme toggle
4. **Created**: `components/dynamic-logo.tsx` - Theme-aware logo component
5. **Modified**: `app/layout.tsx` - Added theme provider, anti-flash script, and dynamic favicon
6. **Modified**: `components/Sidebar-nav.tsx` - Added theme toggle to sidebar
7. **Modified**: `app/LandingPage/page.tsx` - Added theme toggle and dynamic logo to landing page
8. **Created**: `lib/theme-script.js` - Anti-flash script (reference only)

The existing `app/globals.css` already had the dark mode CSS variables configured, so no changes were needed there.

## Logo Behavior

- **Header Logo**: Automatically switches between black (light theme) and white (dark theme)
- **Footer Logo**: Remains white (footer has dark background)
- **Favicon**: Static black logo (matches light theme default)
- **Dynamic Logo Component**: Can be used anywhere that needs theme-aware logo switching

## Simplified Theme System

- **No System Theme**: Only light and dark modes are available
- **Light Mode Default**: Application always starts in light mode
- **Simple Toggle**: Easy switching between light and dark themes
- **Persistent Choice**: User's theme preference is remembered

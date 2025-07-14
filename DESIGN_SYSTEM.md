# Dashboard Design System

## Overview
This document outlines the design system for the Manzilo Dashboard, focusing on improved contrast, visual hierarchy, and user experience.

## Color Palette

### Primary Colors
- **Indigo**: `#6366f1` (text-indigo-500) - Open tickets
- **Green**: `#22c55e` (text-green-500) - Closed tickets, success states
- **Orange**: `#f59e0b` (text-orange-500) - Time metrics, warnings
- **Blue**: `#3b82f6` (text-blue-500) - Solved tickets, info states
- **Rose**: `#f43f5e` (text-rose-500) - Tenants, user-related metrics

### Semantic Colors
- **Success**: `text-emerald-600` - Positive trends, achievements
- **Warning**: `text-amber-600` - Negative trends, attention needed
- **Neutral**: `text-gray-400` - No change, neutral states

### Background Colors
- **Card Background**: `bg-white` - Pure white for maximum contrast
- **Secondary Background**: `bg-gray-50` - Light gray for subtle backgrounds
- **Hover States**: `hover:bg-gray-100` - Interactive feedback

## Typography Hierarchy

### Primary Metrics
```css
text-3xl font-bold text-gray-900
```
- Used for main KPI values
- Large, bold, high contrast

### Labels
```css
text-base font-medium text-gray-700
```
- Used for metric labels
- Medium weight, good readability

### Secondary Information
```css
text-sm text-gray-500
```
- Used for trends, percentages, context
- Smaller, muted color

### Captions
```css
text-xs text-gray-400
```
- Used for progress indicators, small details
- Smallest text, lowest contrast

## Card Components

### Base Card Structure
```jsx
<Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
```

### Card Variants

#### Metric Card
- **Background**: `bg-white`
- **Border**: `border border-gray-200`
- **Shadow**: `shadow-sm` → `hover:shadow-md`
- **Padding**: `p-6`
- **Min Height**: `min-h-[180px]`
- **Hover Effect**: `scale: 1.02, y: -2`

#### Chart Card
- **Background**: `bg-white`
- **Border**: `border border-gray-200`
- **Shadow**: `shadow-sm` → `hover:shadow-md`
- **Padding**: `p-6`
- **Responsive**: `flex-col lg:flex-row`

## Icon System

### Icon Specifications
- **Size**: `h-6 w-6` (24×24px)
- **Stroke Width**: `strokeWidth={2}`
- **Container**: `w-12 h-12 rounded-lg bg-gray-50 border border-gray-100`

### Icon Colors by Type
- **Open Tickets**: `text-indigo-500`
- **Closed Tickets**: `text-green-500`
- **Time Metrics**: `text-orange-500`
- **Solved Tickets**: `text-blue-500`
- **Tenants**: `text-rose-500`

## Progress Bars

### Specifications
- **Height**: `h-1.5` (6px)
- **Track**: `bg-gray-200`
- **Fill**: `bg-gradient-to-r from-orange-500 to-orange-600`
- **Border Radius**: `rounded-full`

### Progress Bar Container
```jsx
<div className="w-full bg-gray-200 rounded-full h-1.5">
  <motion.div
    className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
    initial={{ width: 0 }}
    animate={{ width: `${percentage}%` }}
  />
</div>
```

## Badges

### Achievement Badge
```jsx
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
  New Record!
</span>
```

### Status Badges
- **Success**: `bg-green-100 text-green-700 border-green-200`
- **Warning**: `bg-amber-100 text-amber-700 border-amber-200`
- **Info**: `bg-blue-100 text-blue-700 border-blue-200`

## Chart Components

### Donut Chart
- **Container**: `w-48 h-48` (192×192px)
- **Outer Radius**: 80px
- **Inner Radius**: 50px
- **Padding Angle**: 2px
- **Stroke**: `stroke="white" strokeWidth={2}`

### Chart Legend
```jsx
<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
  <div className="flex items-center gap-3">
    <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" />
    <span className="font-semibold text-gray-900">Label</span>
  </div>
  <div className="text-right">
    <div className="text-lg font-bold text-gray-900">Value</div>
    <div className="text-xs text-gray-500">Unit</div>
  </div>
</div>
```

## Animation System

### Entrance Animations
```jsx
// Card entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, ease: "easeOut" }}

// Chart rotation
initial={{ rotate: -180 }}
animate={{ rotate: 0 }}
transition={{ duration: 1.2, ease: "easeOut" }}
```

### Hover Animations
```jsx
// Card hover
whileHover={{ scale: 1.02, y: -2 }}

// Icon hover
animate={{ scale: isHovered ? 1.05 : 1, rotate: isHovered ? 2 : 0 }}
```

### Staggered Animations
```jsx
// Legend items
transition={{ delay: index * 0.1 }}
```

## Layout System

### Grid Layout
```jsx
// Main container
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

// Metric cards
<div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
```

### Responsive Breakpoints
- **Mobile**: Single column layout
- **Tablet**: Two-column metric cards
- **Desktop**: Three-column layout (chart + 2 metrics)

## Interactive Elements

### Buttons
```jsx
// Primary action
className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"

// Secondary action
className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"

// Icon button
className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
```

### Hover States
- **Cards**: `hover:shadow-md`
- **Legend Items**: `hover:bg-gray-100`
- **Buttons**: Scale and color changes
- **Icons**: Subtle rotation and scale

## Accessibility

### Focus States
```css
focus:outline-none focus:ring-2 focus:ring-indigo-400
```

### ARIA Labels
```jsx
aria-label="Download CSV report"
aria-label={`View details for ${label}`}
```

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio
- **Interactive Elements**: Clear hover/focus states
- **Icons**: Semantic colors with sufficient contrast

## Component Variants

### Metric Card Variants
1. **Time Card**: Includes progress bar
2. **Count Card**: Simple value display
3. **Trend Card**: Shows percentage change

### Chart Variants
1. **Donut Chart**: Request overview
2. **Bar Chart**: Time series data
3. **Line Chart**: Trend analysis

## Best Practices

### Visual Hierarchy
1. Primary metric (text-3xl)
2. Label (text-base)
3. Secondary info (text-sm)
4. Captions (text-xs)

### Spacing
- **Card Padding**: 24px (p-6)
- **Element Spacing**: 16px (gap-4)
- **Section Spacing**: 32px (mb-8)

### Consistency
- Use semantic colors consistently
- Maintain icon size standards
- Apply consistent hover states
- Follow spacing guidelines 
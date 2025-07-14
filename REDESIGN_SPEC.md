# Dashboard Redesign Specification

## Overview
This document outlines the complete redesign of the Request Overview chart card and KPI cards to address UX and visual hierarchy issues.

## RequestOverviewChartCard Component

### Key Improvements

#### 1. **True Circular Donut Chart**
- **Container**: `w-48 h-48` (192×192px) with proper centering
- **Chart**: Outer radius 80px, inner radius 50px for optimal donut proportions
- **Padding**: 2px padding angle for visual separation
- **Centering**: `flex items-center justify-center` for perfect alignment

#### 2. **Semantic Color Mapping**
```jsx
const getServiceRequestData = (open, closed, solved) => [
  { name: "Open", value: open, color: "#f59e0b" },     // orange-500 - pending
  { name: "Closed", value: closed, color: "#22c55e" }, // green-500 - completed  
  { name: "Solved", value: solved, color: "#3b82f6" }, // blue-500 - resolved
];
```

#### 3. **Enhanced Legend Layout**
- **Positioning**: Flush right of chart (below on mobile)
- **Spacing**: 12px between dot, label, and value
- **Interactive States**: Hover and selection feedback
- **Percentage Display**: Inline with labels for immediate context

#### 4. **Interactive Features**
- **Slice Hover**: Tooltips with exact count and percentage
- **Slice Click**: Filter to highlight selected category
- **Legend Hover**: Synchronized with chart slices
- **Legend Click**: Toggle filter state

#### 5. **Download Button Enhancement**
```jsx
<motion.button
  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
  aria-label="Download CSV report"
  title="Download CSV report"
>
  <Download className="w-4 h-4" />
  Download CSV
</motion.button>
```

### Component Structure
```jsx
<Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6">
  {/* Header with title and download button */}
  {/* Chart and legend container */}
  {/* Interactive donut chart */}
  {/* Enhanced legend with hover states */}
</Card>
```

## KPIStatCard Component

### Key Improvements

#### 1. **Visual Hierarchy**
- **Primary Metric**: `text-3xl font-bold text-gray-900` (large, prominent)
- **Label**: `text-base font-medium text-gray-700` (medium weight)
- **Secondary Info**: `text-sm text-gray-600` (smaller, muted)
- **Progress Label**: `text-sm text-gray-700 font-medium` (clear, readable)

#### 2. **Card Container**
```jsx
<Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 min-h-[200px] group">
```

#### 3. **Percent Change Chip**
- **Position**: Top-right corner
- **Style**: `px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium`
- **Icon**: Trend indicator with percentage

#### 4. **Enhanced Progress Bar**
- **Height**: 6px (`h-1.5`)
- **Track**: `bg-gray-200` (high contrast)
- **Fill**: `bg-orange-500` (saturated accent color)
- **Label**: Clear percentage display below bar

#### 5. **Achievement Badge**
- **Position**: Top-left corner
- **Style**: `bg-green-100 text-green-700 border-green-200 shadow-sm`
- **High Contrast**: Meets WCAG AA standards

### Component Variants

#### Time Saved Card
```jsx
<MetricCard
  type="time"
  value="75.0h"
  label="Time Saved"
  trend={12}
  previousValue={66}
  threshold={100}
  showBadge={true}
/>
```

#### Tenants Served Card
```jsx
<MetricCard
  type="tenants"
  value={300}
  label="Tenants Served"
  trend={8}
  previousValue={276}
  threshold={500}
  showBadge={true}
/>
```

## Design System Updates

### Color Palette
```css
/* Semantic Colors */
--orange-500: #f59e0b;  /* Open/Pending */
--green-500: #22c55e;   /* Closed/Completed */
--blue-500: #3b82f6;    /* Solved/Resolved */
--emerald-600: #059669; /* Success/Positive */
--amber-600: #d97706;   /* Warning/Negative */
```

### Typography Scale
```css
/* Primary Metrics */
.text-3xl font-bold text-gray-900

/* Labels */
.text-base font-medium text-gray-700

/* Secondary Information */
.text-sm text-gray-600

/* Progress Labels */
.text-sm text-gray-700 font-medium

/* Captions */
.text-xs text-gray-400
```

### Spacing System
```css
/* Card Padding */
.p-6 (24px)

/* Element Spacing */
.gap-3 (12px)
.gap-4 (16px)
.gap-8 (32px)

/* Section Spacing */
.mb-6 (24px)
.mb-8 (32px)
```

### Interactive States
```css
/* Card Hover */
hover:shadow-md
scale: 1.02, y: -2

/* Button Hover */
hover:bg-gray-200
scale: 1.02

/* Legend Hover */
hover:bg-gray-100
bg-blue-50 border-blue-200 (selected)
```

## Accessibility Features

### WCAG AA Compliance
- **Color Contrast**: All text meets 4.5:1 minimum ratio
- **Focus States**: Clear focus indicators
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Keyboard Navigation**: Full keyboard support

### Screen Reader Support
```jsx
aria-label="Download CSV report"
aria-label={`View details for ${label}`}
title="Download CSV report"
```

## Responsive Design

### Breakpoints
```css
/* Mobile */
grid-cols-1 (single column)

/* Tablet */
sm:grid-cols-2 (two-column metrics)

/* Desktop */
lg:grid-cols-3 (three-column layout)
lg:flex-row (chart and legend side-by-side)
```

### Mobile Optimizations
- **Touch Targets**: Minimum 44px for interactive elements
- **Spacing**: Increased touch-friendly spacing
- **Typography**: Optimized for mobile reading

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

### Interactive Animations
```jsx
// Hover effects
whileHover={{ scale: 1.02, y: -2 }}
whileTap={{ scale: 0.98 }}

// Staggered animations
transition={{ delay: index * 0.1 }}
```

## Implementation Guidelines

### Best Practices
1. **Consistent Spacing**: Use the defined spacing system
2. **Semantic Colors**: Apply colors based on meaning, not preference
3. **Progressive Enhancement**: Ensure functionality without JavaScript
4. **Performance**: Optimize animations for 60fps
5. **Testing**: Test across devices and screen sizes

### Component Usage
```jsx
// Import components
import { TicketPieChart } from './TicketPieChart';
import { MetricCard } from './MetricCard';

// Use in layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <TicketPieChart ticketsOpen={12} ticketsClosed={45} ticketsSolved={40} />
  <MetricCard type="time" value="75.0h" label="Time Saved" trend={12} />
  <MetricCard type="tenants" value={300} label="Tenants Served" trend={8} />
</div>
```

## Future Enhancements

### Planned Features
1. **Data Export**: CSV/PDF download functionality
2. **Filtering**: Multi-select legend filtering
3. **Drill-down**: Click to view detailed breakdowns
4. **Real-time Updates**: Live data refresh with smooth transitions
5. **Customization**: User-configurable color schemes

### Performance Optimizations
1. **Virtual Scrolling**: For large datasets
2. **Lazy Loading**: Chart components
3. **Memoization**: Prevent unnecessary re-renders
4. **Bundle Splitting**: Code splitting for better load times 
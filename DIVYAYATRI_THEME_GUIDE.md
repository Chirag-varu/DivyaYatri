# DivyaYatri Tailwind Theme Guide

## Color Palette Overview

Your DivyaYatri theme uses the following color palette with shadcn/ui integration:

### Primary Colors
- **Primary**: `#3F3CBB` (Deep Indigo) - 15-20% usage
- **Secondary**: `#FFD166` (Golden Sand) - 5-10% usage  
- **Accent**: `#FF6B6B` (Warm Coral) - 5-10% usage
- **Background**: `#FFFAF0` (Off-White/Soft Cream) - 35-40% usage
- **Text**: `#4A4A4A` (Slate Gray) - 25-30% usage
- **Secondary Accent**: `#00A8E8` (Sky Blue) - 5-10% usage

## Tailwind CSS Classes

### Using shadcn/ui Component Colors
All shadcn/ui components automatically use your theme colors:

```jsx
// Buttons automatically use primary color
<Button>Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive">Delete</Button>

// Cards use theme background
<Card>
  <CardContent>Content here</CardContent>
</Card>

// Tabs use theme colors
<Tabs>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
</Tabs>
```

### Direct Color Classes

```jsx
// Background colors
bg-primary          // Deep Indigo #3F3CBB
bg-secondary        // Golden Sand #FFD166
bg-accent           // Warm Coral #FF6B6B
bg-background       // Off-White/Cream #FFFAF0
bg-secondaryAccent  // Sky Blue #00A8E8

// Text colors
text-primary        // Deep Indigo
text-secondary      // Golden Sand
text-accent         // Warm Coral
text-foreground     // Slate Gray #4A4A4A
text-text           // Direct access to #4A4A4A

// Border colors
border-primary      // Deep Indigo
border-secondary    // Golden Sand
border-accent       // Warm Coral
```

### Theme-Specific Utility Classes

```jsx
// Custom background gradient
<div className="divyayatri-bg">
  Gradient background
</div>

// Glowing effect
<div className="divyayatri-glow">
  Golden glow effect
</div>

// Pulsing animation
<div className="divyayatri-pulse">
  Pulsing indigo effect
</div>

// Focus styles
<button className="divyayatri-focus">
  Accessible focus styling
</button>
```

## Component Examples

### Hero Section
```jsx
<section className="bg-background text-foreground">
  <h1 className="text-primary text-4xl font-bold">
    Welcome to DivyaYatri
  </h1>
  <p className="text-text">
    Your spiritual journey begins here
  </p>
  <Button className="bg-primary hover:bg-primary/90">
    Start Journey
  </Button>
</section>
```

### Card with Theme Colors
```jsx
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-primary">Temple Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-foreground">Temple description</p>
    <Badge className="bg-secondary text-secondary-foreground">
      Featured
    </Badge>
  </CardContent>
</Card>
```

### Navigation with Theme
```jsx
<nav className="bg-background border-b border-border">
  <Link 
    href="/" 
    className="text-secondaryAccent hover:text-primary"
  >
    Home
  </Link>
  <Button variant="secondary" size="sm">
    Login
  </Button>
</nav>
```

### Alert/Toast Styling
```jsx
// Success toast (using secondary - golden)
<Toast className="bg-secondary text-secondary-foreground">
  Success message
</Toast>

// Error toast (using accent - coral)
<Toast className="bg-accent text-accent-foreground">
  Error message
</Toast>

// Info toast (using secondary accent - sky blue)
<Toast className="bg-secondaryAccent text-white">
  Info message
</Toast>
```

## Color Usage Recommendations

### Primary (`#3F3CBB` - Deep Indigo)
- Main action buttons
- Primary headings
- Key UI highlights
- Active navigation states
- Focus rings

### Secondary (`#FFD166` - Golden Sand)
- Secondary buttons
- Badges and labels
- Success states
- Decorative elements
- Icon highlights

### Accent (`#FF6B6B` - Warm Coral)
- Warning states
- Error messages
- Destructive actions
- Alert components
- Important notifications

### Background (`#FFFAF0` - Off-White/Cream)
- Page backgrounds
- Card backgrounds
- Modal backgrounds
- Content areas

### Text (`#4A4A4A` - Slate Gray)
- Body text
- Descriptions
- Secondary headings
- Form labels

### Secondary Accent (`#00A8E8` - Sky Blue)
- Links
- Tab indicators
- Info states
- Secondary highlights
- Subtle accents

## Dark Mode Support

The theme includes automatic dark mode variants. Toggle dark mode with:

```jsx
// In your app
<html className="dark">
  {/* Dark mode automatically applied */}
</html>
```

All colors automatically adjust for optimal contrast in dark mode while maintaining the theme's visual identity.

## CSS Variables Access

You can also use CSS variables directly:

```css
.custom-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--border));
}
```

This theme configuration ensures all your shadcn/ui components automatically use the DivyaYatri color palette while providing flexible access to colors for custom components.
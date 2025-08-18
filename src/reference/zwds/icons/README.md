# Zodiac Icons

This directory contains SVG icons for the 12 Chinese zodiac signs used in Zi Wei Dou Shu (ZWDS) charts.

## Available Icons

- `rat.svg` - Rat zodiac sign
- `ox.svg` - Ox zodiac sign
- `tiger.svg` - Tiger zodiac sign
- `rabbit.svg` - Rabbit zodiac sign
- `dragon.svg` - Dragon zodiac sign
- `snake.svg` - Snake zodiac sign
- `horse.svg` - Horse zodiac sign
- `goat.svg` - Goat zodiac sign
- `monkey.svg` - Monkey zodiac sign
- `rooster.svg` - Rooster zodiac sign
- `dog.svg` - Dog zodiac sign
- `pig.svg` - Pig zodiac sign

## Usage

You can import and use these icons in two ways:

### Method 1: Individual Import

```tsx
import { ReactComponent as Rat } from "./icons/rat.svg";

function MyComponent() {
  return (
    <div>
      <Rat width="24" height="24" />
    </div>
  );
}
```

### Method 2: Using Index Import

```tsx
import ZodiacIcons from "./icons";
// or import specific ones:
import { Rat, Ox, Tiger } from "./icons";

function MyComponent() {
  return (
    <div>
      <ZodiacIcons.rat width="24" height="24" />
      {/* or */}
      <Rat width="24" height="24" />
    </div>
  );
}
```

## Notes

- Each SVG is sized appropriately to contain only the zodiac symbol with minimal whitespace
- All icons maintain the original styling and proportions from the source SVG
- The viewBox is adjusted to properly contain each icon 
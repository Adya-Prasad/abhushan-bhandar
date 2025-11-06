# Abhushan Bhandar - Jewellery Gallery App

A simple, fast jewellery showcase app for displaying your shop's collection.

## Features

✨ **Light & Premium Theme**
- Rose gold color (#c19676)
- Clean white background with gradient
- Elegant, minimal design

📱 **Simple Structure**
- Homepage with 8 jewellery categories
- Category detail pages
- Upload & Orders sections

🎯 **Categories**
- Rings
- Earrings
- Bangles
- Pendants
- Payal
- Nosering
- Necklaces
- Chains

## Quick Start

```bash
# Start the app
npm start

# Then press:
# a - for Android
# i - for iOS  
# w - for Web
```

## Project Structure

```
app/
├── _layout.js          # Root layout
├── index.js            # Homepage
├── add.js              # Upload page (route: /add)
├── wishlists.js        # Wishlists / Orders page (route: /wishlists)
└── category/
    └── [name].js       # Category pages

constants/
├── theme.js            # Colors, spacing, fonts
└── categories.js       # Categories list

assets/
└── icons/              # Category icons
```

## Customization

### Change Colors
Edit `constants/theme.js`:
```javascript
export const Colors = {
  primary: "#c19676",  // Change this
  // ...
};
```

### Add/Edit Categories
Edit `constants/categories.js`:
```javascript
export const CATEGORIES = [
  { name: "Rings", icon: "ring-icon.png" },
  // Add more...
];
```

### Add Icons
Place PNG icons in `assets/icons/` folder (100x100px recommended)

## Custom Icons

All icons are inline SVG (no icon libraries or separate files):
- Order icon - Shopping bag SVG
- Upload icon - Upload arrow SVG  
- Back icon - Back arrow SVG

SVG code is directly embedded in the JSX for simplicity.

## Tech Stack

- Expo SDK 54
- React Native
- Expo Router (file-based routing)
- expo-linear-gradient
- react-native-svg (for custom icons)

---

Built for Abhushan Bhandar

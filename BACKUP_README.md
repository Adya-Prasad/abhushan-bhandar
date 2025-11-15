# Backup Images Feature

## Installation

Install the required package:

```bash
npx expo install expo-media-library
```

Then restart your development server.

## How to Use

1. **Access Backup Page**: On the home screen, tap the "Backup & Restore" card (shield icon)

2. **Download All Images**:
   - Tap "Download All Images" button
   - Grant permission to save photos
   - All images will be saved to your device gallery

## What Gets Downloaded

- All jewelry item images
- All custom category icon images
- Images are saved with descriptive filenames

## Important Notes

- Images are saved directly to your Photos/Gallery app
- Works with cloud photo backup (Google Photos, iCloud)
- Much simpler than JSON export/import
- No complex file management needed

## User Instructions

Tell your users:

> **Before uninstalling the app:**
> 1. Open the app
> 2. Tap "Backup & Restore" on home screen
> 3. Tap "Download All Images"
> 4. Grant permission when asked
> 5. All images saved to your gallery!
>
> **After reinstalling:**
> 1. Reinstall the app
> 2. Add images from your gallery
> 3. Your images are safe and ready to use!

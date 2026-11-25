# Lunaria Personal Universe

LUNARIA — MERGE STARTER V1 AND V2

I am providing two ZIP files containing the source code for my application, Lunaria.

- ZIP 1: Lunaria V1 — the original application foundation, initial design, navigation, modules, and file upload concept.
- ZIP 2: Lunaria V2 — the improved implementation with additional functionality, Supabase authentication, database integration, file management, workspace, diary, knowledge garden, weather, randomizer, and arcade.

Your task is to combine both versions into ONE complete application.

CRITICAL INSTRUCTIONS

1. Inspect and understand both ZIP projects before making changes.
2. Do not create two separate applications.
3. Do not simply overwrite V1 with V2.
4. Use V1 as the original design and feature reference.
5. Use V2 as the functional development reference.
6. Merge the best parts of both versions into one consistent codebase.
7. Preserve all useful features from both versions.
8. Resolve duplicate components, routes, dependencies, and database definitions.
9. Do not remove features just because they are not fully implemented yet.
10. Do not create fake functionality or nonfunctional buttons.

APPLICATION IDENTITY

Name: Lunaria

Concept: A magical personal digital universe and all-in-one life organizer.

Lunaria should feel like a combination of:

- Personal dashboard
- Digital archive
- Productivity workspace
- Personal journal
- Knowledge library
- Media library
- Entertainment space
- Personal customization system

DESIGN

Preserve Lunaria's original visual identity:

- Dreamy pastel lavender and pink.
- Magical, ethereal and whimsical atmosphere.
- Stars, moons, flowers, sparkles and fantasy details.
- Beautiful cards, rounded elements and soft gradients.
- Cute but sophisticated.
- Rich visual details, not overly minimalist.

Do not turn the application into a generic admin dashboard.

FEATURES TO PRESERVE AND MERGE

Include all these modules:

1. Home Dashboard
2. Daily World
3. Workspace
4. Calendar
5. Arcade
6. Explore
7. World Weather
8. Randomizer
9. Knowledge Garden
10. Memories
11. My Diary
12. My Vault
13. Collections
14. My Garden
15. Settings
16. Universal Add / Upload system

SUPABASE

Use one Supabase project and one consistent database schema.

Preserve the existing V1 and V2 migrations where possible. Reconcile duplicate definitions before creating new migrations.

Implement:

- Authentication.
- User profiles.
- User-specific records.
- Row Level Security.
- Private Storage.
- File metadata.
- Secure upload and deletion.
- Persistent user preferences.

Never expose service-role keys in frontend code.

FILE UPLOAD SYSTEM

Users must be able to add files directly inside the application without editing source code.

Support photos, videos, audio, music, PDFs and documents.

Allow users to create collections, organize files, preview supported media, and delete files.

APP LOCK

The requested initial PIN is 1440.

Implement this as a separate local convenience lock, with the ability to change the PIN. Do not store the PIN in plaintext or hardcode it as a universal secret.

RESPONSIVE DESIGN

The application must work on:

- Android and iOS mobile browsers.
- Desktop and laptop screens.

DEVELOPMENT PROCESS

First, analyze both ZIP projects and produce a concise merge plan.

Then:

1. Merge the codebase.
2. Resolve build errors.
3. Configure Supabase integration.
4. Reconcile SQL migrations.
5. Implement missing functionality.
6. Test all navigation and interactive controls.
7. Run a production build.
8. Report completed features and remaining limitations.

Do not claim that a feature is complete unless it actually works.

Final goal: Deliver one unified, beautiful, functional Lunaria application that combines the original V1 foundation and V2 improvements. I will add more Zip later

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6c85a65f-7736-4513-9806-de6db2c22bcb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

# RANCO media guide

How to add, replace and remove website photographs using only GitHub's web
interface. No code changes are needed.

## How it works

1. Upload a photo to the right folder under `media/` on GitHub.
2. Commit the change.
3. Cloudflare rebuilds the site (a few minutes), and the photo appears.

Every build scans `media/`, resizes each photo to several sizes in WebP format,
and gives each file a name based on its content. A changed photo always gets a
new address, so visitors never see an old cached version.

> Changes reach the live site only when they are committed to the `main` branch.

## Where each photo goes

| Folder | Used for | Recommended size |
|---|---|---|
| `media/home/hero/` | Full-screen homepage photo | Landscape, 2400 × 1600 px or larger |
| `media/home/gallery/` | Floating gallery after the opening (the first file opens to fill the screen) | Up to 7 photos, mixed orientation, 1600 px or larger |
| `media/home/vision/` | Chapter 01, Your Vision: `01-` large image, `02-` small detail | Landscape 2000 px wide; detail portrait |
| `media/home/craft/` | Chapter 02, Our Craft: `01-` large portrait, `02-` small detail | 1600 px or larger |
| `media/home/strip/` | Full-width image band opening Chapter 02 | Wide landscape, 2400 px wide |
| `media/home/walkthrough/` | Chapter 04, the exhibition walkthrough (captioned "Illustrative photography") | Up to 6 landscape photos, 4:3, 2000 px wide |
| `media/home/statement/` | Blurred backdrop behind "Crafting spaces. Creating dreams." | Any |
| `media/home/closing/` | Image band in the final chapter | Landscape, 2400 px wide |
| `media/home/services/` | Services section background | Landscape, 2000 px wide |
| `media/services/<service>/` | Service pages and service hover images | Landscape, 1600 px wide |
| `media/service-areas/<district>/` | District images | Portrait 3:4, 1600 px tall |
| `media/about/hero/`, `media/about/gallery/` | About page | Landscape, 2400 px wide |
| `media/projects/<project>/cover/`, `gallery/`, `progress/` | Project portfolio | Any orientation, 1600 px or larger |
| `media/shared/textures/`, `media/shared/backgrounds/` | Decorative backgrounds | Any |

Each folder has a `README.md` describing its use. Larger originals are fine:
the build creates the smaller sizes, and never enlarges a small photo.

## Supported formats

`.jpg`, `.jpeg`, `.png`, `.webp` and `.avif`. Phone photos are fine; their
rotation is corrected automatically.

## File names and order

- Photos are used in file-name order, with numbers sorted naturally:
  `01-front-elevation.jpg`, `02-living-room.jpg`, `03-kitchen.jpg`, … `10-…`.
- Use lowercase letters, numbers and hyphens. Avoid spaces.
- Where a section shows **one** photo (hero, strip, statement, closing), it is
  always the **first** file in name order. Nothing is chosen at random.
- While a homepage folder is empty, the hero photos stand in for it, so the
  page is never broken. The preview build marks any slot still without a photo
  as a placeholder; production simply leaves it out.
- Folders and files starting with `_` or `.` are ignored.

## Alt text (descriptions)

Alt text describes a photo for people using screen readers and for search
engines. It is never invented from the file name. Add an `images.json` file to
the folder:

```json
{
  "images": {
    "01-front-elevation.jpg": "Front of a two-storey house with a tiled roof and a covered sit-out",
    "02-living-room.jpg": "Living room with timber ceiling and large windows"
  }
}
```

Describe only what is visible. Do not name a location or project unless it is
verified. For purely decorative folders (textures, backgrounds), use:

```json
{ "decorative": true }
```

The build lists any photo that has no description, so it can be added.

## Replacing a photo (for example the hero)

- **Same name:** upload the new file with exactly the same name (for example
  `01-hero.jpg`) to overwrite it, then commit.
- **New photo first:** upload it with a name that sorts first (for example
  `00-new-hero.jpg`), or delete the old one.

Update the description in `images.json` if the photo changed.

## Removing a photo

Delete the file on GitHub and commit. If a folder becomes empty, the site shows
a neutral background where needed, or leaves the image out. Also remove its
entry from `images.json`; the build warns about entries for missing files.

## Adding a project

Projects appear only when they are verified **and** explicitly published.

1. Open `media/projects/_example-project/` and copy its structure into a new
   folder, for example `media/projects/kottayam-home-renovation/`. Use
   lowercase letters, numbers and hyphens.
2. Upload photos to `cover/` (at least one, required), `gallery/` and, if
   wanted, `progress/`.
3. Add `project.json`:

```json
{
  "slug": "kottayam-home-renovation",
  "title": "Kottayam Home Renovation",
  "district": "Kottayam",
  "category": "Home Renovation",
  "description": "A verified description of the work, at least 40 characters long.",
  "published": false
}
```

- `slug` must match the folder name.
- `district` must be one of: Kottayam, Pathanamthitta, Idukki, Ernakulam.
- `category` must be one of the service names in `src/content/taxonomy.json`.

4. When every detail has been confirmed, change `"published"` to `true` and
   commit. If anything is missing or invalid, the project stays hidden and the
   build log explains why.

Never publish photos of work RANCO did not do, and never present stock or
inspiration images as RANCO projects.

## Troubleshooting

| Problem | Check |
|---|---|
| Photo does not appear | Is it in the right folder, with a supported extension, committed to `main`? Has the Cloudflare build finished? |
| Wrong photo used | Single-photo sections use the first file in name order. Rename with `00-` or `01-`. |
| Project not showing | Is `"published": true` set? Does `cover/` have a photo? Check the build log for "marked published but not shown". |
| Photo skipped | The build log says "not a readable image": re-export the file as JPEG and upload it again. |
| Description missing | Add the file name to `images.json` in that folder. |

Build messages appear in Cloudflare: Workers & Pages → `ranco` → Deployments →
the build → Build log. Look for lines starting with `media:`.

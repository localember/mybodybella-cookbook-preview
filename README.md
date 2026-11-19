# My Body Bella cookbook recipe page preview

Design preview only. Not the live site.

Preview: https://localember.github.io/mybodybella-cookbook-preview/

Nothing here is published on mybodybella.com.

## Repeatable template

Each cookbook is one JSON file in `data/`. The example is `data/sample-cookbook.json`.

To mock another cookbook:

1. Copy `data/sample-cookbook.json` to `data/your-slug.json`.
2. Change the title, intro, cover path, and recipes in that file.
3. Open the preview with `?book=your-slug`.

The page layout, search, category chips, and cards stay the same. Only the data file changes.

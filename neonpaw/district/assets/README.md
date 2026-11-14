# AFTERLIGHT game art

Created for this project with OpenAI image generation on2026-11-12.
canal-night.png: hand-painted night harbor backdrop, non-interactive.
buildings.png: transparent three-column atlas: workshop, garden, shelter.
Original generated images retained under /workspace/generated_images in the
working environment. Runtime uses these repository assets, with procedural fallback.
Sprites are scaled and dimmed by the renderer to communicate power state.
Simulation geometry, traversable tiles, bridges and actors remain code-rendered.

characters.png: four-quadrant atlas: Nox, Miso, Lumi, Pixel (reading order).
nox-poses.png: idle, two walking contacts, contented blink. Original generated
sources retained. Runtime crops alpha bounds per quadrant and caches two facings.
Characters are non-anthropomorphic cats: cute, expressive, stylish, non-erotic.

2026-11-13: neighbour-expressions.png generated from the approved character atlas.
2x2: Lumi neutral/happy, Pixel neutral/wink. Original characters.png remains
byte-identical to approved commit4420d7b. Expanded views use original portraits;
positive world states may display matching new expressions. Miso's normal idle
uses the original approved sprite; movement/blink uses his animation sheet.

2026-11-14 unified harbor art, generated with image_gen using existing building
and paving references. Original generated files copied unchanged into repository:
harbor-paving.png: four flat isometric stone surfaces.
harbor-crossings.png: water / timber bridge / living bridge / water (2x2).
harbor-details.png: olive planter / lantern / bench / flower pots (2x2).
Runtime fits tiles to the existing projection and caches them; optional assets
fail independently to the procedural fallback. Bench retained but not placed.

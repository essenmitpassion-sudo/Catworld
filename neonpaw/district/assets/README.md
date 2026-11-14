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

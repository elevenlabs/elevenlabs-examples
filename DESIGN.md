# Design Guidelines

Follow these conventions when building example UIs.

## Layout

- Use a single centered column (`max-w-2xl`, `mx-auto`, `px-6`)
- Keep the layout flat — avoid nested cards, panels, or bordered containers
- Use spacing (`mt-*`, `space-y-*`) and typography to separate sections, not boxes
- One control area, one content area — keep everything else unboxed

## Styling

- Neutral color palette for text and borders (`text-neutral-900`, `text-neutral-500`, `border-neutral-200`)
- White background (`bg-white`)
- No decorative styles: no gradients, heavy shadows, oversized rounded cards, ornamental icons
- Buttons: `rounded-md`, `px-4 py-2`, `text-sm font-medium`
- Small muted text for labels and status: `text-xs text-neutral-400`

## Components

- Prefer preloaded components from `components/ui/` when available
- Avoid adding custom UI components unless strictly required
- Render interactive components (waveforms, visualizations) inline without extra wrapper containers

## Principles

- Prioritize correctness and reliability over styling
- Keep it minimal and utilitarian
- Compact spacing, neutral colors, no decorative hero/nav elements

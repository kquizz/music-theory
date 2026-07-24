# Music Theory

Interactive scale / chord / note visualizer for guitar and piano, with a notation staff.
Rails-served, vanilla Canvas + Stimulus front-end. No database — every view is a shareable URL.

## Develop
- `bin/rails server` → http://localhost:3000
- JS unit tests: `npx vitest run`
- Rails tests: `bin/rails test` and `bin/rails test:system`

## URLs
- `/guitar/scale/C/dorian`
- `/piano/chord/A/maj7`
- `/guitar/notes/E`

## Adding a scale/chord/instrument
Update BOTH the JS table (`app/javascript/theory/*` or `instruments/config.js`)
AND the matching allow-list constant in `app/controllers/views_controller.rb`.

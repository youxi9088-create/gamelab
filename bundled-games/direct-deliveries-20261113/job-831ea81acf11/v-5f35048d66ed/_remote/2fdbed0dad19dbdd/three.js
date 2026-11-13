// The single pinned three (0.185.1), and the ONLY way a Remix game reaches it:
//
//   import * as THREE from '@remix-gg/three/three'
//
// This must stay a FLAT star re-export. `export * as THREE from 'three'` forces
// the consumer's bundler to materialize the whole module object, which kills
// tree-shaking: measured in this repo on an identical scene, the flat star
// bundles to 623,623 B and the namespace re-export to 748,893 B. Wrapping the
// same scene in `function build(THREE, ...)` is just as bad (752,384 B), which
// is why nothing in this SDK ever takes THREE as a parameter.
export * from '../43b35e11ca3eada7/three.module.min.js';

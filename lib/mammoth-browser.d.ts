// mammoth doesn't ship its own TypeScript types (and there's no @types/mammoth
// package on npm either), so this just tells TypeScript the module exists.
// lib/fileTextExtract.ts still narrows the actual shape it gets back at
// runtime rather than trusting this blindly.
declare module "mammoth";

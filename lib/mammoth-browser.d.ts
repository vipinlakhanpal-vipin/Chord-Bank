// mammoth ships types for its Node entry point ("mammoth") but not for its
// separate browser bundle ("mammoth/mammoth.browser"), which lib/fileTextExtract.ts
// imports directly (see that file's comment for why). This just tells
// TypeScript that path exists; fileTextExtract.ts still narrows the actual
// shape it gets back at runtime since a plain CommonJS bundle like this one
// isn't guaranteed to land on a particular interop shape.
declare module "mammoth/mammoth.browser";

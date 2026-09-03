/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdfjs-dist's Node build path references the optional native "canvas"
    // package (only used server-side for rendering pages to an image, which
    // this app never does — it only extracts text, client-side, from an
    // uploaded PDF in the bulk importer). Webpack still tries to resolve it
    // while bundling for the browser; telling it there's no such module lets
    // that code path bundle as dead code instead of failing the build.
    config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    return config;
  },
};

module.exports = nextConfig;

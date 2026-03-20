const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next', // default is fine
  turbopack: {
    root: path.resolve(__dirname), // ABSOLUTE path to project
  },
};

module.exports = nextConfig;
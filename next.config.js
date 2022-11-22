/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");
module.exports = {
  reactStrictMode: false,
  // swcMinify: true,
  i18n,
  images: {
    domains: ["i.ytimg.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**wikiart.org",
        pathname: "/images/**",
      },
    ],
  },
};

module.exports = {
  siteUrl: "https://whispernet.chat",
  changefreq: "weekly",
  generateRobotsTxt: true,
  transform: function (config, path) {
    let customPriority;

    if (path === "/") {
      customPriority = 0.9;
    }

    if (path === "/login" || path === "/signup") {
      customPriority = 0.8;
    }

    if (path === "/opengraph-image.png") {
      return null;
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: customPriority || config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};

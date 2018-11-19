const {resolve} = require('path');
const pwaManifest = require('@pwa/manifest');
const pwaManifestIcons = require('@pwa/manifest-icons');

async function unblock (config, options, nextConfig) {
  const {
    isServer,
    dev,
    buildId,
    defaultLoaders,
    config: {
      distDir
    }
  } = options

  if (!defaultLoaders) {
    throw new Error(
      'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
    )
  }

  const {manifest} = nextConfig;

  if (!isServer && !dev) {
    const m = await pwaManifest({
      "background_color": "#FFFFFF",
      "theme_color": "#FFFFFF",
      "start_url": "/?utm_source=web_app_manifest",
      ...manifest
    });

    if (manifest.icons && manifest.icons.src) {
      m.icons = await pwaManifestIcons({
        src: manifest.icons.src,
        cache: manifest.icons.cache || false,
        output: resolve(process.cwd(), `./static/manifest/icons`),
        publicPath: '/static/manifest/icons/',
        sizes: manifest.icons.sizes || [192, 512]

      });
    }

    await pwaManifest.write('./static/manifest/', m);
  }
}
module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      unblock(config, options, nextConfig)
      const {webpack} = nextConfig;

      if (typeof webpack === 'function') {
        return webpack(config, options);
      }

      return config;
    }
  })
}

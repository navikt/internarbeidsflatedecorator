const fs = require('fs');
const path = require('path');
const CracoLessPlugin = require('craco-less');
const Base64InlineLoaderPlugin = require('craco-base64-inline-loader');
const cssprefixer = require('postcss-prefix-selector');
const BUILD_PATH = path.resolve(__dirname, './build');

const RemoveCssHashPlugin = {
    overrideWebpackConfig: ({
        webpackConfig,
        cracoConfig,
        pluginOptions,
        context: { env, paths }
    }) => {
        const plugins = webpackConfig.plugins;
        plugins.forEach((plugin) => {
            const options = plugin.options;

            if (!options) {
                return;
            }

            if (options.filename && options.filename.endsWith('.css')) {
                console.log('rewriting target', options);
                options.filename = 'static/css/[name].css';
                options.chunkFilename = 'static/css/[name].chunk.css';
            }
        });

        fs.writeFileSync('out.json', JSON.stringify(webpackConfig.plugins, null, 2), 'utf-8');

        return webpackConfig;
    }
};

const RemoveJsHashPlugin = {
    overrideCracoConfig: ({ cracoConfig, pluginOptions, context: { env, paths } }) => {
        cracoConfig.webpack = {
            configure: {
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            default: false,
                            vendors: false
                        }
                    },
                    runtimeChunk: false
                },
                output: {
                    path: BUILD_PATH,
                    filename: 'static/js/head.v2.min.js'
                }
            }
        };

        return cracoConfig;
    }
};

module.exports = {
    style: {
        postcss: {
            plugins: [
                cssprefixer({
                    prefix: '.dekorator',
                    exclude: ['html', 'body', '.dekorator'],
                    transform: function(prefix, selector, prefixedSelector) {
                        if (selector.startsWith('body ')) {
                            return `body ${prefix} ${selector.slice(5)}`;
                        } else if (selector.startsWith('html ')) {
                            return `html ${prefix} ${selector.slice(5)}`;
                        } else if (selector.startsWith('.dekorator ')) {
                            return selector;
                        } else if (selector.includes('modal')) {
                            return selector;
                        }
                        return prefixedSelector;
                    }
                })
            ]
        }
    },
    plugins: [
        { plugin: CracoLessPlugin },
        {
            plugin: Base64InlineLoaderPlugin,
            options: {
                test: /\.svg$/
            }
        },
        { plugin: RemoveCssHashPlugin },
        { plugin: RemoveJsHashPlugin }
    ]
};

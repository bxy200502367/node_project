const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // 新版本中，你需要从 clean-webpack-plugin 导出 CleanWebpackPlugin
const path = require("path");
const webpack = require("webpack");

module.exports = {
    target: "node", // 设置目标环境为 Node.js
    entry: "./index.mts",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "main.cjs",
        environment: {
            module: true,
        },
    },
    resolve: {
        extensions: [".mts", ".mjs", ".ts", ".tsx", ".js"],
        // fallback: {
        // "path": require.resolve("path-browserify"),
        // "fs": require.resolve("browserify-fs"),
        // "util": require.resolve("util"),
        // "stream": require.resolve("stream-browserify"),
        // "querystring": require.resolve("querystring-es3"),
        // "crypto": require.resolve("crypto-browserify")
        // },
        // alias: {
        //     'events': 'events'
        // }
    },
    module: {
        rules: [
            // {
            //     test: /\.mjs$/,
            //     exclude: /(node_modules|bower_components)/,
            //     use: {
            //         loader: "babel-loader",
            //         options: {
            //             presets: ["@babel/preset-env"],
            //         },
            //     },
            //     type: "javascript/auto",
            // },
            {
                test: /\.mts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    // module: {
    //     rules: [
    //         {
    //           test: /\.mts$/,
    //           use: [
    //             {
    //               loader: 'babel-loader',
    //               options: {
    //                 presets: ['@babel/preset-env']
    //               }
    //             },
    //             'ts-loader'
    //           ],
    //           exclude: /node_modules/,
    //         },
    //     ],
    // },
    devtool: process.env.NODE_ENV === "production" ? false : "inline-source-map",
    devServer: {
        // contentBase: './dist', // contentBase 选项已经被移除。你应该使用 static 选项来替代它。
        static: {
            directory: path.join(__dirname, "../dist"),
        },
        // stats: 'errors-only', // 新版本中，这个选项已经被移除
        devMiddleware: {
            stats: "minimal",
        }, // devMiddleware.stats 选项来替代它
        compress: false,
        host: "localhost",
        port: 8089,
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ["./dist"],
        }),
        new webpack.NormalModuleReplacementPlugin(/\.mjs$/, function (resource) {
            if (!resource.context.includes('node_modules')) {
                resource.request = resource.request.replace(/\.mjs$/, ".mts");
            }
        }),
        // new HtmlWebpackPlugin({
        //     template: './src/template/index.html'
        // }),
        // new webpack.ProvidePlugin({
        //     process: 'process/browser'
        // }),
        // new webpack.ProvidePlugin({
        //     Buffer: ['buffer', 'Buffer'],
        // })
    ],
    externals: {
        // 'mongodb-client-encryption': 'mongodb-client-encryption',
        // 'kerberos': 'kerberos',
        // '@mongodb-js/zstd': '@mongodb-js/zstd',
        // '@aws-sdk/credential-providers': '@aws-sdk/credential-providers',
        // 'gcp-metadata': 'gcp-metadata',
        // 'snappy': 'snappy',
        // 'socks': 'socks'
    },
    stats: {
        // warningsFilter: (warning) => /mongodb/.test(warning),
        warningsFilter: /mongodb/,
    }
};

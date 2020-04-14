module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        main: './src/app.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [
            {
                test: /.scss$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader',
                    options: {
                        sourceMap: true
                    }
                }, {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true
                    }
                }]
            }, {
                test: /.js$/,
                use: [ 'babel-loader' ]
            }
        ]
    }
}

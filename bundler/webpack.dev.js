import path from 'path'
import { merge } from 'webpack-merge'
import commonConfiguration from './webpack.common.js'
import { internalIpV4 } from 'internal-ip'
import portFinderSync from 'portfinder-sync'

const infoColor = (_message) => {
    return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`
}

export default merge(commonConfiguration, {
    stats: 'errors-warnings',
    mode: 'development',
    devServer: {
        host: 'local-ip',
        port: portFinderSync.getPort(8080),
        open: true,
        https: false,
        allowedHosts: 'all',
        hot: false,
        watchFiles: ['src/**', 'static/**'],
        static: {
            watch: true,
            directory: path.join(process.cwd(), '../static'),
        },
        client: {
            logging: 'none',
            overlay: true,
            progress: false,
        },
        setupMiddlewares: function (middlewares, devServer) {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined')
            }

            internalIpV4().then(localIp => {
                const port = devServer.options.port
                const https = devServer.options.https ? 's' : ''
                const domain1 = `http${https}://${localIp}:${port}`
                const domain2 = `http${https}://localhost:${port}`

                console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`)
            })

            return middlewares
        },
    },
})
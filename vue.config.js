const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: false,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  pwa: {
    name: 'Tractivity',
    themeColor: '#325D88',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    start_url: '/index.html',
    workboxOptions: {
      skipWaiting: true
    }
  },
  configureWebpack: {
    devtool: 'eval-source-map',
    target: 'web'
  }
})

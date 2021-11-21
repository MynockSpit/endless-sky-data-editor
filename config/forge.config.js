module.exports = {
  packagerConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'endless_sky_data_editor_electron'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: [
        'darwin', 'linux', 'win32'
      ]
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      repository: {
        owner: 'MynockSpit',
        name: 'endless-sky-data-editor'
      },
      draft: true
    }
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './config/webpack.main.config.js',
        renderer: {
          config: './config/webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/ui/index.html',
              js: './src/ui/app.jsx',
              name: 'ui',
              preload: {
                js: './src/main/preload.js'
              }
            }
          ]
        }
      }
    ]
  ]
}
module.exports = {
  packagerConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "endless_sky_data_editor_electron"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: [
        "darwin"
      ]
    },
    {
      name: "@electron-forge/maker-deb",
      config: {}
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {}
    }
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./config/webpack.main.config.js",
        renderer: {
          nodeIntegration: true,
          config: "./config/webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/client/index.html",
              js: "./src/client/app.jsx",
              name: "main_window"
            }
          ]
        }
      }
    ]
  ]
}
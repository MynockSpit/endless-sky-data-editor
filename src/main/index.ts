import { app, BrowserWindow, dialog } from 'electron';
import _ from 'lodash';
import { fireEventServer, onEventServer } from '../utilities/handleEvent';
import collectData from './collect-local-data'
import { addData, addPlugin, getUpdateConfig } from './read-write-user-config';

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const UI_WEBPACK_ENTRY: string;
declare const UI_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: UI_PRELOAD_WEBPACK_ENTRY
      // if you want node integration, check this bug first
      // https://github.com/electron-userland/electron-forge/issues/2618
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(UI_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// listing to events
// const dataPath = handleEventServer('add-data-path')
// dataPath.listen()
onEventServer('add-data-path', async (event, type) => {
  const { filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })

  if (filePaths.length) {
    getUpdateConfig({
      roots: {
        [filePaths[0]]: type === 'data' ? addData(filePaths[0]) : addPlugin(filePaths[0])
      }
    })

    fireEventServer('update-data', await collectData())
  }
})

onEventServer('toggle-data-path', async (event, path) => {
  getUpdateConfig((config: any) => {
    const previousValue = _.get(config, ['roots', path, 'isActive'])
    _.set(config, ['roots', path, 'isActive'], !previousValue)
    return config
  })

  fireEventServer('update-data', await collectData())
})

onEventServer('remove-data-path', async (event, path) => {
  getUpdateConfig((config: any) => {
    delete config?.roots[path]
    return config
  })

  fireEventServer('update-data', await collectData())
})

onEventServer('update-data', async () => {
  fireEventServer('update-data', await collectData())
})

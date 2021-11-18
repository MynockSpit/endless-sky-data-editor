const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    requestData: () => {
      const result = ipcRenderer.sendSync('update-data')
      console.log('update', result)
    },
    onDataChange: (callback) => {
      return ipcRenderer.on('update-data', callback)
    }
  }
)
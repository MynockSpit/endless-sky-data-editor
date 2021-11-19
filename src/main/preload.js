import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  requestData: () => {
    ipcRenderer.sendSync('request-data-update')
  },
  onDataChange: (callback) => {
    return ipcRenderer.on('data-updated', callback)
  }
})

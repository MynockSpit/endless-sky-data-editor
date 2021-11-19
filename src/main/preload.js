import { contextBridge, ipcRenderer } from 'electron'

function exposeInMainWorld(place, stuff) {
  // if we turn context isolation on (and figure out how to fix the path require
  // issue) flop this to true (or just delete the other half)
  let useRealExposer = false 
  if (useRealExposer) {
    contextBridge.exposeInMainWorld(place, stuff)
  } else {
    if (!window[place]) window[place] = {}

    Object.entries(stuff).forEach(([key, value]) => {
      window[place][key] = value
    })
  }
}

exposeInMainWorld('electron', {
  requestData: () => {
    ipcRenderer.sendSync('request-data-update')
  },
  onDataChange: (callback) => {
    return ipcRenderer.on('data-updated', callback)
  }
})

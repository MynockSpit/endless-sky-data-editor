import { BrowserWindow, ipcMain, ipcRenderer } from 'electron'

// listenFor
// 1. returns a function that calls the server on that action
// 2. runs a callback on each receive of that action
// 3. returns a response in the callback if the returned value isn't undefined

type Callback = (...args: Data) => any
type Data = any[];

export function fireEventClient(event: string, ...data: Data) {
  ipcRenderer.send(`client:${event}`, ...data)

  return new Promise(resolve => {
    ipcRenderer.once(`server:${event}`, (...args) => resolve(args))
  })
}

export function onEventClient(event: string, callback: Callback) {
  ipcRenderer.on(`server:${event}`, callback)
}

export async function fireEventServer(event: string, ...data: Data) {
  BrowserWindow.getAllWindows().forEach(window => window.webContents.send(`server:${event}`, ...data))

  return new Promise(resolve => {
    ipcMain.once(`client:${event}`, (...data: Data) => resolve(data))
  })
}

export function onEventServer(event: string, callback: Callback) {
  ipcMain.on(`client:${event}`, callback)
}
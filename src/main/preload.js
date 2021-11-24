import { contextBridge } from 'electron'
import { fireEventClient, onEventClient } from '../utilities/handleEvent'

contextBridge.exposeInMainWorld('electron', {
  fireEvent: (event, ...args) => fireEventClient(event, ...args),
  onEvent: (event, callback) => onEventClient(event, callback),

  updateData: (...args) => fireEventClient('update-data', ...args),
  onDataChange: (callback) => onEventClient('update-data', callback),
  
  updateDataPath: (...args) => fireEventClient('add-data-path', ...args),
  onDataPathChange: (callback) => onEventClient('add-data-path', callback)
})
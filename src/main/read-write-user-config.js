import fs from 'fs';
import os from 'os';
import path from 'path';
import _ from 'lodash';

function validateRoots(roots) {
  Object.entries(roots).forEach(([path, meta]) => {
    meta.path = path // put the path in the meta for easy access

    // determine if there's any actual data there
    try {
      fs.statSync(path)
      meta.isValid = true
    } catch (e) {
      meta.isValid = false
    }
  })
}

let dataId = 0
export function addPlugin(path, roots) {
  let thing = { type: 'plugin', isActive: true, isValid: false, path, id: dataId++ }
  if (roots) roots[path] = thing
  return thing
}

export function addData(path, roots) {
  let thing = { type: 'data', isActive: true, isValid: false, path, id: dataId++ }
  if (roots) roots[path] = thing
  return thing
}

function getDefaultRoots() {
  let roots = {}
  if (process.platform === 'darwin') {
    addData('/Applications/Endless Sky.app/Contents/MacOS/Endless Sky/data/', roots)
    addData(`${os.homedir()}/Library/Application Support/Steam/steamapps/common/Endless Sky/data/`, roots)

    // handle the ES2Launcher somehow?
    // "~/Library/Application Support/ESLauncher2/instances/"
    // "Endless Sky.app/Contents/Resources/data/"

    addPlugin(`${os.homedir()}/Library/Application Support/endless-sky/plugins/`, roots)

    let inGamePluginDirGen = installLocation => path.resolve(installLocation, '../EndlessSky.app/Contents/Resources/plugins')

    Object.entries(roots).forEach(([path, meta]) => {
      if (meta.type === 'data') {
        addPlugin(inGamePluginDirGen(path), roots)
      }
    })

  } else if (process.platform === 'win32') {
    // I don't use windows, so it only loads plugins until I can find someone with that info
    // roots[''] = { type: 'data' }

    // handle the ES2Launcher somehow?

    // plugins
    addPlugin(`${os.homedir()}\\AppData\\Roaming\\endless-sky\\plugins\\`, roots)
  } else {
    // I don't use linux either, so, uh yeah. No idea
    // roots[''] = { type: 'data' }

    // handle the ES2Launcher somehow?

    // plugins
    addPlugin(`${os.homedir()}/.local/share/endless-sky/plugins/`, roots)
    addPlugin('/usr/share/endless-sky/plugins/', roots)
  }
  return roots
}

function getRoots(config) {
  let roots = config?.roots ? {
    ...getDefaultRoots(),
    ...config.roots
  } : getDefaultRoots()

  validateRoots(roots)

  return roots
}

// type Updater<T> = (config: T) => T | T

export function getUpdateConfig(updater) {
  let configPath = path.resolve(__dirname, '../../config.json')
  let config
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch (e) {
    config = {}
    // console.warn(e)
  }

  config.roots = getRoots(config)

  if (updater) {
    if (typeof updater === 'function') {
      config = updater(config)
    } else {
      config = _.merge({}, config, updater)
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(config))

  return config
}
import fs from 'fs'
import os from 'os'

import recursive from 'recursive-readdir';

let allLines = {}
let allTypes = {}
let roots = {}

function getRoots() {
  if (process.platform === 'darwin') {
    // we'll need something in the app to switch where the data comes from.
    roots.data = '/Applications/Endless Sky.app/Contents/MacOS/Endless Sky/data/'
    roots.steam = `${os.homedir()}/Library/Application Support/Steam/steamapps/common/Endless Sky/data/`

    // handle the ES2Launcher somehow?
    // "~/Library/Application Support/ESLauncher2/instances/"
    // "Endless Sky.app/Contents/Resources/data/"

    // plugins
    roots.plugins = `${os.homedir()}/Library/Application Support/endless-sky/plugins/`
    roots.internalPlugins = `${os.homedir()}/Library/Application Support/Steam/steamapps/common/Endless Sky/EndlessSky.app/Contents/Resources/plugins/`

  } else if (process.platform === 'win32') {
    // I don't use windows, so it only loads plugins until I can find someone with that info
    roots.data = '' // ?????
    roots.steam = '' // ?????
    // handle the ES2Launcher somehow?

    // plugins
    roots.plugins = `${os.homedir()}\\AppData\\Roaming\\endless-sky\\plugins\\`
    roots.internalPlugins = '' // ?????
  } else {
    // I don't use linux either, so, uh yeah. No idea
    roots.data = '' // ?????
    roots.steam = '' // ?????
    // handle the ES2Launcher somehow?

    // plugins
    roots.plugins = `${os.homedir()}/.local/share/endless-sky/plugins/`
    roots.internalPlugins = '/usr/share/endless-sky/plugins/'
  }
}

let id = 0;
async function collectData(rootKey) {
  let rootPath = roots[rootKey]
  const files = await recursive(rootPath, ['.DS_Store', 'copyright.txt'])

  // `files` is an array of file paths
  files.forEach(filePath => {
    const file = fs.readFileSync(filePath, 'utf-8').split('\n')

    let stack = []

    file.forEach((line, lineNumber) => {
      let noCommentLine = line.replace(/#.*/, '')
      if (noCommentLine.trim() !== '') {
        let [depth, parsedLine] = tokenize(noCommentLine)
        let lineId = String(id++);

        if (depth <= stack.length) {
          while (depth < stack.length) {
            stack.pop()
          }
          stack.push(lineId)
        } else if (depth === stack.length + 1) {
          stack.push(lineId)
        } else {
          console.log('something very wrong happened with the nesting', parsedLine, line, lineId)
        }

        let parent = stack[stack.length - 2]

        let line = {
          data: parsedLine,
          id: lineId,
          filePath: filePath.replace(rootPath, ''),
          root: rootKey,
          lineNumber: lineNumber + 1,
          depth,
          parent: parent,
          rootParent: undefined,
          key: parsedLine[0].replace(/"/g, ''),
          fullKey: undefined
        }

        if (parent !== undefined) {
          if (!allLines[parent].children) allLines[parent].children = []

          allLines[parent].children.push(line.id)
        }

        line.fullKey = getFullKey(line)
        line.rootParent = getRootParent(line).id

        if (parent === undefined) {
          allTypes[line.key] = true
        }

        allLines[lineId] = line
      }
    })
  })
}

// parse tokens according to the DataFormat
// https://github.com/endless-sky/endless-sky/wiki/DataFormat#data-file-format
function tokenize(string) {
  let tokens = []
  let currentToken = ''
  let insideQuotes = false
  let insideBackticks = false
  let depth = 0
  string.split('').forEach((char, index, chars) => {
    let grouping = insideQuotes || insideBackticks

    if (char === '\t') {
      if (!grouping) {
        if (currentToken) {
          tokens.push(currentToken)
          currentToken = ''
        }
        depth++;
      } else {
        currentToken += char
      }
    }

    else if (char === ' ') {
      if (!grouping) {
        tokens.push(currentToken)
        currentToken = ''
      } else {
        currentToken += char
      }
    }

    else if (char === '"') {
      currentToken += char
      if (insideBackticks) {
        // do nothing
      } else if (!insideQuotes) {
        insideQuotes = true
      } else {
        insideQuotes = false
      }
    }

    else if (char === '`') {
      currentToken += char
      if (insideQuotes) {
        // do nothing
      } else if (!insideBackticks) {
        insideBackticks = true
      } else {
        insideBackticks = false
      }
    }

    else {
      currentToken += char
    }
  })

  if (currentToken !== '') {
    tokens.push(currentToken)
    currentToken = ''
  }

  return [depth, tokens]
}

function getFullKey(line) {
  let key = line.key

  if (line.parent !== undefined) {
    return getFullKey(allLines[line.parent]) + '.' + key
  }
  return key
}

function getRootParent(line) {
  if (line.parent !== undefined) {
    return getRootParent(allLines[line.parent])
  }
  return line
}

export default async function loadData() {
  id = 0
  allLines = {}
  allTypes = {}
  roots = {}

  getRoots()

  try { await collectData('data') } catch (e) { /* ignore */ }
  try { await collectData('steam') } catch (e) { /* ignore */ }
  try { await collectData('plugins') } catch (e) { /* ignore */ }
  try { await collectData('internalPlugins') } catch (e) { /* ignore */ }

  console.log(Object.keys(allTypes).sort(), Object.keys(allTypes).length)

  // fs.writeFileSync('./src/data.json', JSON.stringify({ lines: allLines, roots }, null, 2), 'utf-8')
  return JSON.stringify({ lines: allLines, roots })
}
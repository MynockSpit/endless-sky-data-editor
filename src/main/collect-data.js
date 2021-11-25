import fs from 'fs'
import os from 'os'

import recursive from 'recursive-readdir';
import { getUpdateConfig } from './read-write-user-config.js';

let id = 0;
async function collectData(rootMeta) {
  let theseLines = {}
  let theseTypes = {}
  let files
  try {
    files = await recursive(rootMeta.path, ['.DS_Store', 'copyright.txt'])
  } catch (error) {
    return { error }
  }

  if (files) {
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
            filePath: filePath.replace(rootMeta.path, ''),
            root: rootMeta.id,
            type: rootMeta.type,
            lineNumber: lineNumber + 1,
            depth,
            parent: parent,
            rootParent: undefined,
            key: parsedLine[0].replace(/"/g, ''),
            fullKey: undefined
          }

          if (parent !== undefined) {
            if (!theseLines[parent].children) theseLines[parent].children = []

            theseLines[parent].children.push(line.id)
          }

          line.fullKey = getFullKey(line, theseLines)
          line.rootParent = getRootParent(line, theseLines).id

          if (parent === undefined) {
            theseTypes[line.key] = true
          }

          theseLines[lineId] = line
        }
      })
    })
  }
  // `files` is an array of file paths

  return { lines: theseLines, types: theseTypes }
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

function getFullKey(line, allLines) {
  let key = line.key

  if (line.parent !== undefined) {
    return getFullKey(allLines[line.parent], allLines) + '.' + key
  }
  return key
}

function getRootParent(line, allLines) {
  if (line.parent !== undefined) {
    return getRootParent(allLines[line.parent], allLines)
  }
  return line
}

let once = false
export default async function loadData() {
  id = 0
  let allLines = {}
  let allTypes = {}
  let config = getUpdateConfig()
  let roots = Object.values(config.roots)

  for (let index = 0, meta; (meta = roots[index]); index++) {
    if (meta.isValid && meta.isActive) {
      const data = await collectData(meta, allLines, allTypes)

      if (data.error) meta.error = data.error
      if (data.lines) allLines = { ...allLines,  ...data.lines }
      if (data.types) allTypes = { ...allTypes, ...data.types }
    }
  }

  if (!once) {
    once = true
    console.log(Object.keys(allTypes).sort(), Object.keys(allTypes).length)
  }

  // uncomment this line to write out the data file
  // fs.writeFileSync(`${__dirname}/../data.json`, JSON.stringify({ lines: allLines, roots }, null, 2))

  return JSON.stringify({ lines: allLines, roots })
}
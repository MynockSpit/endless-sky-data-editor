import fs from 'fs'

import recursive from 'recursive-readdir';
import { eachFile, resetId } from '../utilities/parseFiles.js';
import { getUpdateConfig } from './read-write-user-config.js';

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

      eachFile(filePath, file, rootMeta, theseLines, theseTypes)
    })
  }
  // `files` is an array of file paths

  return { lines: theseLines, types: theseTypes }
}

let once = false
export default async function loadData() {
  resetId()
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
  fs.writeFileSync(`${__dirname}/../data.json`, JSON.stringify({ lines: allLines, roots }, null, 2))

  return JSON.stringify({ lines: allLines, roots })
}
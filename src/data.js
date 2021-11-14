import { parseInput } from './parse-input'

import _ from 'lodash'
import dataJson from './data.json'
import { getLineMeta } from './store'
export const data = dataJson

export function getFilteredLines(filter) {
  let filteredLines
  if (filter === '') filteredLines = Object.values(data.lines)
  else {
    let parsedInput = parseInput(filter)

    filteredLines = Object.values(data.lines).filter(line => {

      let matches = parsedInput.every(inputBit => {
        if (inputBit.startsWith('.')) {
          return (line.fullKey).startsWith(inputBit.slice(1))
        } if (inputBit.startsWith('/')) {
          let path = `${data.roots[line.root]}${line.filePath}`
          return (path).includes(inputBit.slice(1))
        } else {
          return line.data.join(' ').includes(inputBit)
        }
      })

      return matches
    })
  }

  let relevantEntries = {}
  filteredLines.forEach(line => {
    relevantEntries[line.rootParent] = data.lines[line.rootParent]
  })

  return Object.values(relevantEntries).sort((entryA, entryB) => {
    return (entryA.data.join(' ').replace(/"/g, '')).localeCompare(entryB.data.join(' ').replace(/"/g, ''))
  })
}

export function getVisibleLines(filteredLines, visibleLines = []) {
  filteredLines.forEach(line => {

    let open = getLineMeta(`${line.id}.open`)

    if (open === undefined) {
      open = (line.parent) ? true : false
    }

    visibleLines.push(line)

    if (open && line.children) {
      console.log('hi')
      getVisibleLines(line.children.map(childId => data.lines[childId]), visibleLines)
    }
  })

  return visibleLines
}
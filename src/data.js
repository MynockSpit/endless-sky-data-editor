import { parseInput } from './parse-input'

import _ from 'lodash'
import dataJson from './data.json'
import { getLineMeta } from './store'
export const data = dataJson

// store the previous set of lines returned from the filter and the previous filter used
// if the previousFilter is a subset (i.e. previous: 'hell'; current: 'hello' ), we can use the previous lines as a starting point
// let previousFilter = ''
let linesDisplayed = Object.values(data.lines)

export function getFilteredLines(filter) {
  let parentLinesMatches = {}
  let linesThatMatch = {}

  if (filter === '') linesDisplayed = Object.values(data.lines).filter(line => !line.parent)
  else {

    // convert the input into 
    let parsedInputLC = parseInput(filter)

    Object.values(data.lines).forEach((line) => {
      let sanitizedDataLC = line.data.map(segment => segment
        .replace(/['"`]/g, '') // make all quotes optional
        .toLowerCase()
      )

      parsedInputLC.forEach((searchPart) => {
        let isAMatch = false
        let matchDetails = {}
        if (searchPart.type === 'resource' || searchPart.type === 'property') {
          // test against the key
          let fullKeyLC = line.fullKey.toLowerCase()

          if (searchPart.type === 'resource') {
            // make sure we only ever match top-level resources
            matchDetails.keyMatches = (line.key === line.fullKey) && (fullKeyLC === searchPart.key)
          } else if (searchPart.type === 'property') {
            matchDetails.keyMatches = (fullKeyLC).endsWith(searchPart.key)
          }

          if (searchPart.value && searchPart.operator === '~=') {
            matchDetails.valueThatMatches = (sanitizedDataLC.find(val => val.includes(searchPart.value)))
            isAMatch = matchDetails.keyMatches && Boolean(matchDetails.valueThatMatches)
          } 
          
          else if (searchPart.value && searchPart.operator === '=') {
            matchDetails.valueThatMatches = (sanitizedDataLC.find(val => val === searchPart.value))
            isAMatch = matchDetails.keyMatches && Boolean(matchDetails.valueThatMatches)
          } 
          
          else {
            // no value? fine, just match
            isAMatch = matchDetails.keyMatches
          }
        }

        else if (searchPart.type === 'file-path') {
          // test against file path
          let pathLC = `${data.roots[line.root]}${line.filePath}`.toLowerCase()
          isAMatch = (pathLC).includes(searchPart.value)
        }

        // else if (searchPart.type === 'key-value') {
        //   matchDetails.keyMatches = sanitizedDataLC[0] === searchPart.key
        //   matchDetails.valueThatMatches = sanitizedDataLC.find(val => val.includes(searchPart.value))

        //   isAMatch = (matchDetails.keyMatches) && Boolean(matchDetails.valueThatMatches)
        // }

        else {
          let dataLC = sanitizedDataLC.join(' ')
          isAMatch = dataLC.includes(searchPart.value)
        }

        if (isAMatch) {
          if (!linesThatMatch[line.id]) linesThatMatch[line.id] = {}
          linesThatMatch[line.id][searchPart.raw] = {
            ...searchPart,
            matchDetails,
            isAMatch
          }
        }

        return isAMatch
      })

      // store the line's matching criteria
      if (linesThatMatch[line.id]) {
        let rootId = line.parent ? line.rootParent : line.id
        let rootsWithChecksMatched = parentLinesMatches[rootId]
        if (!rootsWithChecksMatched) rootsWithChecksMatched = parentLinesMatches[rootId] = {}

        Object.keys(linesThatMatch[line.id]).forEach(type => {
          if (!rootsWithChecksMatched[type]) rootsWithChecksMatched[type] = linesThatMatch[line.id][type]
        })
      }
    })

    // now that we've used it, clear lines displayed
    linesDisplayed = []

    Object.entries(parentLinesMatches).forEach(([parentId, matches]) => {
      // For now, just use a length check. I can't think of a time when a length check won't work, but the future is bright.
      if (Object.keys(matches).length === parsedInputLC.length) {
        linesDisplayed.push(data.lines[parentId])
      }
    })
  }

  return linesDisplayed.sort((entryA, entryB) => {
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
      getVisibleLines(line.children.map(childId => data.lines[childId]), visibleLines)
    }
  })

  return visibleLines
}
// this means match anything and lower
// .path.to.resource() key=value anything /file/path

import { getData } from './store';

// this=equal
// any trailing thing = any value

// fleet FLEET_NAME           // .fleet*=FLEET_NAME             fleet=FLEET_NAME
//   government GOV_NAME      // .fleet.government=GOV_NAME     fleet.government.* === GOV_NAME
//   personality              // .personality~=nemesis          fleet.government
//     nemesis waiting        // .personality.*=nemesis  
//   variant
//     "Fury" 2

export function tokenizeInput(string) {
  let tokens = []
  let currentToken = ''
  let groupingChar = ''
  let isGroupingToken = /["`]/

  ;(string || '').split('').forEach((char, index, chars) => {
    if (char === ' ') {
      if (!groupingChar) {
        if (currentToken) {
          tokens.push(currentToken)
          currentToken = ''
        }
      } else {
        currentToken += char
      }
    }

    else if (isGroupingToken.test(char)) {
      let currentlyGrouping = groupingChar !== ''
      let previousChar = chars[index - 1]
      let isEscaped = previousChar === '\\'

      // if we're not in a group, we're eligible to start one
      // so do so, and don't add it to the current token
      if (!isEscaped) {
        if (!currentlyGrouping) {
          groupingChar = char
        } else {

          // is it possible the group is ending?

          let isEndingToken = char === groupingChar

          if (isEndingToken) { // end group
            groupingChar = ''
          }
        }
      }
      // always add the grouping token back
      currentToken += char
    }

    else {
      currentToken += char
    }
  })

  if (currentToken) {
    tokens.push(currentToken)
  }

  return tokens
}

function unescapeString(string) {
  return string.replace(/\\=/g, '=')
}

function isValueCheck(string) {
  // separate the string
  let keyDone = false
  const segments = string.split('=').reduce((prior, seg) => {
    if (!keyDone) {
      prior.key.push(seg)

      if (!seg.endsWith('\\')) keyDone = true
    }
    else {
      prior.value.push(seg)
    }
    return prior
  }, { key: [], value: [] })

  let key = unescapeString(segments.key.join('='))
  let value = unescapeString(segments.value.join('='))

  if (key && value) {
    if (key.endsWith('~'))
      return {
        key: key.slice(0, -1),
        value: value,
        operator: '~=',
      }
    else {
      return {
        key: key,
        value: value,
        operator: '=',
      }
    }
  }

  return false
  // valid "adsfasd=asdfasdf"
  // invalid "asdfads=asdfasd=asdfasdf"
  // invalid "asdfasd\=asdfasd"
}

export function parseInput(string) {
  return tokenizeInput(string).map(inputBit => {
    let sanitizedInputBit = inputBit.toLowerCase().replace(/\\?(["'`])/g, '')
    let valueCheck = isValueCheck(sanitizedInputBit)
    let furtherSanitizedInputBit = unescapeString(sanitizedInputBit)

    let resourceCheck = furtherSanitizedInputBit.startsWith('#')
    let propertyCheck = furtherSanitizedInputBit.startsWith('.')
    let pathCheck = furtherSanitizedInputBit.startsWith('/')

    if (resourceCheck) {
      let searchPart = {
        raw: inputBit,
        type: 'resource'
      }
      if (valueCheck) {
        searchPart.key = valueCheck.key.slice(1)
        searchPart.value = valueCheck.value
        searchPart.operator = valueCheck.operator
      } else {
        searchPart.key = furtherSanitizedInputBit.slice(1)
      }
      return searchPart
    } else if (propertyCheck) {
      let searchPart = {
        raw: inputBit,
        type: 'property'
      }
      if (valueCheck) {
        searchPart.key = valueCheck.key.slice(1)
        searchPart.value = valueCheck.value
        searchPart.operator = valueCheck.operator
      } else {
        searchPart.key = furtherSanitizedInputBit.slice(1)
      }
      return searchPart
    } else if (pathCheck) {
      return {
        raw: inputBit,
        type: 'file-path',
        value: furtherSanitizedInputBit.slice(1)
      }
    } else {
      return {
        raw: inputBit,
        type: 'search',
        value: furtherSanitizedInputBit
      }
    }
  })
}

let linesDisplayed = Object.values(getData().lines)

export function getFilteredLines(filter, data) {
  let parentLinesMatches = {}
  let linesThatMatch = {}

  if (!filter) linesDisplayed = Object.values(data?.lines ?? []).filter(line => !line.parent)
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
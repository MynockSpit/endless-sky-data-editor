// this means match anything and lower
// .path.to.resource() key=value anything /file/path

// this=equal
// any trailing thing = any value

// fleet FLEET_NAME           // .fleet*=FLEET_NAME             fleet=FLEET_NAME
//   government GOV_NAME      // .fleet.government=GOV_NAME    fleet.government.* === GOV_NAME
//   personality              // .personality~=nemesis    fleet.government
//     nemesis waiting        // .personality.*=nemesis  
//   variant
//     "Fury" 2

export function tokenizeInput(string) {
  let tokens = []
  let currentToken = ""
  let groupingChar = ''
  let isGroupingToken = /["`]/

  string.split('').forEach((char, index, chars) => {
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
          } else { // or not
            currentToken += char
          }
        }
      } else {
        currentToken += char
      }
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
  // let segments = 

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
    let sanitizedInputBit = inputBit.toLowerCase().replace(/\\?(["`])/g, '')
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

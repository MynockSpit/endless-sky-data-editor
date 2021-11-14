export function parseInput(string) {
  let tokens = []
  let currentToken = ""
  let groupingChar = ''
  let isGroupingToken = /['"`]/

  function ifPush() {
    if (currentToken) {
      tokens.push(currentToken)
      currentToken = ''
    }
  }

  string.split('').forEach((char, index, chars) => {
    if (char === ' ') {
      if (!groupingChar) {
        ifPush()
      } else {
        currentToken += char
      }
    }

    else if (isGroupingToken.test(char)) {
      let currentlyGrouping = groupingChar !== ''

      // if we're not in a group, we're eligible to start one
      // so do so, and don't add it to the current token
      if (!currentlyGrouping) {
        groupingChar = char
      } else {
        
        // is it possible the group is ending?

        let previousChar = chars[index - 1]
        let isEscaped = previousChar === '\\'
        let isEndingToken = char === groupingChar
        if (isEndingToken && !isEscaped) {
          // end group
          groupingChar = ''
          ifPush()
        } else {
          currentToken += char
        }
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

let id = 0;
export function resetId() {
  id = 0
}

export function eachFile(filePath, file, rootMeta, theseLines, theseTypes) {
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
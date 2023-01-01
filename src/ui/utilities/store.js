import { parseInput } from './filter'
import { makeStateHook } from './stateHook'

function getQuery(inputKey) {
  if (window.location.search) {
    let params = {}
    window.location.search.slice(1)
      .split('&')
      .forEach(keyValuePair => {
        let [key, value] = keyValuePair.split('=')
        params[key] = value
      })

    return decodeURIComponent(params[inputKey])
  }
  return ''
}

export const [useInput, setInput, getInput] = makeStateHook(getQuery('search'))

export const [useLineMeta, setLineMeta, getLineMeta] = makeStateHook({
  // [id]: { show: true }
})

export const [useData, setData, getData, subscribeToData] = makeStateHook({ loading: true, roots: [], lines: [] })

export const [useAC, setAC, getAC] = makeStateHook({ list: [], map: [], weights: [] })

export function updateAC(entries) {
  let acMap = {}
  let allLines = getData().lines
  let lines = flattenEntries(entries, allLines)

  Object.values(lines).map((line, index) => {
    if (!line.parent) {
      acMap[('#' + line.key)] = 0
    } else {
      acMap[line.propertyKey] = 0
    }
  })

  setAC({
    list: buildAutocomplete(acMap),
    map: acMap,
    weights: []
  })
}

function flattenEntries(entries, allLines) {
  return entries.reduce((lines, entry) => {
    lines.push(entry)
    if (entry.children) {
      lines.push(...flattenEntries(entry.children.map(child => allLines[child]), allLines))
    }
    return lines
  }, [])
}

function buildAutocomplete(acMap) {
  return Object
    .entries(acMap)
    .sort(([aKeyRaw, aWeight], [bKeyRaw, bWeight]) => {
      let aKey = aKeyRaw.replace(/[`"']/g, '').toLowerCase()
      let bKey = bKeyRaw.replace(/[`"']/g, '').toLowerCase()

      if (aWeight !== 0 || bWeight !== 0) return bWeight - aWeight
      if (aKey.includes(bKey)) return 1
      if (bKey.includes(aKey)) return -1
      return aKey.localeCompare(bKey)
    })
    .map(([key, weight]) => key) || []
}

function toMap(list, fn) {
  return list.reduce((obj, item, index, array) => {
    obj[fn(item, index, array)] = item
    return obj
  }, {})
}

export function useFilteredAutocompleteList(value) {
  let [allACs] = useAC()
  let allACsList = allACs.list
  let matchedParts = parseInput(value)
  let alreadyMatchedParts = toMap(matchedParts, item => item.raw)
  let [full, start = '', lastPart] = value.match(/(.+\s+)?(.+)/) || []
  if (matchedParts.length) {
    let allAutocompleteValues = allACsList.filter(autocompleteValue => {
      let inLastPart = autocompleteValue.startsWith(matchedParts[matchedParts.length - 1].raw)
      let notAlreadyMatched = !alreadyMatchedParts[autocompleteValue]
      return inLastPart && notAlreadyMatched
    })
    return allAutocompleteValues
  }
  else {
    return []
  }
}

export function updateACWeight(key) {
  let length = 10
  setAC(autocompletes => {
    if (autocompletes.weights.includes(key)) {
      autocompletes.weights = autocompletes.weights.filter(eachKey => eachKey !== key)
    }

    autocompletes.weights.unshift(key)
    if (autocompletes.weights.length >= length) {
      autocompletes.weights.pop()
    }

    Object.keys(autocompletes.map).map(key => {
      autocompletes.map[key] = 0
    })

    let weight = length
    autocompletes.weights.map((key) => {
      autocompletes.map[key] = weight--
    })

    autocompletes.list = buildAutocomplete(autocompletes.map)

    return autocompletes
  })
}
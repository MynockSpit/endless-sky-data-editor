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

export const [useAC, setAC, getAC] = makeStateHook({ string: '', map: [], weights: [] })

subscribeToData(data => {
  let acMap = {}

  Object.values(data.lines).map((line, index) => {
    if (!line.parent) {
      acMap[('#' + line.key)] = 0
    }
  })

  let acString = buildAutocompleteString(acMap)

  setAC({
    string: acString,
    map: acMap,
    weights: []
  })
})

function buildAutocompleteString(acMap) {
  return ':' + Object
    .entries(acMap)
    .sort(([aKey, aWeight], [bKey, bWeight]) => {
      return bWeight - aWeight || bKey.localeCompare(aKey)
    })
    .map(([key, weight]) => key).join(':')
}

export function determineAC(value) {
  let allACs = getAC().string
  let autocompleteValue = ''
  if (value) {
    let index = allACs.indexOf(':' + value)
    let matchedValuePlus = allACs.slice(index + 1)
    autocompleteValue = matchedValuePlus.slice(0, matchedValuePlus.indexOf(':'))
  }
  return autocompleteValue
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

    autocompletes.string = buildAutocompleteString(autocompletes.map)

    return autocompletes
  })
}
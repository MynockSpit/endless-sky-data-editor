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

export const [useInput, setInput] = makeStateHook(getQuery('search'))

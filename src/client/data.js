import _ from 'lodash'
// import dataJson from './data.json'
import { getLineMeta } from './store'
import { makeStateHook } from './stateHook'

// store the previous set of lines returned from the filter and the previous filter used
// if the previousFilter is a subset (i.e. previous: 'hell'; current: 'hello' ), we can use the previous lines as a starting point
// let previousFilter = ''

export const [useData, setData, getData] = makeStateHook({ loading: true, roots: {}, lines: [] })

window.electron.onDataChange((event, data) => {
  setData(JSON.parse(data))
})

window.electron.requestData()

export function getVisibleLines(filteredLines, visibleLines = []) {
  filteredLines.forEach(line => {

    let open = getLineMeta(`${line.id}.open`)

    if (open === undefined) {
      open = (line.parent) ? true : false
    }

    visibleLines.push(line)

    if (open && line.children) {
      getVisibleLines(line.children.map(childId => getData().lines[childId]), visibleLines)
    }
  })

  return visibleLines
}
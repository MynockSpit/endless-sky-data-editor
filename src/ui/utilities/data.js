import _ from 'lodash'
import { getData, getLineMeta, setData } from './store'

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
import _ from 'lodash'
import { isElectron, safeElectron } from './misc'
import { getData, getLineMeta, setData } from './store'

if (isElectron()) {
  safeElectron().onDataChange((event, data) => {
    setData(JSON.parse(data))
  })

  safeElectron().updateData()
} else {
  // comment this out for now
  // import('../data.json').then(data => {
  //   console.log(data)
  // })
}

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
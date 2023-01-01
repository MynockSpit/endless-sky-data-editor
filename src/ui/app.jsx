import React, { useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'

import { getFilteredLines, parseInput } from './utilities/filter'
import { getVisibleLines } from './utilities/data'
import { Entries } from './components/entries/Entries'
import { getInput, setInput, updateAC, useData, useInput, useLineMeta } from './utilities/store';
import { Toolbar } from './components/Toolbar'
import { BrowserRouter, useSearchParams } from 'react-router-dom';

const LocationInterceptor = () => {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    let search = searchParams.get('search')
    if (getInput() !== search) {
      setInput(search || '')
    }
  }, [searchParams]);

  return null
}

const App = () => {
  let [inputValue] = useInput('')
  const [data] = useData()

  useLineMeta()

  let filteredLines = useMemo(() => getFilteredLines(inputValue, data), [inputValue, data])
  let visibleLines = getVisibleLines(filteredLines)

  let parsedInput = parseInput(inputValue)
  parsedInput.pop()
  let previousFilter = parsedInput.map(item => item.raw).join(' ')
  useEffect(() => {
    updateAC(getFilteredLines(previousFilter, data))
  }, [previousFilter, data])

  // At some point in the past, I thought I needed MemoryRouter for electron. But I don't know why, 'cause it seems to work without it now.
  return <BrowserRouter>
    <LocationInterceptor />
    <Toolbar value={inputValue} entries={filteredLines} loading={data.loading} />
    <Entries entries={visibleLines} loading={data.loading} />
  </BrowserRouter>
}

ReactDOM.render(<App />, document.querySelector('#root'))
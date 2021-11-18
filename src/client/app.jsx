import React, { useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'

import { getFilteredLines } from './filter'
import { getVisibleLines, useData } from './data'
import { Entries } from './components/entries/Entries'
import { getInput, setInput, useInput, useLineMeta } from './store';
import { Toolbar } from './components/Toolbar'
import { BrowserRouter, MemoryRouter, useSearchParams } from 'react-router-dom';

const LocationInterceptor = () => {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    let search = searchParams.get('search')
    if (getInput !== search) {
      setInput(search)
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

  // hard-code for now, but we should figure out what we need to determine if we're in electron or a browser
  let isBrowser = false
  let Router = isBrowser ? BrowserRouter : MemoryRouter

  return <Router>
    { isBrowser && <LocationInterceptor /> }
    <div>
      <Toolbar value={inputValue} entries={filteredLines} loading={data.loading} />
      <Entries entries={visibleLines} loading={data.loading} />
    </div>
  </Router>
}

ReactDOM.render(<App />, document.querySelector('#root'))
import React, { useEffect} from 'react'
import ReactDOM from 'react-dom'

import { getFilteredLines, getVisibleLines } from './data'
import { Entries } from './entries/Entries'
import { getInput, setInput, useInput, useLineMeta } from './store';
import { Toolbar } from './components/Toolbar'
import { BrowserRouter, useSearchParams } from 'react-router-dom';

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
  let [inputValue] = useInput()
  useLineMeta()
  let filteredLines = getFilteredLines(inputValue)
  let visibleLines = getVisibleLines(filteredLines)

  return <BrowserRouter>
  <LocationInterceptor />
    <div>
      <Toolbar value={inputValue} entries={filteredLines} />
      <Entries entries={visibleLines} />
    </div>
  </BrowserRouter>
}

ReactDOM.render(<App />, document.querySelector('#root'))
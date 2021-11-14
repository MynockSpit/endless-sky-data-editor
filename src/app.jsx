import React from 'react'
import ReactDOM from 'react-dom'

import { getFilteredLines } from './data'
import { Entries } from './entries/Entries'
import { useInput } from './store';
import { Toolbar } from './Toolbar'

const App = () => {
  let [inputValue] = useInput()
  let relevantEntries = getFilteredLines(inputValue)

  return <div>
    <Toolbar value={inputValue} entries={relevantEntries} />
    <Entries entries={relevantEntries} />
  </div>
}

ReactDOM.render(<App />, document.querySelector('#root'))
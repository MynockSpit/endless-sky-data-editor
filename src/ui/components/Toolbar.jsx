import { css } from '@emotion/css'
import React, { useEffect, useRef, useState } from 'react'
import { Popup } from './Popup';
import { Icon } from './Icon';
import { Code } from './Code';
import { isElectron, useSearchNavigate } from '../utilities/misc';
import _ from 'lodash'
import { parseInput } from '../utilities/filter';
import { SettingsPopup } from './Settings';
import { useNavigate } from 'react-router';
import { updateACWeight, useFilteredAutocompleteList } from '../utilities/store';
import { Autocomplete } from './Autocomplete';

function resourceCount(inputLines) {
  let count = 0
  Object.values(inputLines).forEach(line => {
    count += ((line.parent === undefined) ? 1 : 0)
  });
  return count
}

export const Toolbar = ({ value, entries, loading }) => {
  const navigateToQuery = useSearchNavigate()
  const navigate = useNavigate()

  let autocompleteValues = useFilteredAutocompleteList(value)

  // a real simple way to push all keypresses to the input
  const input = useRef()
  useEffect(() => {
    function keydown(event) {
      let modified = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
      if (event.key.length === 1 && !modified) {
        input.current.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => document.removeEventListener('keydown', keydown)
  }, [])

  let parsedInput = parseInput(value)

  return (
    <div className={css`
      position: sticky;
      top: 0px;
      background: white;
      padding: 6px;
      z-index: 1;
    `}>
      <div className={css`
        display: flex;
      `}>
        {isElectron() && (
          <>
            <button className={css`border: 0; margin-right: 6px;`} onClick={() => navigate(-1)}>{'<'}</button>
            <button className={css`border: 0; margin-right: 6px;`} onClick={() => navigate(1)}>{'>'}</button>
          </>
        )}
        <Autocomplete
          inputRef={input}
          autocompleteValues={autocompleteValues}
          type="search"
          value={value}
          processAutocomplete={(selectedAutocomplete, value) => {
            if (!selectedAutocomplete) return value

            let items = parseInput(value)
            let lastItem = items[items.length - 1]
            let index = value.lastIndexOf(lastItem.raw)

            return value.slice(0, index) + selectedAutocomplete
          }}
          onChange={({ target }) => {
            navigateToQuery(target.value)
          }}
          onAutocomplete={(selectedValue) => {
            navigateToQuery(selectedValue)
            updateACWeight(selectedValue)
          }}
        />
        <div className={css`
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          margin: 0px 10px;
        `}>
          <SettingsPopup>
            <Icon className={css`font-size: 30px; margin-top: -3px; margin-right: 6px;`}>⚙</Icon>
          </SettingsPopup>
          <HelpPopup>
            <Icon border>?</Icon>
          </HelpPopup>
        </div>
      </div>
      {loading ? (
        <div className={css`margin: 5px;`}>Loading resources...</div>
      ) : (
        <div className={css`margin: 5px;`}>{resourceCount(entries)} resources matching {parsedInput.map((entry, index, all) => {
          let separator = all[index + 1] ? <b>AND </b> : ''
          if (entry.type === 'resource') {
            let matchesOrContains = entry.operator === '=' ? 'equals' : 'contains'
            return <React.Fragment key={entry.raw}> resource type <Code>{entry.key}</Code> {entry.operator && <>{matchesOrContains} <Code>{entry.value}</Code></>} {separator}</React.Fragment>
          } else if (entry.type === 'property') {
            let matchesOrContains = entry.operator === '=' ? 'matches' : 'contains'
            return <React.Fragment key={entry.raw}>property <Code>{entry.key}</Code> {entry.operator && <>{matchesOrContains} <Code>{entry.value}</Code></>} {separator}</React.Fragment>
          } else if (entry.type === 'file-path') {
            return <React.Fragment key={entry.raw}>file path contains <Code>{entry.value}</Code> {separator}</React.Fragment>
          } else if (entry.type === 'search') {
            return <React.Fragment key={entry.raw}>any line contains <Code>{entry.value}</Code> {separator}</React.Fragment>
          } else {
            return <React.Fragment key={entry.raw}>{JSON.stringify(entry, null, 2)} {separator}</React.Fragment>
          }
        })}
        </div>
      )}
    </div>
  )
}

export const HelpPopup = ({ children }) => {
  return <Popup target={children}>
    <p>Search happens on a resource-by-resource basis. Every term you provide MUST match at least one line in the resource. If all terms are matched at least once, the entire root resource is displayed.</p>

    <ul>
      <li><p>The <Code>#</Code> prefix can be used to search for resource types.  </p>
        <p><em><strong>example:</strong> <Code>#ship</Code> gives you a list of all ships</em></p>
      </li>
      <li><p>The <Code>.</Code> prefix can be used to search for resources with a given property.  </p>
        <p><em><strong>example:</strong> <Code>.bunks</Code> gives you a list of all resources with a <Code>bunk</Code> property</em></p>
      </li>
      <li><p>The <Code>=</Code> operator can be used in conjunction with <Code>.</Code> or <Code>#</Code> to search for a resource or a property that <strong>equals</strong> a value.  </p>
        <p><em><strong>example:</strong> <Code>#ship=&quot;Albatross&quot;</Code> gives you all ships with a name or alternate name of <Code>Albatross</Code>.</em>  </p>
        <p><em><strong>example:</strong> <Code>.government=&quot;Bounty Hunter&quot;</Code> gives you all resources with a government property equal to &quot;Bounty Hunter&quot;</em></p>
      </li>
      <li><p>The <Code>~=</Code> operator can be used in conjunction with <Code>.</Code> or <Code>#</Code> to search for a resource or a property that <strong>contains</strong> a value.  </p>
        <p><em><strong>example:</strong> <Code>#ship~=&quot;Alba&quot;</Code> gives you all ships with a name or alternate name that contains <Code>Alba</Code>.</em>  </p>
        <p><em><strong>example:</strong> <Code>.government~=&quot;Bounty&quot;</Code> gives you all resources with a government property that contains to &quot;Bounty&quot;</em></p>
      </li>
      <li><p>The <Code>/</Code> prefix can be used to search file paths.</p>
        <p><em><strong>example:</strong> <Code>/path/to/data</Code> searches for resources that come from a file along the path <Code>path/to/data</Code>.</em></p>
      </li>
      <li><p>Text without an operator searches for any resource with a line containing that text.</p>
        <p><em><strong>example:</strong> <Code>Albatross</Code> searches for all resources that contain the word &quot;Albatross&quot;.</em></p>
      </li>
      <li><p>Quotes ( <Code>&quot;</Code> ) or Backticks ( <Code>&#96;</Code>) can be used to group any of the prior operators.</p>
        <p><em><strong>example:</strong> <Code>&quot;Bounty Hunter&quot;</Code> searches for all resources that contain the word &quot;Bounty Hunter&quot;, but not just &quot;Bounty&quot;, and not &quot;Hunter Bounty&quot;.</em></p>
        <p><em><strong>example:</strong> <Code>#fleet=&quot;Small Pug (Wanderer)&quot;</Code> doesn&#39;t match a fleet named &quot;Small Pug&quot;`</em></p>
        <p><em><strong>example:</strong> <Code>&quot;#fleet~=&quot;Merchants .names~=deep&quot;</Code> likely matches nothing because it&#39;s looking for a fleet with the name of &quot;Merchants .names~=deep&quot;.</em></p>
      </li>
    </ul>

  </Popup>
}
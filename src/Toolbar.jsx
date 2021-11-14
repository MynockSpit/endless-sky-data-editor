import { css } from '@emotion/css'
import React, { useState } from 'react'
import { setInput } from './store';

function resourceCount(inputLines) {
  let count = 0
  Object.values(inputLines).forEach(line => {
    count += ((line.parent === undefined) ? 1 : 0)
  });
  return count
}

function searchUrl(query, go = true) {
  var nextUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?search=${query}`;

  if (window.history.pushState && go) {
    window.history.pushState({ path: nextUrl }, '', nextUrl);
  }

  if (go) {
    setInput(query)
  }

  return nextUrl
}

export const Toolbar = ({ value, entries }) => {
  return (
    <div className={css`
      position: sticky;
      top: 0px;
      background: white;
      padding: 6px;
    `}>
      <div className={css`
        display: flex;
      `}>
        <input
          className={css`
            width: -webkit-fill-available;
            padding: 4px;
            font-size: 16px;
            border: 1px solid black;
            border-radius: 4px;
          `}
          value={value}
          onChange={({ target }) => {
            searchUrl(target.value)
            setInput(target.value)
          }}
        />
        <div className={css`
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin: 0px 10px;
        `}>
          <HelpPopup>
            <div className={css`
              border: 1px solid black;
              border-radius: 100px;
              width: 16px;
              height: 16px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
            `}>?</div>
          </HelpPopup>
        </div>
      </div>
      <div>{resourceCount(entries)} resources {value ? <>matching <pre className={css`display: inline-block; font-weight: bold;`}>{value}</pre></> : ''}</div>
    </div>
  )
}

const Code = ({ children }) => {
  return <pre className={css`font-weight: bold; display: inline;`}>
    {children}
  </pre>
}

export const HelpPopup = ({ children }) => {
  return <Popup target={children}>
    <p>Search terms are separated by spaces and <b>AND</b>ed. For example, <Code>Bounty Hunter</Code> would match <Code>Bounty Hunter</Code> and <Code>The Hunter, Bounty</Code>, but not <Code>The Hunter</Code>.</p>
    <p>Search for a literal text with spaces, wrap it in quotes. For example, <Code>"Bounty Hunter"</Code> would match <Code>Bounty Hunter</Code> but not <Code>The Hunter, Bounty</Code>, or <Code>The Hunter</Code>.</p>
    <p>Search for resources types by prepending a dot (<Code>.</Code>) then the type name. For example, <Code>.fleet</Code> displays all "fleet" type resources.</p>
    <p>Search by file by prepending a slash (<Code>/</Code>) then typing a partial file path. For example, <Code>/fleets.txt</Code> returns results all files named <Code>fleets.txt</Code>.</p>
    <p>You can mix and match all three modes of searching. For example, <Code>.event /events "capture Poisonwood"</Code> looks for an event in a file with <Code>/events</Code> in it's path containing the literal text <Code>"capture Poisonwood"</Code>.</p>
  </Popup>
}

export const Popup = ({ target, children }) => {
  const [open, setOpen] = useState(false)
  return <div className={css`position: relative;`}>
    <div onClick={() => setOpen(prev => !prev)}>{target}</div>
    {open && (
      <div className={css`
        position: absolute;
        background: white;
        top: 100%;
        right: 100%;
        width: 600px;
        border-radius: 3px;
        border: 1px solid grey;
        padding: 0px 16px;
      `}>
        {children}
        <p><a href="#" onClick={event => {
          event.preventDefault()
          setOpen(false)
        }}>close</a></p>
      </div>
    )}
  </div>
}
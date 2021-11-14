import { css } from "@emotion/css"
import React, { useState } from "react"
import { data } from "../data"

export const Entries = ({ entries }) => {
  return entries.map(line => {
    let CustomEntry = CustomEntries[entries.key]

    if (CustomEntry) {
      return <CustomEntry key={line.id} rootLine={line} />
    }

    return <GenericEntry key={line.id} line={line} />
  })
}

const GenericEntry = ({ line }) => {
  const [open, setOpen] = useState((line.parent === undefined) ? false : true)

  let tabs = new Array(line.depth).fill('')

  return <>
    <div className={css`display: flex; justify-content: space-between;`}>
      <div className={css`display: flex;`}>
        {tabs.map(() => <div className={css`width: 20px; flex-shrink: 0;`} ></div>)}
        <Foldable show={line.children && line.children.length} open={open} setOpen={setOpen} />
        {line.data.map((entry, index) => {
          // if (specialParseRule) {
          // return specialParseRule(entry, index)
          // } else {
          return <div key={entry + index} className={css`border: 0; margin: 2px 4px;`}>{entry}</div>
          // }
        })}
      </div>
      <div
        className={css`
          margin: 2px 4px;
          flex-shrink: 0;
        `}
      >
        <a href={`vscode://file/${data.roots[line.root]}${line.filePath}:${line.lineNumber}`}>{line.filePath}:{line.lineNumber}</a> ({line.root})
      </div>
    </div>
    {(line.children && open) && line.children.map(childId => <GenericEntry key={childId} line={data.lines[childId]} />)}
  </>
}

const Foldable = ({ open = false, show = false, setOpen }) => {
  const classy = css`
    width: 20px; 
    flex-shrink: 0;
    font-weight: bold;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  `

  if (!show) {
    return <div className={css`width: 20px; flex-shrink: 0;`}></div>
  } else if (open === true) {
    return <pre className={classy} onClick={() => { setOpen(false) }}>{"v"}</pre>
  } else {
    return <pre className={classy} onClick={() => { setOpen(true) }}>{">"}</pre>
  }
}

const linkFirstChildToSearch = (key, value, index) => {
  if (index !== 1) {
    return <div key={value} className={css`border: 0; margin: 2px 4px;`}>
      {value}
    </div>
  }
  return <div key={value} className={css`border: 0; margin: 2px 4px;`}>
    <a
      href={searchUrl(`.${key} ${value}`, false)}
      onClick={(event) => {
        event.preventDefault()
        searchUrl(`.${key} ${value}`)
      }}
    >{value}</a>
  </div>
}

const parseRules = {
  "government": (value, index) => linkFirstChildToSearch('government', value, index),
  "conversation": (value, index) => linkFirstChildToSearch('conversation', value, index),
  "system": (value, index) => linkFirstChildToSearch('system', value, index),
  "fleet": (value, index) => linkFirstChildToSearch('fleet', value, index),
  "names": (value, index) => linkFirstChildToSearch('phrase', value, index),
}

const CustomEntries = {}

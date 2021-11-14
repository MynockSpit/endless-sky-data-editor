import { css } from "@emotion/css"
import React from "react"
import { Link } from "react-router-dom"
import { Icon } from "../components/Icon"
import { Popup } from "../components/Popup"
import { data } from "../data"
import { getSearchUrl } from "../misc"
import { setInput, useLineMeta } from "../store"
import ReactList from 'react-list';

export const Entries = ({ entries }) => {
  return <ReactList
    itemRenderer={(index, reactKey) => {
      let line = entries[index]
      let CustomEntry = CustomEntries[entries.key]

      if (CustomEntry) {
        return <CustomEntry key={reactKey} rootLine={line} />
      }

      return <GenericEntry key={reactKey} line={line} />
    }}
    length={entries.length}
    type='uniform'
  />
}

const GenericEntry = ({ line }) => {
  const [open, setOpen] = useLineMeta(`${line.id}.open`)

  let realOpen = open !== undefined ? open : (line.parent === undefined ? false : true)

  return <>
    <div className={css`display: flex; justify-content: space-between;`}>
      <div className={css`display: flex;`}>
        <div className={css`width: ${20*line.depth}px; flex-shrink: 0;`} ></div>
        <Foldable show={line.children && line.children.length} open={realOpen} setOpen={setOpen} />
        {line.data.map((entry, index) => {

          let searchMaker = getSearchMaker(line)
          let search = ''

          if (searchMaker) {
            let entries = new Array(index + 1).fill('')
            entries[index] = entry
            search = searchMaker(...entries)
          }

          return <div key={entry + index} className={css`border: 0; margin: 2px 4px;`}>
            {search ? (
              <SearchLink
                search={search}
              >
                {entry}
              </SearchLink>) : entry}
          </div>
        })}
      </div>
      <div className={css` margin: 2px 4px; flex-shrink: 0; `}>
        <a href={`vscode://file/${data.roots[line.root]}${line.filePath}:${line.lineNumber}`}>{line.filePath}:{line.lineNumber}</a> ({line.root})
        <Popup target={<Icon>?</Icon>}>
          <pre>
            {JSON.stringify(line, null, 2)}
          </pre>
        </Popup>
      </div>
    </div>
    {/* {(line.children && realOpen) && line.children.map(childId => <GenericEntry key={childId} line={data.lines[childId]} />)} */}
  </>
}

const SearchLink = ({ search, children, onClick, ...props }) => {
  return <Link
    {...props}
    to={getSearchUrl(search)}
    onClick={(event) => {
      setInput(search)
      if (onClick) onClick(event)
    }}
  >
    {children}
  </Link>
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

function first(array) {
  return outfitter.find(item => item)
}

function getSearchMaker(line) {
  let matches = {

    // 'color'
    // not linkable

    // 'conversation'
    // 'effect'
    // 'event'

    // 'fleet'
    // https://github.com/endless-sky/endless-sky/wiki/CreatingFleets
    "fleet": (fleet, name) => name ? `.fleet ${name}` : '',
    "fleet.government": (government, name) => name ? `.government ${name}` : '',
    "fleet.names": (names, phrase) => phrase ? `.phrase ${phrase}` : '',
    "fleet.fighters": (fighters, phrase) => phrase ? `.phrase ${phrase}` : '',
    // "fleet.cargo": value => ``, // not linkable
    // "fleet.commodities": value => ``, // not linkable yet b/c all "trade" is in one block
    "fleet.outfitters": (outfitters, ...outfitter) => first(outfitter) ? `.outfitter ${first(outfitter)}` : '',
    // "fleet.personality": value => ``, // not linkable
    // "fleet.personality.*": value => ``, // not linkable
    "fleet.variant.*": (ship) => ship ? `.ship ${ship}` : '',

    // 'galaxy'
    // 'government'
    // 'help'
    // 'interface'
    // 'landing message'
    // 'minable'
    // 'mission'
    // 'news'
    // 'outfit'
    // 'outfitter'
    // 'person'
    // 'phrase'
    // 'planet'
    // 'rating'
    // 'ship'
    // 'shipyard'
    // 'star'
    // 'start'
    // 'system'
    // 'tip'
    // 'trade'
  }

  let keys = getAllLevelsOfSpecificity(line.fullKey)

  let match = matches[keys.find(key => matches[key])]

  return match
}

function getAllLevelsOfSpecificity(key) {
  let starLast = key.split('.').reverse().slice(1).reverse().concat('*').join('.')

  return [
    key,
    starLast
  ]
}

const CustomEntries = {}

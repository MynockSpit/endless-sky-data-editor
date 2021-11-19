import { css } from "@emotion/css"
import React from "react"
import { Link } from "react-router-dom"
import { Icon } from "../Icon"
import { Popup } from "../Popup"
import { getSearchUrl } from "../../utilities/misc"
import { setInput, useData, useLineMeta } from "../../utilities/store"
import ReactList from 'react-list';
import { Code } from "../Code"

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
    itemSizeEstimator={() => 22}
    length={entries.length}
    type='variable'
  />
}

const GenericEntry = ({ line }) => {
  const [open, setOpen] = useLineMeta(`${line.id}.open`)
  const [data] = useData()

  let realOpen = open !== undefined ? open : (line.parent === undefined ? false : true)

  return <>
    <div className={css`display: flex; justify-content: space-between;`}>
      <div className={css`display: flex;`}>
        <div className={css`width: ${20 * line.depth}px; flex-shrink: 0;`} ></div>
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
        <Popup target={<Icon>?</Icon>} className={css`margin-left: 4px;`}>
          <p>
            <Code block>
              {JSON.stringify(line, null, 2)}
            </Code>
          </p>
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
  return array.find(item => item)
}

function getSearchMaker(line) {
  let matches = {

    // 'color'
    // not linkable

    // 'conversation'
    "conversation": (conversation, name) => name ? `#conversation=${name}` : '',
    // conversation seems hard to link without being able to scroll to a specific line/collapse non-relevant lines

    // 'effect'
    // 'event'

    // 'fleet'
    // https://github.com/endless-sky/endless-sky/wiki/CreatingFleets
    "fleet": (fleet, name) => name ? `#fleet=${name}` : '',
    "fleet.government": (government, name) => name ? `#government=${name}` : '',
    "fleet.names": (names, phrase) => phrase ? `#phrase=${phrase}` : '',
    "fleet.fighters": (fighters, phrase) => phrase ? `#phrase=${phrase}` : '',
    // "fleet.cargo": value => ``, // not linkable
    // "fleet.commodities": value => ``, // not linkable yet b/c all "trade" is in one block
    "fleet.outfitters": (outfitters, ...outfitter) => first(outfitter) ? `#outfitter=${first(outfitter)}` : '',
    // "fleet.personality": value => ``, // not linkable
    // "fleet.personality.*": value => ``, // not linkable
    "fleet.variant.*": (ship) => ship ? `#ship=${ship}` : '',

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
    "ship": (ship, name, alternate) => (name || alternate) ? `#ship=${name || alternate}` : '',
    "ship.attributes.category": (category, type) => type ? `#ship .category=${type}` : '',
    "ship.outfits.*": (outfit) => outfit ? `#outfit=${outfit}` : '',
    "ship.explode": (explode, effect) => effect ? `#effect=${effect}` : '',
    "ship.final explode": (explode, effect) => effect ? `#effect=${effect}` : '',
    "ship.leak": (leak, effect) => effect ? `#effect=${effect}` : '',

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

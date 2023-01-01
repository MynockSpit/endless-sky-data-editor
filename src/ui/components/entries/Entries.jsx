import { css } from '@emotion/css'
import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../Icon'
import { Popup } from '../Popup'
import { getSearchUrl } from '../../utilities/misc'
import { setInput, useData, useLineMeta } from '../../utilities/store'
import ReactList from 'react-list';
import { Code } from '../Code'

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

  let searchArray = getSearchLink(line)

  return <>
    <div className={css`display: flex; justify-content: space-between;`}>
      <div className={css`display: flex;`}>
        <div className={css`width: ${20 * line.depth}px; flex-shrink: 0;`} ></div>
        <Foldable show={line.children && line.children.length} open={realOpen} setOpen={setOpen} />
        {line.data.map((entry, index) => {

          let search = searchArray ? searchArray[index] : ''

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
        <a href={`vscode://file/${data.roots[line.root].path}${line.filePath}:${line.lineNumber}`}>{line.filePath}:{line.lineNumber}</a> ({data.roots[line.root].fileType})
        <Popup target={<Icon border>?</Icon>} className={css`margin-left: 4px;`}>
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
    return <pre className={classy} onClick={() => { setOpen(false) }}>{'v'}</pre>
  } else {
    return <pre className={classy} onClick={() => { setOpen(true) }}>{'>'}</pre>
  }
}

function map(config) {
  return (...args) => {
    return args.map((value, index, allValues) => {
      if (config.skip !== undefined) {
        if (typeof config.skip === 'string') {
          if (value === config.skip) return null
        } else if (typeof config.skip === 'number') {
          if (index === config.skip) return null
        } else if (typeof config.skip === 'function') {
          if (config.skip(value, index)) return null
        }
      }
      return config.each(value, index, allValues)
    })
  }
}

function skipLabel(fn) {
  return map({ skip: 0, each: fn })
}

function skip(size) {
  return array(size, null)
}

function array(size, value) {
  return new Array(size).fill(value)
}

function getSearchLink(line) {
  let matches = {

    // 'color'
    // not linkable

    // 'conversation'
    // https://github.com/endless-sky/endless-sky/wiki/WritingConversations
    // Conversations seem hard to link without being able to scroll to a specific line/collapse non-relevant lines
    'conversation': (conversation, name) => ([null, `#conversation=${name}`]),

    // 'effect'
    // https://github.com/endless-sky/endless-sky/wiki/CreatingEffects
    // I think there's not much here to link. Maybe sprite if we ever do that?
    'effect': (label, name) => ([null, `#effect=${name}`]),

    // 'event'
    // https://github.com/endless-sky/endless-sky/wiki/CreatingEvents
    // event kinda sucks, because each .property can have it's own nested attributes that are the same as #property. For now, we'll just do the basics.
    'event': (label, name) => ([null, `#event=${name}`]),
    'event.visit': (label, system) => ([null, `#system=${system}`]),
    'event.unvisit': (label, system) => ([null, `#system=${system}`]),
    'event.visit planet': (label, planet) => ([null, `#planet=${planet}`]),
    'event.unvisit planet': (label, planet) => ([null, `#planet=${planet}`]),
    'event.galaxy': (label, name) => ([null, `#galaxy=${name}`]),
    // TODO: fill out galaxy sub-characteristics
    'event.system': (label, name) => ([null, `#system=${name}`]),
    // TODO: fill out system sub-characteristics
    'event.link': (label, system, other) => (other || system) ? `$system=${other || system}` : '',
    'event.unlink': (label, system, other) => (other || system) ? `$system=${other || system}` : '',
    'event.government': (label, government) => ([null, `#government=${government}`]),
    // TODO: fill out government sub-characteristics
    'event.fleet': (label, fleet) => ([null, `#fleet=${fleet}`]),
    // TODO: fill out fleet sub-characteristics
    'event.planet': (label, planet) => ([null, `#planet=${planet}`]),
    // TODO: fill out planet sub-characteristics
    'event.news': (label, news) => ([null, `#news=${news}`]),
    // TODO: fill out news sub-characteristics
    'event.shipyard': (label, shipyard) => ([null, `#shipyard=${shipyard}`]),
    // TODO: fill out shipyard sub-characteristics
    'event.outfitter': (label, outfitter) => ([null, `#outfitter=${outfitter}`]),
    // TODO: fill out outfitter sub-characteristics
    // substitutions?
    // 'event.substitutions': (substitutions, name) => ([ null, `#substitutions=${name}` ]),
    // TODO: fill out substitutions sub-characteristics

    // 'fleet'
    // https://github.com/endless-sky/endless-sky/wiki/CreatingFleets
    // TODO: link to commodities one day
    'fleet': (label, fleet) => ([null, `#fleet=${fleet}`]),
    'fleet.government': (label, government) => ([null, `#government=${government}`]),
    'fleet.names': (label, phrase) => ([null, `#phrase=${phrase}`]),
    'fleet.fighters': (label, phrase) => ([null, `#phrase=${phrase}`]),
    'fleet.outfitters': skipLabel(name => `#outfitter=${name}`),
    'fleet.variant.*': (ship) => ([`#ship=${ship}`]),

    // 'galaxy'
    // 'government'
    // 'help'
    // 'interface'
    // 'landing message'
    // 'minable'
    // 'mission'
    // 'news'
    // 'outfit'
    'outfit': (label, name) => ([ null, `#ship=${name}`]),
    'outfit.category': (label, name) => ([ null, `#outfit .category=${name}`]),
    'outfit.licenses.*': (license) => ([ `#outfit ${license}`]),
    'outfit.ammo': (label, name) => ([null, `#outfit=${name}`]),
    'outfit.weapon.ammo': (label, name) => ([null, `#outfit=${name}`]),
    'outfit.weapon.submunition': (label, name) => ([null, `#outfit=${name}`]),
    // 'outfitter'
    // 'person'
    // 'phrase'
    // 'planet'
    // 'rating'

    // 'ship'
    'ship': skipLabel( name => `#ship=${name}` ),
    'ship.attributes.category': (label, category) => ([ null, `#ship .category=${category}` ]),
    'ship.attributes.licenses.*': (license) => ([ `#ship ${license}` ]),
    'ship.outfits.*': (outfit) => ([`#outfit=${outfit}`]),
    'ship.explode': (label, effect) => ([null, `#effect=${effect}`]),
    'ship.turret': (label, ...args) => ([...skip(args.length), `#outfit=${args[args.length - 1]}`]),
    'ship.gun': (label, ...args) => ([...skip(args.length), `#outfit=${args[args.length - 1]}`]),
    'ship.final explode': (label, effect) => ([null, `#effect=${effect}`]),
    'ship.leak': (label, effect) => ([null, `#effect=${effect}`]),

    // 'shipyard'
    // 'star'
    // 'start'
    // 'system'
    // 'tip'
    // 'trade'
  }

  let keys = getAllLevelsOfSpecificity(line.fullKey)

  let match = matches[keys.find(key => matches[key])]

  if (match) {
    return match(...line.data)
  } else {
    return null
  }
}

function getAllLevelsOfSpecificity(key) {
  let starLast = key.split('.').reverse().slice(1).reverse().concat('*').join('.')

  return [
    key,
    starLast
  ]
}

const CustomEntries = {}

import ReactList from 'react-list';
import { css } from '@emotion/css'
import React, { useEffect, useState } from 'react'

export const Autocomplete = ({ inputRef, value, onChange, onAutocomplete, processAutocomplete, autocompleteValues }) => {
  const [selectedAutocomplete, setSelectedAutocomplete] = useState(0)

  let autoCompleteValue = processAutocomplete(autocompleteValues[selectedAutocomplete] || '', value)
  let untyped = autoCompleteValue.replace(value, '')

  useEffect(() => {
    setSelectedAutocomplete(0)
  }, [(autocompleteValues || []).join(':')])

  return (
    <div className={css`
      width: -webkit-fill-available;
      position: relative;
    `}>
      <div className={css`
        position: absolute;
        padding: 5px;
        color: grey;
        pointer-events: none;
      `}>
        <span className={css`color: transparent;`}>{value}</span>
        <span>{untyped}</span>
      </div>
      <input
        ref={inputRef}
        className={css`
          width: -webkit-fill-available;
          padding: 4px;
          font-size: 16px;
          border: 1px solid black;
          border-radius: 4px;
        `}
        type="search"
        value={value}
        onChange={onChange}
        onKeyUp={event => {
          if (event.key === 'Tab' || event.key === 'Enter') {
            if (onAutocomplete) onAutocomplete(autoCompleteValue)
          }
        }}
        onKeyDown={event => {
          if (event.key === 'Tab') {
            event.preventDefault()
          } else if (event.key === 'ArrowDown') {
            event.preventDefault()
            setSelectedAutocomplete(index => {
              let nextIndex = index + 1
              if (nextIndex >= autocompleteValues.length) {
                return 0
              } else {
                return nextIndex
              }
            })
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setSelectedAutocomplete(index => {
              let nextIndex = index - 1
              if (nextIndex < 0) {
                return autocompleteValues.length
              } else {
                return nextIndex
              }
            })
          }
        }}
      />
      {Boolean(autocompleteValues.length) && (
      <div className={css`
        display: none;
        input:focus + & {
          display: block;
        }
        position: absolute;
        background: white;
        width: 100%;
        border: 1px solid;
        top: calc(100% - 1px);
        border-radius: 4px;
        padding: 6px 4px;
        box-sizing: border-box;
        max-height: 80vh;
        overflow: auto;
      `}>
        <ReactList
          itemRenderer={(index, reactKey) => {
            let value = autocompleteValues[index]
            return <div
              key={reactKey}
              onMouseOver={() => {
                setSelectedAutocomplete(index)
              }}
              onClick={() => {
                if (onAutocomplete) onAutocomplete(autoCompleteValue)
              }}
              className={css`
                border: 1px solid ${index === selectedAutocomplete ? 'orange' : 'transparent'};
                padding: 1px 5px;
                border-radius: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              `}>{value}</div>
          }}
          itemSizeEstimator={() => 22}
          length={autocompleteValues.length}
          type='uniform'
        />
      </div>
      )}
    </div>
  )
}
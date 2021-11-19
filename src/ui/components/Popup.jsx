import { css, cx } from '@emotion/css'
import React, { useState } from 'react'

export const Popup = ({ target, children, className, ...props }) => {
  const [open, setOpen] = useState(false)
  return <div className={cx(css`position: relative; display: inline-block;`, className)} {...props}>
    <div onClick={() => setOpen(prev => !prev)}>{target}</div>
    {open && (
      <div className={css`
        position: absolute;
        background: white;
        top: 100%;
        right: 100%;
        width: 600px;
        max-height: 50vh;
        overflow: auto;
        border-radius: 3px;
        border: 1px solid grey;
        padding: 0px 16px;
        z-index: 1; // JUST ONE
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
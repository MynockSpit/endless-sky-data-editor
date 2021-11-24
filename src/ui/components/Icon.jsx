import React from 'react'
import { css, cx } from '@emotion/css'

export const Icon = ({ children, border = false, className, ...props }) => {
  return (
    <div 
      className={cx(css`
        border: ${border ? '1px solid black' : ''};
        border-radius: 100px;
        width: 16px;
        height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
      `, className)}
      {...props}
    >
      {children}
    </div>
  )
}
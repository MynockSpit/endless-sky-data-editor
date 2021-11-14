import React from 'react'
const { css, cx } = require("@emotion/css")

export const Icon = ({ children, className, ...props }) => {
  return (
    <div 
      className={cx(css`
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
      `, className)}
      {...props}
    >
      {children}
    </div>
  )
}
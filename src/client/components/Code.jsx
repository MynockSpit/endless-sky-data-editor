import { css } from '@emotion/css'
import React from 'react'

export const Code = ({ children, block }) => {
  return <span className={css`
    font-weight: bold; 
    display: ${block ? 'inline-block' : 'inline'};
    font-family: monospace;
    background-color: rgb(236, 236, 236);
    padding: ${block ? '8px 8px' : '2px 5px'};
    border-radius: 3px;
    white-space: pre-wrap;
  `}>
    {children}
  </span>
}

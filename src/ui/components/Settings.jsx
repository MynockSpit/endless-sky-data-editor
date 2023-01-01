import { css } from '@emotion/css'
import React from 'react'
import { Popup } from './Popup';
import { Code } from './Code';
import _ from 'lodash'
import { setData, useData } from '../utilities/store';
import { isElectron, safeElectron } from '../utilities/misc';

export const SettingsPopup = ({ children }) => {
  const [data, setData] = useData()

  let dataEntrypoints = []
  let pluginEntrypoints = []
  data?.roots?.forEach(root => {
    if (root.fileType === 'data') {
      dataEntrypoints.push(root)
    } else {
      pluginEntrypoints.push(root)
    }
  })

  return <Popup target={children} className={css`
    width: 80vw;
  `}>
    {isElectron() ? (<>
      <h4>Data</h4>
      {dataEntrypoints.map(root => <ToggleRoot key={root.id} root={root} />)}

      <button onClick={async () => {
        await safeElectron().updateDataPath('data')
        setData(data => ({ roots: data.roots, loading: true }))
      }}>Add data folder</button>

      <h4>Plugins</h4>
      {pluginEntrypoints.map(root => <ToggleRoot key={root.id} root={root} />)}

      <button onClick={async () => {
        await safeElectron().updateDataPath('plugin')
        setData(data => ({ roots: data.roots, loading: true }))
      }}>Add plugin</button>
    </>) : <>
      <p>The web version is not currently configurable.</p>
    </>}
  </Popup>
}

const ToggleRoot = ({ root }) => {
  return <div className={css`
    display: flex;
  `}>
    <input type="checkbox" checked={root.isActive} onChange={async () => {
      setData(data => {
        let newRoots = _.cloneDeep(data.roots)
        _.set(newRoots, [root.path, 'isActive'], !_.get(newRoots, [root.path, 'isActive']))

        return {
          roots: newRoots,
          loading: true,
        }
      })
      safeElectron().fireEvent('toggle-data-path', root.path)
    }} />
    <Code className={css`
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      direction: rtl;
    `} title={root.path}>{root.path}</Code>
    <button onClick={async () => {
      setData(data => {
        let newRoots = _.cloneDeep(data.roots)
        delete newRoots[data.roots]

        return {
          roots: newRoots,
          loading: true,
        }
      })
      safeElectron().fireEvent('remove-data-path', root.path)
    }}>remove</button>
  </div>
}
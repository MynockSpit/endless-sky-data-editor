import { useNavigate } from 'react-router-dom';
import { nullProxy } from './proxyify';
import { setInput } from './store';

export function getSearchUrl(query) {
  return `?search=${encodeURIComponent(query)}`;
}

let last = 0

export function useSearchNavigate() {
  const navigate = useNavigate()

  return (query) => {
    let url = getSearchUrl(query)
    let next = performance.now()
    let replace = (next - last < 500)
    last = next

    console.log({url, query})
    navigate(url, { replace })
    setInput(query)
  }
}

export function isElectron() {
  return Boolean(window.electron)
}

export function safeElectron() {
  if (isElectron()) {
    return window.electron
  } else {
    return nullProxy()
  }
}
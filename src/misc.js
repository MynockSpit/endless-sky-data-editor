import { useNavigate } from "react-router-dom";
import { setInput } from "./store";

export function getSearchUrl(query) {
  return `?search=${query}`;
}

let last = 0

export function useSearchNavigate() {
  const navigate = useNavigate()

  return (query) => {
    let url = getSearchUrl(query)
    let next = performance.now()
    let replace = (next - last < 500)
    last = next
    navigate(url, { replace })
    setInput(query)
  }
}
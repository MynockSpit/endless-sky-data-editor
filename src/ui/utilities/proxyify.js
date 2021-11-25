export function nullProxy(baseObject = {}) {
  // proxys are objects that accept incoming calls and run our code instead -- trapping calls
  const proxy = {
    // make gets safe
    get: function (target, key) {
      const item = target[key]
      const type = typeof item

      // recurse this proxy -- but only if object (or array) or function
      if (item && (type === 'object' || type === 'function')) {
        return new Proxy(item, proxy)
      }

      // otherwise, just return the value
      return null
    },

    // ignore sets
    set: function () {
      return null
    },

    // ignore function calls
    apply: function (target, thisArg, args) {
      return null
    },
  }

  return new Proxy(baseObject, proxy)
}
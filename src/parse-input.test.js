const { parseInput } = require("./parse-input")

describe('parseInput', () => {
  test('path works', () => {
    expect(parseInput('.foo.bar')).toEqual(['.foo.bar'])
  })
  test('path with space works', () => {
    expect(parseInput('".foo bar.baz"')).toEqual(['.foo bar.baz'])
  })
  test('quotes work', () => {
    expect(parseInput(`foo "bar \\" baz" bing`)).toEqual(['foo', `bar \\" baz`, "bing"])
  })
  test("nested quotes work", () => {
    expect(parseInput(`foo "bar 'thing foo' baz" bing`)).toEqual(['foo', `bar 'thing foo' baz`, "bing"])
    expect(parseInput(`foo 'bar "thing foo" baz' bing`)).toEqual(['foo', `bar "thing foo" baz`, "bing"])
  })
  test('path and quotes work', () => {
    expect(parseInput('.foo.bar foo "bar \\" baz" bing')).toEqual(['.foo.bar', 'foo', `bar \\" baz`, "bing"])
  })
})
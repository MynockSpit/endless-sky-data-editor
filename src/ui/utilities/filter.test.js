import { describe, expect, test } from '@jest/globals'
import { parseInput, tokenizeInput } from './filter'

describe('parseInput path', () => {
  test('basic path works', () => {
    expect(tokenizeInput('.foo.bar')).toEqual(['.foo.bar'])
    expect(tokenizeInput('before .foo.bar after')).toEqual(['before', '.foo.bar', 'after'])
  })
  test('wrapped path works', () => {
    expect(tokenizeInput('".foo bar.baz"')).toEqual(['.foo bar.baz'])
    expect(tokenizeInput('before ".foo bar.baz" after')).toEqual(['before', '.foo bar.baz', 'after'])
  })
  test('path with sub-part wrapped works', () => {
    expect(tokenizeInput('."foo bar".baz')).toEqual(['.foo bar.baz'])
    expect(tokenizeInput('before ."foo bar".baz after')).toEqual(['before', '.foo bar.baz', 'after'])
  })
})

describe('parseInput path value', () => {
  test('basic path works', () => {
    expect(tokenizeInput('.foo.bar=value')).toEqual(['.foo.bar=value'])
    expect(tokenizeInput('before .foo.bar=value after')).toEqual(['before', '.foo.bar=value', 'after'])
  })
  test('wrapped path works', () => {
    expect(tokenizeInput('".foo bar.baz=value"')).toEqual(['.foo bar.baz=value'])
    expect(tokenizeInput('before ".foo bar.baz=value" after')).toEqual(['before', '.foo bar.baz=value', 'after'])
  })
  test('path with sub-part wrapped works', () => {
    expect(tokenizeInput('."foo bar".baz=value')).toEqual(['.foo bar.baz=value'])
    expect(tokenizeInput('before ."foo bar".baz=value after')).toEqual(['before', '.foo bar.baz=value', 'after'])
  })
})

describe('parseInput file path', () => {
  test('basic path works', () => {
    expect(tokenizeInput('/foo/bar')).toEqual(['/foo/bar'])
    expect(tokenizeInput('before /foo/bar after')).toEqual(['before', '/foo/bar', 'after'])
  })
  test('wrapped path works', () => {
    expect(tokenizeInput('"/foo bar/baz"')).toEqual(['/foo bar/baz'])
    expect(tokenizeInput('before "/foo bar/baz" after')).toEqual(['before', '/foo bar/baz', 'after'])
  })
  test('path with sub-part wrapped works', () => {
    expect(tokenizeInput('/"foo bar"/baz')).toEqual(['/foo bar/baz'])
    expect(tokenizeInput('before /"foo bar"/baz after')).toEqual(['before', '/foo bar/baz', 'after'])
  })
})

describe('parseInput key value', () => {
  test('basic key value works', () => {
    expect(tokenizeInput('foo=bar')).toEqual(['foo=bar'])
    expect(tokenizeInput('before foo=bar after')).toEqual(['before', 'foo=bar', 'after'])
  })
  test('wrapped key value works', () => {
    expect(tokenizeInput('"foo=bar"')).toEqual(['foo=bar'])
    expect(tokenizeInput('before "foo=bar" after')).toEqual(['before', 'foo=bar', 'after'])
  })
  test('path with wrapped key works', () => {
    expect(tokenizeInput('"foo bar"=baz')).toEqual(['foo bar=baz'])
    expect(tokenizeInput('before "foo bar"=baz after')).toEqual(['before', 'foo bar=baz', 'after'])
  })

  test('path with wrapped value works', () => {
    expect(tokenizeInput('foo="bar baz"')).toEqual(['foo=bar baz'])
    expect(tokenizeInput('before foo="bar baz" after')).toEqual(['before', 'foo=bar baz', 'after'])
  })
})

describe('parseInput', () => {
  test('quotes work', () => {
    expect(tokenizeInput('foo "bar \\" baz" bing')).toEqual(['foo', 'bar \\" baz', 'bing'])
  })
  
  test('escapes work', () => {
    expect(tokenizeInput('foo bar\\\'baz bing')).toEqual(['foo', 'bar\\\'baz', 'bing'])
  })

  test('nested quotes work', () => {
    expect(tokenizeInput('foo "bar `thing foo` baz" bing')).toEqual(['foo', 'bar `thing foo` baz', 'bing'])
    expect(tokenizeInput('foo `bar "thing foo" baz` bing')).toEqual(['foo', 'bar "thing foo" baz', 'bing'])
  })

  test('path and quotes work', () => {
    expect(tokenizeInput('.foo.bar foo "bar \\" baz" bing')).toEqual(['.foo.bar', 'foo', 'bar \\" baz', 'bing'])
  })
})

describe('getTypedInput', () => {
  test('getTypedInput something', () => {
    expect(parseInput('#fleet~=Bounty .path=pathValue /path/to "something space"')).toEqual([
      {
        type: 'resource',
        raw: '#fleet~=Bounty',
        key: 'fleet',
        operator: '~=',
        value: 'bounty',
      },
      {
        type: 'property',
        raw: '.path=pathValue',
        key: 'path',
        operator: '=',
        value: 'pathvalue',
      },
      {
        type: 'file-path',
        raw: '/path/to',
        value: 'path/to',
      },
      {
        raw: 'something space',
        value: 'something space',
        type: 'search',
      }
    ])
  })
})
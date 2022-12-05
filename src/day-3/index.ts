import * as S from "fp-ts/lib/string"
import * as SStd from "fp-ts-std/string"
import * as AStd from "fp-ts-std/array"
import * as A from "fp-ts/Array"
import * as O from "fp-ts/Option"
import * as B from "fp-ts/Boolean"
import { flow, pipe } from "fp-ts/function"
import * as RA from "fp-ts/ReadonlyArray"
import { curry2 } from "fp-ts-std/Function"
import * as assert from "assert"
import { data } from "./data"

const getCharIndex = (char: string) => {
  // prettier-ignore
  const alphabet = ['_', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  return pipe(
    alphabet,
    A.findIndex(curry2(S.Eq.equals)(char)),
    O.getOrElseW(() => -1),
  )
}

const calculateCharValue = (char: string) => {
  return pipe(
    O.of(char),
    O.map((c) =>
      pipe(
        c,
        SStd.isUpper,
        B.fold(
          () => getCharIndex(c),
          () => getCharIndex(S.toLowerCase(c)) + 26,
        ),
      ),
    ),
    O.getOrElseW(() => 0),
  )
} // ?

const splitStringInTwo = (id: string): [string, string] => SStd.splitAt(id.length / 2)(id)

const splitByChars = flow(A.map(S.split("")), A.map(RA.toArray))

const splitByLines = flow(S.split("\n"), RA.toArray)

const tupleIntersection2 = (t: string[][]) => A.intersection(S.Eq)(t[0])(t[1])

const intersectionList = flow(
  splitByLines,
  A.chain(
    flow(
      splitStringInTwo, //
      splitByChars,
      A.map(A.uniq(S.Eq)),
      tupleIntersection2,
    ),
  ),
  A.map(calculateCharValue),
  AStd.sum,
)

const testData = `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`

const testDataTotal = intersectionList(testData) // ?
assert.strictEqual(testDataTotal, 157) // ?

const part1Result = intersectionList(data) // ?
assert.strictEqual(part1Result, 8085) // ?

// TODO: make a recursive intersection function
const tupleIntersection3 = (t: string[][]) => {
  return pipe(
    t[0], //
    A.intersection(S.Eq)(t[1]),
    A.intersection(S.Eq)(t[2]),
  )
}
const chunkByElfGroup = A.chunksOf(3)

const intersectionListPart2 = flow(
  splitByLines,
  chunkByElfGroup,
  A.map(
    flow(
      splitByChars, //
      tupleIntersection3,
      A.uniq(S.Eq),
      A.map(calculateCharValue), //
      AStd.sum,
    ),
  ),
  AStd.sum,
)

const part2Result = intersectionListPart2(data) // ?
assert.strictEqual(part2Result, 2515) // ?

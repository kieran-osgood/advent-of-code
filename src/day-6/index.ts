import * as S from "fp-ts/string"
import * as A from "fp-ts/Array"
import * as O from "fp-ts/Option"
import * as E from "fp-ts/Either"
import { flow } from "fp-ts/function"
import * as RA from "fp-ts/ReadonlyArray"
import * as assert from "assert"
import { NumberFromString } from "io-ts-types"
import { Validation } from "io-ts"
import { data } from "./data"

export function sliding(
  window: number,
  offset: number,
): <A>(xs: ReadonlyArray<A>) => ReadonlyArray<ReadonlyArray<A>> {
  return (xs) =>
    xs.length < window ? [] : [xs.slice(0, window), ...sliding(window, offset)(xs.slice(offset))]
}

const testData = [
  `mjqjpqmgbljsphdztnvjfqwrcgsmlb`,
  `bvwbjplbgvbhsrlpgdmjqwftvncz`,
  "nppdvjthqldpwncqszvftbrmjlhg",
  "nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg",
  "zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw",
]

const part1 = (window: number) =>
  flow(
    S.split(""), //
    sliding(window, 1),
    RA.map(RA.uniq(S.Eq)),
    RA.findIndex((a) => a.length === window),
    O.map((a) => a + window),
    O.getOrElse(() => -1),
  )

assert.strictEqual(part1(4)(testData[0]), 7)
assert.strictEqual(part1(4)(testData[1]), 5)
assert.strictEqual(part1(4)(testData[2]), 6)
assert.strictEqual(part1(4)(testData[3]), 10)
assert.strictEqual(part1(4)(testData[4]), 11)

assert.strictEqual(part1(4)(data), 1343)
assert.strictEqual(part1(14)(data), 2193)

import * as S from "fp-ts/string"
import * as SStd from "fp-ts-std/string"
import * as AStd from "fp-ts-std/array"
import * as A from "fp-ts/Array"
import * as O from "fp-ts/Option"
import * as B from "fp-ts/Boolean"
import * as E from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import * as RA from "fp-ts/ReadonlyArray"
import { curry2 } from "fp-ts-std/Function"
import * as assert from "assert"
import { NumberFromString } from "io-ts-types"
import { Validation } from "io-ts"
import { data } from "./data"

const testData = `2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8`

// const testData = `2-4,6-8`

const parsePairsToNumber = flow(
  S.split("\n"), //
  RA.toArray,
  A.map(
    flow(
      S.split(","), //
      RA.toArray,
      A.map(
        flow(
          S.split("-"),
          RA.toArray,
          A.map(
            NumberFromString.decode, //
          ),
        ),
      ),
    ),
  ),
)
const lte = (a: number, b: number) => a <= b
const gte = (a: number, b: number) => a >= b

const checkIfContained = (d: Validation<number>[][]): O.None | O.Some<boolean> => {
  const [[elf1L, elf1U], [elf2L, elf2U]] = d

  if (
    elf2L._tag === "Left" ||
    elf2U._tag === "Left" ||
    elf1L._tag === "Left" ||
    elf1U._tag === "Left"
  ) {
    return O.none
  }

  const elf1LowerBoundIsLowerThanElf2LowerBound = lte(elf1L.right, elf2L.right)
  const elf1UpperBoundIsHigherThanElf2UpperBound = gte(elf1U.right, elf2U.right)

  const elf2LowerBoundIsLowerThanElf1LowerBound = lte(elf2L.right, elf1L.right)
  const elf2UpperBoundIsHigherThanElf1UpperBound = gte(elf2U.right, elf1U.right)

  switch (true) {
    case elf1LowerBoundIsLowerThanElf2LowerBound && elf1UpperBoundIsHigherThanElf2UpperBound:
    case elf2LowerBoundIsLowerThanElf1LowerBound && elf2UpperBoundIsHigherThanElf1UpperBound:
      return O.some(true)
    default:
      return O.none
  }
}

const getPart1 = flow(
  parsePairsToNumber, //
  A.map(checkIfContained),
  A.compact,
)

const part1Result = getPart1(data)
assert.strictEqual(part1Result.length, 571) // ?

const checkIfContainedAtAll = (elfPairs: Validation<number>[][]): O.None | O.Some<boolean> => {
  // elfPairs.length // ?
  // if (elfPairs.length !== 2) return O.none

  const [[elf1L, elf1U], [elf2L, elf2U]] = elfPairs

  if (
    elf2L._tag === "Left" ||
    elf2U._tag === "Left" ||
    elf1L._tag === "Left" ||
    elf1U._tag === "Left"
  ) {
    return O.none
  }

  const elf1U_Gte_elf2L = gte(elf1U.right, elf2L.right)
  const elf2U_Gte_Elf1L = gte(elf2U.right, elf1L.right)

  const elf1_Lte_elf2U = lte(elf1L.right, elf2U.right)
  const elf2L_Lte_Elf1U = lte(elf2L.right, elf1U.right)

  switch (true) {
    case elf1U_Gte_elf2L && elf2U_Gte_Elf1L:
    case elf1_Lte_elf2U && elf2L_Lte_Elf1U:
      return O.some(true)
    default:
      return O.none
  }
}

const getPart2 = flow(
  parsePairsToNumber, //
  A.map(A.filter(A.some(E.isRight))),
  A.map(checkIfContainedAtAll),
  A.compact,
)

const part2Result = getPart2(testData) // ?
assert.strictEqual(part2Result.length, 4) // ?

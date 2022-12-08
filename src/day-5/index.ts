import * as S from "fp-ts/string"
import * as A from "fp-ts/Array"
import * as SStd from "fp-ts-std/string"
import * as AStd from "fp-ts-std/array"
import * as O from "fp-ts/Option"
import * as E from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import * as RA from "fp-ts/ReadonlyArray"
import * as assert from "assert"
import { NumberFromString } from "io-ts-types"
import { Validation } from "io-ts"
import { data } from "./data"
import { not } from "fp-ts/Predicate"
import { words } from "fp-ts-std/String"

const testData =
  // prettier-ignore
  `    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`

const d = `    [B] [H]         [F] [J] [V] [B]`

const splitRowsToColumnPositions = (a: string): Array<string> =>
  pipe(
    a,
    S.replace(/    /g, " "),
    words,
    RA.map(
      flow(
        SStd.match(/\w/g),
        O.chain(A.head),
        O.getOrElseW(() => ""),
      ),
    ),
    RA.toArray,
  )
// splitRowsToColumnPositions(d) // ?

const is2Tuple = (a: readonly string[]) =>
  a.length === 2 ? O.some(a as [stacks: string, instructions: string]) : O.none

/*
 * 1. splitBy \n\n to get a [stacks: string, instructions: string] tuple
 * 2. assign the number of columns by reading the last line of stacks
 * 3. splitBy \n to get the stacks
 */
const getStacksAndInstructions: (s: string) => O.Option<[stacks: string, instructions: string]> =
  flow(
    S.split("\n\n"), //
    is2Tuple,
  )

const stacksAndInstructions = getStacksAndInstructions(testData)
if (O.isNone(stacksAndInstructions)) {
  throw new Error("Invalid input")
}

const [stacks, instructions] = stacksAndInstructions.value

const getTopsOfStacks: (d: O.Option<string[][]>) => O.None | O.Some<string[]> = O.chain(
  flow(
    A.map(A.last), //
    O.sequenceArray,
    O.map(RA.toArray),
  ),
)

const joinTopsOfStacks: (a: O.Option<string[]>) => O.Option<string> = O.map(AStd.join(" "))

const calculatePart1 = flow(
  getStacksAndInstructions, //
  O.chain(A.head),
  O.map(flow(S.split("\n"), RA.toArray)),
  O.chain(flow(RA.init, O.map(RA.toArray))),
)

const part1Result = flow(
  calculatePart1,
  O.map(A.map(splitRowsToColumnPositions)),
  O.map(AStd.transpose),
  O.map(A.map(A.reverse)),
  (id) => id,
  // getTopsOfStacks,
  // joinTopsOfStacks,
)
part1Result(testData) // ?
// assert.strictEqual(part1Result, "CMZ") // ?

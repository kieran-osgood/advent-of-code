import * as S from "fp-ts/string"
import * as A from "fp-ts/Array"
import * as SStd from "fp-ts-std/string"
import * as AStd from "fp-ts-std/array"
import * as O from "fp-ts/Option"
import * as E from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import * as RA from "fp-ts/ReadonlyArray"
import * as assert from "assert"
import { Int, Validation } from "io-ts"
import { data } from "./data"
import { words } from "fp-ts-std/String"
import { IntFromString } from "io-ts-types/lib/IntFromString"
import { not } from "fp-ts/Predicate"

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

const is2Tuple = (a: readonly string[]) =>
  a.length === 2 ? O.some(a as [stacks: string, instructions: string]) : O.none

const splitStackInstructionsString: (
  s: string,
) => O.Option<[stacks: string, instructions: string]> = flow(
  S.split("\n\n"), //
  is2Tuple,
)

const getStackString: (s: string) => O.Option<string> = flow(
  splitStackInstructionsString, //
  O.chain(A.head),
)
const getInstructionString: (s: string) => O.Option<string> = flow(
  splitStackInstructionsString,
  O.chain(A.last),
)

/**
 * Preparing the stacks
 */

const splitRowsToColumnPositions = (a: string): Array<string> =>
  pipe(
    a,
    S.replace(/ {4}/g, " "),
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

const getTopsOfStacks: (a: string[][]) => O.None | O.Some<string[]> = flow(
  A.map(A.last), //
  O.sequenceArray,
  O.map(RA.toArray),
)

const joinTopsOfStacks: (a: O.Option<string[]>) => O.Option<string> = O.map(AStd.join(""))

const readStacksString = flow(
  getStackString, //
  O.map(flow(S.split("\n"), RA.toArray)),
  O.chain(flow(RA.init, O.map(RA.toArray))),
  O.map(
    flow(
      A.map(splitRowsToColumnPositions), //
      AStd.transpose,
      A.map(A.reverse),
      A.map(A.filter(not(S.isEmpty))),
    ),
  ),
)

/**
 * Preparing the instructions
 */

const matchInstructions = (s: string): RegExpExecArray | null => {
  const regex = /move (?<move>\d) from (?<from>\d) to (?<to>\d)/g
  return regex.exec(s)
}

type Instructions = Record<"from" | "move" | "to", Validation<Int>>
const convertInstructionsToInt = (o: Record<string, string>): Instructions => ({
  from: IntFromString.decode(o.from),
  move: IntFromString.decode(o.move),
  to: IntFromString.decode(o.to),
})

const readInstructionLine = flow(
  matchInstructions,
  O.fromNullable,
  O.chain((id) => O.fromNullable(id.groups)),
  O.map(convertInstructionsToInt),
)

/**
 * Parsing the results of the instructions
 * on the stacks
 */

const readInstructionString = flow(
  getInstructionString,
  O.map(flow(S.split("\n"), RA.toArray)),
  O.map(A.map(readInstructionLine)),
)

const readResult: (s: string[][]) => O.None | O.Some<string> = flow(
  getTopsOfStacks, //
  joinTopsOfStacks,
)

const move = (stacks: string[][], instruction: O.Option<Instructions>) => {
  if (
    O.isNone(instruction) ||
    E.isLeft(instruction.value.from) ||
    E.isLeft(instruction.value.to) ||
    E.isLeft(instruction.value.move)
  ) {
    return stacks
  }

  const stacksCopy: string[][] = JSON.parse(JSON.stringify(stacks))
  const fromStackIdx = instruction.value.from.right - 1
  const toStackIdx = instruction.value.to.right - 1

  const toStack = stacksCopy[toStackIdx]
  const fromStack = stacksCopy[fromStackIdx]
  const toMove = fromStack.splice(-instruction.value.move.right).reverse()

  stacksCopy[toStackIdx] = [...toStack, ...toMove]

  return stacksCopy
}

const moveStacks: (stackInstructions: {
  stacks: string[][]
  instructions: O.Option<Instructions>[]
}) => O.Option<string[][]> = flow(
  O.of,
  O.map(
    ({ stacks, instructions }) =>
      pipe(
        instructions, //
        A.reduce(stacks, move),
      ),
    //    need to make sure all arrays same length with empty strings
  ),
)

const part1 = (s: string) =>
  pipe(
    O.Do,
    O.bind("instructions", () => readInstructionString(s)),
    O.bind("stacks", () => readStacksString(s)),
    O.bind("newStacks", moveStacks),
    O.bind("result", ({ newStacks }) => readResult(newStacks)),
  )

const part1Result = part1(testData) // ?
if (part1Result._tag === "Some") {
  assert.strictEqual(part1Result.value.result, "CMZ")
}

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

type SplitStackInstructionsString = (s: string) => O.Option<[stacks: string, instructions: string]>
const splitStackInstructionsString: SplitStackInstructionsString = flow(
  S.split("\n\n"), //
  is2Tuple,
)

type GetStackString = (s: string) => O.Option<string>
const getStackString: GetStackString = flow(
  splitStackInstructionsString, //
  O.chain(A.head),
)

type GetInstructionString = (s: string) => O.Option<string>
const getInstructionString: GetInstructionString = flow(
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
        O.getOrElse(() => ""),
      ),
    ),
    RA.toArray,
  )

type GetTopsOfStacks = (a: string[][]) => O.None | O.Some<string[]>
const getTopsOfStacks: GetTopsOfStacks = flow(
  A.map(A.last), //
  O.sequenceArray,
  O.map(RA.toArray),
)

type JoinTopsOfStacks = (a: O.Option<string[]>) => O.Option<string>
const joinTopsOfStacks: JoinTopsOfStacks = O.map(AStd.join(""))

const readStacksString = flow(
  getStackString, //
  O.map(flow(S.split("\n"), RA.toArray)),
  O.chain(flow(RA.init, O.map(RA.toArray))),
  O.map(
    flow(
      A.map(splitRowsToColumnPositions),
      AStd.transpose,
      A.map(A.reverse),
      A.map(A.filter((s) => s !== " " && s !== "")),
      // A.map(A.filter(not(S.isEmpty))),
    ),
  ),
)

/**
 * Preparing the instructions
 */

const matchInstructions = (s: string): O.Option<RegExpExecArray> => {
  const regex = /move (?<move>\d*) from (?<from>\d*) to (?<to>\d*)/gi
  return O.fromNullable(regex.exec(s))
}

type Instructions = Record<"from" | "move" | "to", Validation<Int>>
const convertInstructionsToInt = (o: Record<string, string>): Instructions => ({
  from: IntFromString.decode(o.from),
  move: IntFromString.decode(o.move),
  to: IntFromString.decode(o.to),
})

type ReadInstructionLine = <A>(s: string) => O.Option<Instructions>
const readInstructionLine: ReadInstructionLine = flow(
  matchInstructions,
  O.chain((m) => O.fromNullable(m.groups)),
  O.map(convertInstructionsToInt),
)

/**
 * Parsing the results of the instructions
 * on the stacks
 */

const readInstructionString = flow(
  getInstructionString,
  O.map(
    flow(
      S.split("\n"), //
      RA.map(readInstructionLine),
      O.sequenceArray,
      O.map(RA.toArray),
    ),
  ),
)

const moveCrates = (stacks: string[][], instruction: Instructions) => {
  if (E.isLeft(instruction.from) || E.isLeft(instruction.to) || E.isLeft(instruction.move)) {
    return stacks
  }

  const stacksCopy: string[][] = JSON.parse(JSON.stringify(stacks))

  // const fromStackIdx = instruction.from.right - 1
  // const toStackIdx = instruction.to.right - 1
  // const count = instruction.move.right
  //
  // const movedCrates = stacksCopy[fromStackIdx].splice(0, count)
  // stacksCopy[toStackIdx].unshift(...movedCrates.reverse())
  //
  const toStackIdx = instruction.to.right - 1
  const fromStackIdx = instruction.from.right - 1

  const toStack = stacksCopy[toStackIdx]
  const fromStack = stacksCopy[fromStackIdx]

  const toMove = fromStack.splice(-instruction.move.right)
  stacksCopy[toStackIdx] = [...toStack, ...toMove]

  return stacksCopy
}

type MoveStacks = (stackInstructions: {
  readonly stacks: string[][]
  readonly instructions: O.Option<Instructions[]>
}) => O.Option<string[][]>
const moveStacks: MoveStacks = flow(
  O.of,
  O.chain(({ stacks, instructions }) =>
    pipe(
      instructions,
      O.map(
        flow(
          A.reduce(stacks, moveCrates),
          A.map((a) => (a.length === 0 ? [" "] : a)),
        ),
      ),
    ),
  ),
)

type ReadResult = (s: string[][]) => O.Option<string>
const readResult: ReadResult = flow(
  getTopsOfStacks, //
  joinTopsOfStacks,
)

const part1 = (s: string) =>
  pipe(
    O.Do,
    O.bind("instructions", () => readInstructionString(s)),
    O.bind("stacks", () => readStacksString(s)),
    O.bind("newStacks", moveStacks),
    O.bind("result", ({ newStacks }) => readResult(newStacks)),
  )

const part1Result2 = part1(testData)
if (part1Result2._tag === "Some") {
  // assert.strictEqual(part1Result2.value.result, "CMZ") // part1
  assert.strictEqual(part1Result2.value.result, "MCD") //part2
}

const part1Result = part1(data)
if (part1Result._tag === "Some") {
  // assert.strictEqual(part1Result.value.result, "VRWBSFZWM") // part1
  assert.strictEqual(part1Result.value.result, "RBTWJWMCF") // part2
}

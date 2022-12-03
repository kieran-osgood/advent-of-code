import * as S from 'fp-ts/lib/string'
import * as A from 'fp-ts/Array'
import {pipe,} from 'fp-ts/function'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import {data} from "./data";
import {add} from "../utils/number";

// const data = `A Y
// B X
// C Z`

// MY ENEMY
type Enemy = 'A' | 'B' | 'C'
const enemyRock = 'A' as const
const enemyPaper = 'B' as const
const enemyScissors = 'C' as const

// ME
type Me = 'X' | 'Y' | 'Z'
const rock = 'X' as const
const paper = 'Y' as const
const scissors = 'Z' as const

const decodeMove: Record<Enemy | Me, 'rock' | 'paper' | 'scissors'> = {
    [enemyRock]: 'rock',
    [enemyPaper]: 'paper',
    [enemyScissors]: 'scissors',

    [rock]: 'rock',
    [paper]: 'paper',
    [scissors]: 'scissors',
}

const winResponse = {
    [enemyRock]: paper,
    [enemyPaper]: scissors,
    [enemyScissors]: rock,
} as const

const movePoints = {
    [rock]: 1,
    [paper]: 2,
    [scissors]: 3,
} as const

const roundPoints = {
    lose: 0,
    draw: 3,
    win: 6,
} as const

const getResultPart1 = (my: Me, enemy: Enemy): 'win' | 'draw' | 'lose' => {
    const [enemyMove, myMove] = [decodeMove[enemy], decodeMove[my]]
    const winMove = winResponse[enemy]

    const winResult = my === winMove
    const drawResult = enemyMove === myMove
    const loseResult = !winResult && !drawResult

    switch (true) {
        case winResult:
            return 'win'
        case drawResult:
            return 'draw'
        case loseResult:
            return 'lose'
    }
}

const calculatePointsPart1 = (a: RNEA.ReadonlyNonEmptyArray<string>): number => {
    const [enemy, my] = a as [Enemy, Me]
    const result = getResultPart1(my, enemy)
    const movePointResult = movePoints[my]

    return movePointResult + roundPoints[result]
}

const part1Result = pipe(
    data,
    S.split('\n'),
    RNEA.map(S.split(' ')),
    RNEA.map(calculatePointsPart1),
    RNEA.reduce(0, add)
)

part1Result // ?


const resultWantedMap = {
    'X': 'lose',
    'Y': 'draw',
    'Z': 'win',
} as const

const movePointsMap = {
    rock: 1,
    paper: 2,
    scissors: 3,
} as const

const loseResponse = {
    [enemyRock]: scissors,
    [enemyPaper]: rock,
    [enemyScissors]: paper,
} as const

const getMyMove = (enemy: Enemy, resultWanted: typeof resultWantedMap[keyof typeof resultWantedMap]) => {
    switch (resultWanted) {
        case 'draw':
            return enemy
        case 'win':
            return winResponse[enemy]
        case 'lose':
            return loseResponse[enemy]
    }
}

const calculatePointsPart2 = (a: RNEA.ReadonlyNonEmptyArray<string>): number => {
    const [enemy, resultWantedInstruction] = a as [Enemy, Me]
    const resultWanted = resultWantedMap[resultWantedInstruction]
    const myMove = getMyMove(enemy, resultWanted)
    const movePointResult = movePointsMap[decodeMove[myMove]]
    return movePointResult + roundPoints[resultWanted]
}

const part2Result = pipe(
    data,
    S.split('\n'),
    RNEA.map(S.split(' ')),
    RNEA.map(calculatePointsPart2),
    RNEA.reduce(0, add)
)

part2Result // ?

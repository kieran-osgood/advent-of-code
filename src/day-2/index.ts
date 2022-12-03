import * as S from 'fp-ts/lib/string'
import * as A from 'fp-ts/Array'
import {pipe,} from 'fp-ts/function'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import {data} from "./data";
import {add} from "../utils/number";


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
}

const calculatePoints = (a: RNEA.ReadonlyNonEmptyArray<string>): number => {
    const [enemy, my] = a as [Enemy, Me]
    const [enemyMove, myMove] = [decodeMove[enemy], decodeMove[my]]

    const winMove = winResponse[enemy]
    const winResult = my === winMove
    const drawResult = enemyMove === myMove
    const loseResult = !winResult && !drawResult
    const movePointResult = movePoints[my]

    switch (true) {
        case winResult:
            return roundPoints.win + movePointResult
        case drawResult:
            return roundPoints.draw + movePointResult
        case loseResult:
            return roundPoints.lose + movePointResult
    }
}

const res = pipe(
    data,
    S.split('\n'),
    RNEA.map(S.split(' ')),
    RNEA.map(calculatePoints),
    RNEA.reduce(0, add)
)

res // ?

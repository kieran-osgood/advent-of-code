import * as S from 'fp-ts/lib/string'
// import {data} from './data'
export const data = `8462
6981

6702`
import {Eq} from 'fp-ts/Eq'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as N from 'fp-ts/number'
import {flow, pipe} from 'fp-ts/function'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import {compose} from "fp-ts/lib/pipeable";
import { IntFromString } from 'io-ts-types/lib/IntFromString'

function getItems(): RNEA.ReadonlyNonEmptyArray<string> {
    return pipe(
        data,
        S.split('\n'),
    )
}

const group = <A>(S: Eq<A>): ((as: Array<A>) => Array<Array<A>>) => {
    return A.chop((as) => {
        const {init, rest} = pipe(
            as,
            A.spanLeft((a: A) => S.equals(a, as[0]))
        )
        return [init, rest]
    })
}

let i = 0
const groupByElf = RNEA.reduce([], (s: string[], ss: string) => {
    // move index on meeting elf separators
    if (ss === '') {
        ++i
        return s
    }

    const startingS = s[i] ?? ''

    s[s.length] = (startingS + ' ' + ss).trim()

    return s
})

const sumByElf = (s: string[]) => {

    return pipe(
        s,
        A.map(
            flow(
                S.split(' '),
                RNEA.map(IntFromString.decode),
            )
        ),
    )
}

const res = pipe(
    getItems(),
    id => id, // ?
    groupByElf, // ?
    id => id, // ?
    sumByElf

) // ?
// group(S.Eq)(getItems()) // ?

import {data} from './data'
import * as S from 'fp-ts/lib/string'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as N from 'fp-ts/number'
import {flow, pipe,} from 'fp-ts/function'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import {IntFromString} from 'io-ts-types/lib/IntFromString'
import {Int, Validation} from "io-ts";
import {ord} from "fp-ts";

const add = (a: number, b: number) => a + b

let i = 0
const groupByElf = RNEA.reduce([], (s: string[], ss: string) => {
    // move index on meeting elf separators
    S.Eq.equals(ss, '') && ++i

    const startingS = s[i] ?? ''

    s[i] = (startingS + ' ' + ss).trim()

    return s
})

const parseToInt = flow(
    A.map(
        flow(
            S.split(' '),
            RNEA.map(
                IntFromString.decode,
            ),
        )
    ),
)

const sumByElf: (a: RNEA.ReadonlyNonEmptyArray<Validation<Int>>[]) => number[] = A.map(
    flow(
        RNEA.map(
            E.getOrElse(() => 0),
        ),
        RNEA.reduce(0, add),
    )
)

const reversedOrdNumber = ord.reverse(N.Ord);

const elfTotals = pipe(
    data,
    S.split('\n'),
    groupByElf,
    parseToInt,
    sumByElf,
    A.sort(reversedOrdNumber),
)

const part1 = pipe(
    elfTotals,
    A.lookup(0),
    O.getOrElse(() => -1),
) // ? 67663

const part2 = pipe(
    elfTotals,
    A.takeLeft(3),
    A.reduce(0, add)
) // ? 199628

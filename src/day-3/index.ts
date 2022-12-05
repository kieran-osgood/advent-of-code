import * as S from 'fp-ts/lib/string'
import * as SStd from 'fp-ts-std/string'
import * as AStd from 'fp-ts-std/array'
import * as NES from 'fp-ts-std/NonEmptyString'
import * as A from 'fp-ts/Array'
import * as Predicate from 'fp-ts/Predicate'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as B from 'fp-ts/Boolean'
import {flow, pipe, tupled,} from 'fp-ts/function'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
// import {data} from "./data";
import {add} from "../utils/number";
import {identity} from "io-ts";
import * as RA from "fp-ts/ReadonlyArray";
import {curry2,} from "fp-ts-std/Function";

// const data = `vJrwpWtwJgWrhcsFMMfFFhFp
// jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
// PmmdzqPrVvPwwTWBwg
// wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
// ttgJtRGJQctTZtZT
// CrZsJsPPZsGzwwsLwLmpwMDw`

const addUpperValue = (char: string) => {
    const upper = SStd.isUpper(char)

    return pipe(
        char,
        SStd.isUpper,
        B.match(
            () => 0,
            () => 26
        )
    )
}

const getCharValue = (char: string) => (s: string) => pipe(
    char,
    NES.unsafeFromString,
    NES.toLowerCase,
    NES.unNonEmptyString
) === s
import * as TE from "fp-ts/TaskEither";

const getIndex = (char: string) => {
    const alphabet = ['_', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    return pipe(
        alphabet,
        A.findIndex(curry2(S.Eq.equals)(char)),
        // O.getOrElseW(() => 'not found')
        O.getOrElseW(() => -1)
    )

}

const calculateCharValue = (char: string) => {
    return pipe(
        char,
        O.of,
        O.map(c => pipe(
            c,
            SStd.isUpper,
            B.fold(
                () => getIndex(c),
                () => getIndex(S.toLowerCase(c)) + 26,
            )
        )),
        O.getOrElseW(() => 0)
    )
} // ?

// calculateCharValue('a') // ?
// calculateCharValue('b') // ?
// calculateCharValue('A') // ?
// calculateCharValue('B') // ?
// calculateCharValue('p') // ?
// calculateCharValue('asd') // ?

// expect 16

const data = `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`
// expect 157 total

const splitStringInTwo = (id: string): [string, string] => SStd.splitAt(id.length / 2)(id)

const splitByChars = flow(
    A.map(S.split('')),
    A.map(RA.toArray)
)

const splitByLines = flow(
    S.split('\n'),
    RA.toArray
)

const tupleIntersection = (a: string[][]) => A.intersection(S.Eq)(a[0])(a[1])

const intersectionList = pipe(
    data,
    splitByLines,
    A.chain(
        flow(
            splitStringInTwo,
            splitByChars,
            tupleIntersection,
        )
    ),
    A.uniq(S.Eq),
    A.map(calculateCharValue),
    AStd.sum
)

intersectionList // ?
// expect 157 total

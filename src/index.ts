import {
  produce,
  applyPatches,
  isDraftable
} from "immer"

import /* type */ { Draft, Patch } from "immer"

type SetState <S> =
  (draft: Draft<S>) => void | S | PromiseLike<void | S>

type ReplaceReturnType <T extends (...args: any[]) => any, U> =
  (...args: Parameters<T>) => U

type ReturnActions <S, A extends Actions<S>> = {
  [K in keyof A]: ReplaceReturnType<A[K], void>
}

export interface Actions <S> {
  [key: string]: (...payload: any[]) => SetState<S>
}

export interface StaticStore <S, A extends Actions<S>> {
  state: Readonly<S>,
  actions: ReturnActions<S, A>
}

export interface Store <S, A extends Actions<S>> {
  useStore: () => StaticStore<S, A>
  getState: () => Readonly<S>
  getActions: () => ReturnActions<S, A>,
  subscribe: (subscriber: () => any) => () => void
}

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof value === "object" &&
  typeof (value as any).then === "function"

export const createStore = <S, R extends Actions<S>> (
  initialState: S,
  reducers: R = {} as R
): Store<S, R> => {
  let currentState = initialState
  let changes: Patch[] = []
  let inverseChanges: Patch[] = []

  const subscriptions: Set<() => any> = new Set()

  const performUpdate = (state: S) => {
    if (isDraftable(state)) {
      const result = applyPatches(currentState, changes)
      changes = []
      inverseChanges = []
      currentState = result
    } else {
      currentState = state
    }

    subscriptions.forEach(subscriber => subscriber())
  }

  const getAction = (key: string) => (...args: any[]) => {
    const setState = reducers[key](...args)
    const result = produce(
      currentState,
      setState,
      (patches: Patch[], inversePatches: Patch[]) => {
        changes.push(...patches)
        inverseChanges.push(...inversePatches)
      }
    )

    if (isThenable(result)) {
      ;(result as PromiseLike<S>).then(performUpdate)
    } else {
      performUpdate(result as S)
    }
  }

  const proxy: ReturnActions<S, R> = new Proxy(reducers, {
    get: (_target, key, _desc) => getAction(key as string)
  })

  return {
    getState: () => currentState ?? initialState,
    getActions: () => proxy,
    subscribe: subscriber => {
      subscriptions.add(subscriber)
      return () => subscriptions.delete(subscriber)
    },
    useStore: () => ({
      state: currentState ?? initialState,
      actions: proxy
    })
  }
}

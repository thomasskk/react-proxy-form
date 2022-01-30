import * as React from 'react'
import { UseFormReturn } from './types'

const HookFormContext = React.createContext<UseFormReturn<
  Record<string, any>
> | null>(null)

export const useFormContext = <T,>() =>
  React.useContext(HookFormContext) as unknown as UseFormReturn<T>

type Props<T> = {
  children: React.ReactNode
} & UseFormReturn<T>

export const FormProvider = <T,>(props: Props<T>) => {
  const { children, ...rest } = props
  return (
    <HookFormContext.Provider value={rest as any}>
      {children}
    </HookFormContext.Provider>
  )
}

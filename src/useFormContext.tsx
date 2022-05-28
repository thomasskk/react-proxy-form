import React, { createContext, useContext } from 'react'
import type { ObjType, UseFormReturn } from './types/index.js'

const HookFormContext = createContext<UseFormReturn<ObjType> | null>(null)

export const useFormContext = <T extends ObjType>() =>
  useContext(HookFormContext) as unknown as UseFormReturn<T>

type Props<T extends ObjType> = {
  children: React.ReactNode
} & UseFormReturn<T>

export const FormProvider = <T extends ObjType>(props: Props<T>) => {
  const { children, ...rest } = props
  return (
    <HookFormContext.Provider value={rest as any}>
      {children}
    </HookFormContext.Provider>
  )
}

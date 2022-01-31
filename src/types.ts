import { ObjectType } from '@badrap/valita'
import { ChangeEvent } from 'react'

export type Join<T extends unknown[], D extends string> = T extends []
  ? ''
  : T extends [string]
  ? `${T[0]}`
  : T extends [number]
  ? `[${T[0]}]`
  : T extends [string, ...infer R]
  ? `${T[0]}${D}${Join<R, D>}`
  : T extends [number, ...infer R]
  ? `[${T[0]}]${D}${Join<R, D>}`
  : string

export type NestedPaths<Type> = Type extends string | number | boolean | Date
  ? []
  : Type extends Array<infer ArrayType>
  ? [number, ...NestedPaths<ArrayType>]
  : Type extends ReadonlyArray<infer ArrayType>
  ? [number, ...NestedPaths<ArrayType>]
  : Type extends object
  ? {
      [Key in Extract<keyof Type, string>]: [Key, ...NestedPaths<Type[Key]>]
    }[Extract<keyof Type, string>]
  : []

export type Path<T> = Join<NestedPaths<T>, '.'>

export type El =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | null

export type eventEl =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | ChangeEvent<HTMLSelectElement>
  | ChangeEvent<null>

type useFormBaseProps<T> = {
  defaultValue?: DeepPartial<T>
  sideValidation?: {
    defaultValue?: any
  } & (
    | {
        validation?: never
        matchSide?: never
      }
    | {
        validation: ObjectType
        matchSide?: [string, string, string][]
      }
  )
  setAfterSubmit?: Record<string, any>
  autoUnregister?: boolean
  resetOnSubmit?: boolean
  setBeforeSubmit?: Record<string, any>
}

export type UseFormProps<T> = useFormBaseProps<T> &
  (
    | {
        validation?: never
        match?: never
      }
    | {
        validation: ObjectType
        match?: [string, string, string][]
      }
  )
export type SetValue<T> = (name: Path<T>, value: any) => void
export type GetValue<T> = (path: Path<T>) => any
export type SetDefaultValue<T> = (value: DeepPartial<T>) => void
export type Errors<T> = (path: Path<T>) => any

export type UseFormReturn<T> = {
  register: UseFormRegister
  reset: () => void
  errors: Errors<T>
  sideErrors: Errors<T>
  handleSubmit: HandleSubmit<T>
  getValue: GetValue<T>
  setValue: SetValue<T>
  setSideValue: SetValue<T>
  getSideValue: GetValue<T>
  getAllValue: () => T
  getAllSideValue: () => any
  setDefaultValue: SetDefaultValue<T>
  watchSideValue: (path: Path<T>) => any
  watchValue: (path: Path<T>) => any
}

export type DefaultValue = string | number | Date | null | undefined
// eslint-disable-next-line @typescript-eslint/ban-types
export type ValueAs =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | undefined
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function
export type InputType =
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'text'
  | 'textarea'
  | 'date'
  | 'datetime-local'
  | 'password'
  | 'number'

export type UseFormRegisterOptions = {
  type?: InputType
  defaultValue?: DefaultValue
  valueAs?: ValueAs
  sideValueAs?: ValueAs
  onChange?: (event: eventEl) => void
  defaultChecked?: boolean
  sideValueName?: string
  transformSideValue?: (value: any, el?: any) => any
  transformValue?: (value: any, el?: any) => any
  registerSideOnly?: boolean
}

export type UseFormRegister = (
  _name: string,
  _options?: UseFormRegisterOptions
) => UseFormRegisterReturn

export type UseFormRegisterReturn = {
  onChange: (event: eventEl) => void
  ref: (el: El) => void
  name: string
  defaultValue: string | number | undefined
}

export type SubmitHandler<T> = (data: T) => void

export type HandleSubmit<T> = (
  cb: (data: T) => void
) => (event?: React.BaseSyntheticEvent) => void

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type ValueType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ((value: string) => string | undefined)
  | (() => void)

type BaseRefElValue = {
  registerSideOnly?: boolean
  sideValueName?: string
  defaultValue: any
  valueType: ValueType
  sideValueType: ValueType
}

export type RefElValue = BaseRefElValue &
  (
    | {
        el: Map<
          string,
          {
            value: HTMLInputElement
            valueType: ValueType
            sideValueType: ValueType
          } | null
        > | null
        type: 'checkbox' | 'radio'
      }
    | {
        el: El
        type:
          | 'select'
          | 'text'
          | 'textarea'
          | 'date'
          | 'datetime-local'
          | 'password'
          | 'number'
      }
  )

export type RefEl = React.MutableRefObject<Map<string, RefElValue>>

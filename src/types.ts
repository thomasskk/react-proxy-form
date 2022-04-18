import { ObjectType } from '@badrap/valita'
import { ChangeEvent } from 'react'

export type Join<T extends unknown[]> = T extends [string]
  ? `${T[0]}`
  : T extends [number] | []
  ? `[${T[0]}]`
  : T extends [string, ...infer R]
  ? `${T[0]}${'.'}${Join<R>}` | T[0]
  : T extends [number, ...infer R]
  ? `[${T[0]}]${'.'}${Join<R>}` | `[${T[0]}]`
  : string

export type NestedPaths<T> = T extends undefined
  ? any
  : T extends string | number | boolean | Date
  ? []
  : T extends Array<infer ArrayT>
  ? [number, ...NestedPaths<ArrayT>]
  : T extends ReadonlyArray<infer ArrayT>
  ? [number, ...NestedPaths<ArrayT>]
  : T extends object
  ? {
      [Key in Extract<keyof T, string>]: [Key, ...NestedPaths<T[Key]>]
    }[Extract<keyof T, string>]
  : []

export type Path<T> = Join<NestedPaths<T>>

export type PropertyType<
  Type,
  Property extends string
> = Property extends keyof Type
  ? Type[Property]
  : Property extends `${infer Key}.${infer Rest}`
  ? Key extends `[${infer Prefix}]`
    ? // @ts-expect-error is a number
      PropertyType<Type[Prefix], Rest>
    : Key extends keyof Type
    ? PropertyType<Type[Key], Rest>
    : unknown
  : Property extends `[${infer Prefix}]`
  ? // @ts-expect-error is a number
    Type[Prefix]
  : unknown

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

type useFormBaseProps<T = unknown, S = unknown> = {
  defaultValue?: DeepPartial<T>
  sideValidation?: {
    defaultValue?: DeepPartial<S>
    validation: any
  }
  setAfterSubmit?: Record<string, unknown>
  autoUnregister?: boolean
  resetOnSubmit?: boolean
  setBeforeSubmit?: Record<string, unknown>
}

export type UseFormProps<T, S> = useFormBaseProps<T, S> & {
  validation?: ObjectType
}

export type SetValue<T> = <P extends Path<T>>(
  path: P,
  value: PropertyType<T, P>
) => void
export type GetValue<T> = <P extends Path<T>>(path: P) => PropertyType<T, P>
export type SetDefaultValue<T> = (value: DeepPartial<T>) => void
export type Errors<T> = (path: Path<T>) => any

export type UseFormReturn<T, S> = {
  register: UseFormRegister<T>
  reset: () => void
  errors: Errors<T>
  sideErrors: Errors<T>
  handleSubmit: HandleSubmit<T>
  getValue: GetValue<T>
  setValue: SetValue<T>
  setSideValue: SetValue<S>
  getSideValue: GetValue<S>
  getAllValue: () => T
  getAllSideValue: () => S
  setDefaultValue: SetDefaultValue<T>
  watch: <P extends Path<T>>(
    path: P,
    opts?: { side: boolean }
  ) => PropertyType<T, P>
}

export type DefaultValue = string | number | Date | null | undefined
export type ValueAs =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | undefined
  | (() => void)
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
  value?: any
}

export type UseFormRegister<T> = (
  _name: Path<T>,
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

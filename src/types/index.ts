import { ObjectType } from '@badrap/valita'
import { ChangeEvent } from 'react'
import { DeepPartial, Path, PropertyType } from './utils'

export type Primitive =
  | boolean
  | string
  | number
  | symbol
  | null
  | bigint
  | undefined

type Obj = Record<string | number | symbol, Primitive>

type BaseObjType<T> = Record<
  string | number | symbol,
  T | Obj | Primitive | ArrayType
>

export type ArrayType = (ObjType | Primitive)[]
export interface ObjType extends BaseObjType<ObjType> {}

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

type useFormBaseProps<T extends ObjType, S extends ObjType = never> = {
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

export type UseFormProps<
  T extends ObjType,
  S extends ObjType = never
> = useFormBaseProps<T, S> & {
  validation?: ObjectType
}

export type SetValue<T> = <P extends Path<T>>(
  path: P,
  value: PropertyType<T, P>
) => void
export type GetValue<T> = <P extends Path<T>>(path: P) => PropertyType<T, P>
export type SetDefaultValue<T> = (value: DeepPartial<T>) => void
export type Errors<T> = (path: Path<T>) => any

export type Watch<T extends ObjType, S extends ObjType> = <
  P extends Path<K>,
  B extends boolean = false,
  K = B extends true ? S : T
>(
  path: P,
  opts?: { side?: B; defaultValue: PropertyType<K, P> }
) => PropertyType<K, P>

export type UseFormReturn<T extends ObjType, S extends ObjType = never> = {
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
  watch: Watch<T, S>
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
  type: InputType
  defaultChecked?: boolean
  value: any
}

export type SubmitHandler<T> = (data: T) => void

export type HandleSubmit<T> = (
  cb: (data: T) => void
) => (event?: React.BaseSyntheticEvent) => void

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

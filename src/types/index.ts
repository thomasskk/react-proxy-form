import { ChangeEvent } from 'react'
import { DeepPartial, Path, PropertyType } from './utils.js'

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

export type eventEl =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | ChangeEvent<HTMLSelectElement>
  | ChangeEvent<null>

type useFormBaseProps<T extends ObjType> = {
  defaultValue?: DeepPartial<T>
  setAfterSubmit?: Record<string, unknown>
  autoUnregister?: boolean
  resetOnSubmit?: boolean
  setBeforeSubmit?: Record<string, unknown>
}

export type UseFormProps<T extends ObjType> = useFormBaseProps<T> & {
  validation?: any
}

export type SetValue<T> = <P extends Path<T>>(
  path: P,
  value: PropertyType<T, P>
) => void
export type GetValue<T> = <P extends Path<T>>(path: P) => PropertyType<T, P>
export type SetDefaultValue<T> = (value: DeepPartial<T>) => void
export type Errors<T> = (path: Path<T>) => any

export type Watch<T extends ObjType> = <P extends Path<T>>(
  path: P,
  opts?: { defaultValue: PropertyType<T, P> }
) => PropertyType<T, P>

export type UseFormReturn<T extends ObjType> = {
  register: UseFormRegister<T>
  reset: () => void
  errors: Errors<T>
  handleSubmit: HandleSubmit<T>
  getValue: GetValue<T>
  setValue: SetValue<T>
  getAllValue: () => T
  setDefaultValue: SetDefaultValue<T>
  watch: Watch<T>
}

export type DefaultValue = string | number | undefined

export type ValueAs =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ((value: unknown) => unknown)
  | (() => void)

export type UseFormRegisterOptions = {
  type?: InputType
  defaultValue?: DefaultValue
  valueAs?: ValueAs
  onChange?: (event: eventEl) => void
  defaultChecked?: boolean
  transformValue?: (value: any, el?: any) => any
  value?: any
}

export type UseFormRegister<T> = (
  _name: Path<T>,
  _options?: UseFormRegisterOptions
) => UseFormRegisterReturn

export type UseFormRegisterReturn = {
  onChange: (event: eventEl) => void
  ref: (el: Element) => void
  name: string
  defaultValue?: DefaultValue
  type: InputType
  defaultChecked?: boolean
  value: any
}

export type SubmitHandler<T> = (data: T) => void

export type HandleSubmit<T> = (
  cb: (data: T) => void
) => (event?: React.BaseSyntheticEvent) => void

export type InputType =
  | 'checkbox'
  | 'radio'
  | 'text'
  | 'date'
  | 'datetime-local'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'

export type Element =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | null

export type RefElValue = {
  defaultValue: any
  valueAs: ValueAs
  elements: Set<Element>
  type: InputType
}

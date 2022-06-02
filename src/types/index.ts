import type { ChangeEvent } from 'react'
import type { DeepPartial, Path, PropertyType } from './utils.js'

export type Primitive =
  | boolean
  | string
  | number
  | symbol
  | null
  | bigint
  | undefined

export type eventEl =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | ChangeEvent<HTMLSelectElement>
  | ChangeEvent<null>

export type UseFormProps<T extends object> = {
  defaultValue?: DeepPartial<T>
  autoUnregister?: boolean
  resetOnSubmit?: boolean
  isValidation?: boolean
}

export type SetValue<T> = <P extends Path<T>>(
  path: P,
  value: PropertyType<T, P>
) => void
export type GetValue<T> = <P extends Path<T>>(path: P) => PropertyType<T, P>
export type SetDefaultValue<T> = (value: DeepPartial<T>) => void

export type Error<T> = (path: Path<T>) => string[] | undefined
export type Errors<T> = () => T

export type Watch<T extends object> = <P extends Path<T>>(
  path: P,
  opts?: { defaultValue: PropertyType<T, P> }
) => PropertyType<T, P>

export type UseFormReturn<T extends object> = {
  register: UseFormRegister<T>
  reset: () => void
  error: Error<T>
  errors: any
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

type Validation<T, P extends Path<T>> = {
  fn: (v: PropertyType<T, P>) => boolean
  message?: string
}[]

export type UseFormRegisterOptions<T, P extends Path<T>> = {
  type?: InputType
  defaultValue?: PropertyType<T, P>
  valueAs?: ValueAs
  onChange?: (event: eventEl) => void
  defaultChecked?: boolean
  transformValue?: (value: PropertyType<T, P>, el?: Element) => unknown
  value?: PropertyType<T, P>
  validation?: Validation<T, P>
  required?: string | boolean
}

export type UseFormRegister<T> = <P extends Path<T>>(
  _name: P,
  _options?: UseFormRegisterOptions<T, P>
) => UseFormRegisterReturn<T, P>

export type UseFormRegisterReturn<T, P extends Path<T>> = {
  onChange: (event: eventEl) => void
  ref: (el: Element) => void
  name: string
  defaultValue?: PropertyType<T, P>
  type: InputType
  defaultChecked?: boolean
  value: PropertyType<T, P>
}

export type SubmitHandler<T> = (data: T) => void

export type HandleSubmit<T> = (
  cb?: (data: T, e?: React.BaseSyntheticEvent) => void
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

export type RefElValue<T, P extends Path<T>> = {
  defaultValue: object
  valueAs: ValueAs
  elements: Set<Element>
  type: InputType
  validation?: Validation<T, P>
  required?: string | boolean
}

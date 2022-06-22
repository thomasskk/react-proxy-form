import type { ChangeEvent, HTMLInputTypeAttribute } from 'react'
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

export type UseFormProps<T extends object = any> = {
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

export type UseFormReturn<T extends object = any> = {
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
  fn: (v: PropertyType<T, P>, values: T) => boolean | Promise<boolean>
  message?: string
}[]

export type UseFormRegisterOptions<T, P extends Path<T>> = {
  type?: InputType
  defaultValue?: PropertyType<T, P>
  onChange?: (event: eventEl) => void | Promise<void>
  defaultChecked?: boolean
  transform?: (value: PropertyType<T, P>, el?: Element) => unknown
  value?: PropertyType<T, P>
  validation?: Validation<T, P>
  required?: string | boolean
}

export type UseFormRegister<T> = <P extends Path<T>>(
  _name: P,
  _options?: UseFormRegisterOptions<T, P>
) => UseFormRegisterReturn<T, P>

export type UseFormRegisterReturn<T = any, P extends Path<T> = any> = {
  onChange: (event: eventEl) => Promise<void>
  ref: (el: Element) => void
  name: string
  defaultValue?: PropertyType<T, P>
  type: InputType
  defaultChecked?: boolean
  value: PropertyType<T, P>
}

export type SubmitHandler<T> = (data: T) => void

export type HandleSubmit<T = any> = (
  cb?: (data: T, e?: React.BaseSyntheticEvent) => Promise<void> | void
) => (event?: React.BaseSyntheticEvent) => Promise<void>

export type InputType = HTMLInputTypeAttribute | 'textarea' | 'select'

export type Element =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | null

export type RefElValue<T, P extends Path<T>> = {
  defaultValue: object
  elements: Set<Element>
  type: InputType
  validation?: Validation<T, P>
  required?: string | boolean
  transform?: (value: any, el?: Element) => any
}

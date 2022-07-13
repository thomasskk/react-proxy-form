import { useReducer, useRef, useState } from 'react'
import type {
  Element,
  GetValue,
  HandleSubmit,
  RefElValue,
  SetDefaultValue,
  SetValue,
  UseFormProps,
  UseFormRegister,
  UseFormReturn,
  Watch,
} from './types/index'
import type { Path } from './types/utils'
import { errorProxy } from './utils/errorProxy'
import { errorsWatcher } from './utils/errorsWatcher'
import { get } from './utils/get'
import {
  refreshSymbol,
  resetSymbol,
  updateGlbobalSymbol,
  updateSymbol,
} from './utils/proxySymbol'
import { set } from './utils/set'
import { unset } from './utils/unset'
import { updateProxy } from './utils/updateProxy'
import { watcher } from './utils/watcher'

export function useForm<T extends object = any>(
  props: UseFormProps<T> = {}
): UseFormReturn<T> {
  const {
    isValidation = true,
    autoUnregister = false,
    resetOnSubmit = true,
    validation,
  } = props

  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const [defaultFormValue, setdefaultFormValue] = useState(props.defaultValue)

  const watchStore = useRef(new Set<string>())

  const resetRef = useRef(0)

  const formValue = useRef(
    defaultFormValue !== undefined ? { v: { ...defaultFormValue } } : { v: {} }
  )

  const formErrors = useRef(errorProxy())

  const updateStore = useRef(updateProxy())

  const isDefaultSet = useRef(false)

  const refEl = useRef<Map<Path<T>, RefElValue<T, Path<T>>>>(new Map())

  const isDirty = useRef<Set<string>>(new Set())

  const reset = () => {
    formValue.current =
      defaultFormValue !== undefined
        ? { v: { ...defaultFormValue } }
        : { v: {} }
    isDefaultSet.current = false
    formErrors.current = errorProxy()
    refEl.current = new Map()
    watchStore.current = new Set()
    updateStore.current = updateProxy()
    isDirty.current = new Set()
    resetRef.current += 1
    forceUpdate()
  }

  const setDefaultValue: SetDefaultValue<T> = (value) => {
    if (!isDefaultSet.current) {
      isDefaultSet.current = true
      formValue.current.v = { ...value }
      setdefaultFormValue(value)
    }
  }

  const getAllValue = () => {
    return formValue.current.v as T
  }

  const getValue: GetValue<T> = (path) => {
    return get(formValue.current.v, path)
  }

  const setValue: SetValue<T> = (name, value) => {
    isDirty.current.add(name)
    return set(formValue.current.v, name, value)
  }

  const validate = async (
    path: Path<T>,
    ref: RefElValue<T, Path<T>>,
    values: T
  ) => {
    const mssg: string[] = []
    const value = getValue(path)
    const isRequired = ref.required

    if (typeof ref.validation === 'function') {
      ref.validation = [{ fn: ref.validation, message: ref.message }]
    }

    await Promise.all([
      ...ref.validation.map(async ({ fn, message }) => {
        !(await fn(value, values)) && mssg.push(message || 'Validation failed')
      }),
    ])

    if (validation) {
      const errMssg = (await validation(path, value)).errors.get(path)
      errMssg && mssg.push(errMssg)
    }

    if (isRequired && (value === '' || value === undefined || value === null)) {
      mssg.push(typeof isRequired === 'string' ? isRequired : 'Field required')
    }

    const isValid = mssg.length === 0

    formErrors.current[path as string] = {
      code: isValid ? refreshSymbol : updateSymbol,
      //mssg is ignored for refreshSymbol
      value: mssg,
    }

    return isValid
  }

  const validateAll = async () => {
    let isValid = true

    formErrors.current[''] = { code: resetSymbol }

    const values = getAllValue()

    await Promise.all(
      [...refEl.current.entries()].map(async (entry) => {
        if (!(await validate(entry[0], entry[1], values))) {
          isValid = false
        }
      })
    )

    if (!isValid) {
      formErrors.current[''] = { code: updateGlbobalSymbol }
    }

    return isValid
  }

  const watch: Watch<T> = (path, opts) => {
    return watcher(
      formValue.current,
      path,
      updateStore.current,
      watchStore.current,
      resetRef.current,
      opts?.defaultValue as object
    )
  }

  const setFormValue = <N extends Path<T>>(
    entry: RefElValue<T, N>,
    name: N,
    isUpdate = false
  ) => {
    const { elements, type, transform } = entry

    const value: Map<string, unknown> = new Map()
    const isRadio = entry.type === 'radio'

    for (const [key, element] of elements as Map<string, HTMLInputElement>) {
      const v = element.value ?? element.defaultValue

      if (type === 'checkbox') {
        if (element?.checked) {
          value.set(key, transform(v, element))
        } else {
          value.delete(key)
        }
        continue
      }

      if (isRadio) {
        if (element?.checked) {
          return set(formValue.current.v, name, transform(v, element), isUpdate)
        }
        continue
      }

      return set(formValue.current.v, name, transform(v, element), isUpdate)
    }

    if (isRadio) {
      return
    }

    set(formValue.current.v, name, [...value.values()], isUpdate)
  }

  const handleSubmit: HandleSubmit<T> = (callback) => async (e) => {
    e?.preventDefault?.()

    if (isValidation && !(await validateAll())) {
      return
    }

    await callback?.(getAllValue(), e)

    resetOnSubmit && reset()
  }

  const register: UseFormRegister<T> = (name, options = {}) => {
    const {
      type = 'text',
      onChange,
      transform = (v) => v,
      defaultChecked,
      value,
      validation = [],
      required,
      message,
      onUnmount,
      onMount,
    } = options

    const isDirtyBool = isDirty.current.has(name)
    let defaultValue = options.defaultValue ?? get(defaultFormValue, name)

    if (!autoUnregister) {
      defaultValue = isDirtyBool ? getValue(name) ?? defaultValue : defaultValue
    }

    return {
      ...{
        type,
        name,
        defaultChecked,
        value: value as any,
        defaultValue:
          type === 'checkbox' || type === 'radio' ? undefined : defaultValue,
      },
      onChange: async (event) => {
        const ref = refEl.current.get(name)

        if (!ref) {
          return
        }

        setFormValue(ref, name)
        isDirty.current.delete(name)

        if (
          isValidation &&
          formErrors.current?.[name as string] !== undefined
        ) {
          await validate(name, ref, getAllValue())
          formErrors.current[''] = { code: updateGlbobalSymbol }
        }

        if (watchStore.current.has(name)) {
          updateStore.current[name as string] = { code: updateSymbol }
        }

        await onChange?.(event.currentTarget, getValue(name))
      },
      ref: async (element: Element) => {
        const refElValue = refEl.current.get(name)
        const id = name + value

        if (!element) {
          autoUnregister &&
            refElValue?.elements.get(id) &&
            isDirty.current.delete(name)

          refElValue?.elements.delete(id)

          if (autoUnregister && refElValue?.elements.size === 0) {
            refEl.current.delete(name)
            unset(formValue.current.v, name)
          }

          return onUnmount?.(element)
        }

        if (!refElValue) {
          const newRef = {
            elements: new Map([[id, element]]),
            defaultValue,
            type,
            validation,
            required,
            transform,
            message,
          }
          // @ts-expect-error type
          refEl.current.set(name, newRef)
          !isDirtyBool && setFormValue(newRef, name, true)
        } else {
          refElValue.elements.set(id, element)
          !isDirtyBool && setFormValue(refElValue, name, true)
        }

        await onMount?.(element, getValue(name))
      },
    }
  }

  return {
    register,
    reset,
    watch,
    errors: () => errorsWatcher(formErrors.current, resetRef.current),
    error: (path) => errorsWatcher(formErrors.current, resetRef.current, path),
    handleSubmit,
    setValue,
    getValue,
    getAllValue,
    setDefaultValue,
  }
}

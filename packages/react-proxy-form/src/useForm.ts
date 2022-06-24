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

  const formValue = useRef(
    defaultFormValue !== undefined
      ? { value: { ...defaultFormValue } }
      : { value: {} }
  )

  const formErrors = useRef(errorProxy())

  const updateStore = useRef(updateProxy())

  const isDefaultSet = useRef(false)

  const isPrevValid = useRef(false)

  const refEl = useRef<Map<Path<T>, RefElValue<T, Path<T>>>>(new Map())

  const reset = () => {
    formValue.current.value =
      defaultFormValue !== undefined ? { ...defaultFormValue } : {}
    isDefaultSet.current = false
    isPrevValid.current = false
    refEl.current = new Map()
    formErrors.current = errorProxy()
    updateStore.current = updateProxy()
    forceUpdate()
  }

  const setDefaultValue: SetDefaultValue<T> = (value) => {
    if (!isDefaultSet.current) {
      isDefaultSet.current = true
      formValue.current.value = { ...value }
      setdefaultFormValue(value)
    }
  }

  const getAllValue = () => {
    for (const entry of refEl.current) {
      if (autoUnregister && !entry[1].elements.has(null)) {
        unset(formValue.current.value, entry[0])
      }
    }
    return formValue.current.value as T
  }

  const getValue: GetValue<T> = (path) => {
    if (autoUnregister && refEl.current.get(path)?.elements.has(null)) {
      return
    }
    return get(formValue.current.value, path)
  }

  const setValue: SetValue<T> = (name, value) => {
    return set(formValue.current.value, name, value)
  }

  const validate = async (
    path: Path<T>,
    ref: RefElValue<T, Path<T>>,
    values: T
  ) => {
    let isValid = true
    const mssg: string[] = []
    const value = getValue(path)

    if (typeof ref.validation === 'function') {
      ref.validation = [{ fn: ref.validation, message: ref.message }]
    }

    await Promise.all([
      ...ref.validation.map(async ({ fn, message }) => {
        if (!(await fn(value, values))) {
          isValid = false
          mssg.push(message || 'Validation failed')
        }
      }),
    ])

    if (validation) {
      const errMssg = (await validation(path, value)).errors.get(path)
      if (errMssg) {
        isValid = false
        mssg.push(errMssg)
      }
    }

    if (ref.required) {
      if (value === undefined || value === null || value === '') {
        isValid = false
        mssg.push(
          typeof ref?.required === 'string' ? ref.required : 'Field required'
        )
      }
    }

    if (isValid) {
      formErrors.current[path as string] = { code: refreshSymbol }
    } else {
      formErrors.current[path as string] = { code: updateSymbol, value: mssg }
    }

    return isValid
  }

  const validateAll = async () => {
    let isValid = true

    if (!isValidation) {
      return true
    }

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

    isPrevValid.current = isValid

    return isValid
  }

  const watch: Watch<T> = (path, opts) => {
    return watcher(
      formValue.current.value,
      path,
      updateStore.current,
      watchStore.current,
      opts?.defaultValue as object
    )
  }

  const setFormValue = <N extends Path<T>>(
    entry: RefElValue<T, N> | undefined,
    name: N
  ) => {
    if (!entry) {
      return
    }

    const { elements, type, transform } = entry

    let value: unknown[] = []

    for (const element of elements.values() as IterableIterator<HTMLInputElement>) {
      if (type === 'checkbox') {
        if (element?.checked) {
          value.push(transform(element?.value, element))
        } else {
          value = value?.filter((v) => v !== transform(element?.value, element))
        }
        continue
      }

      if (entry.type === 'radio') {
        if (element.checked) {
          return set(
            formValue.current.value,
            name,
            transform(element?.value, element)
          )
        }
        continue
      }

      if (element?.value === undefined) {
        set(formValue.current.value, name, undefined)
      } else {
        set(formValue.current.value, name, transform(element?.value, element))
      }
      return
    }

    set(formValue.current.value, name, value)
  }

  const handleSubmit: HandleSubmit<T> = (callback) => async (e) => {
    if (isValidation && !(await validateAll())) {
      return
    }

    await callback?.(getAllValue(), e)

    if (resetOnSubmit) {
      reset()
    }
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
    } = options

    let defaultValue = options.defaultValue ?? get(defaultFormValue, name)

    if (autoUnregister) {
      defaultValue = defaultValue ?? getValue(name)
      if (defaultValue !== undefined) {
        set(formValue.current.value, name, defaultValue)
      }
    }

    return {
      ...{
        type,
        name,
        defaultChecked,
        value,
        defaultValue,
      },
      onChange: async (event) => {
        const ref = refEl.current.get(name)
        setFormValue(ref, name)

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

        await onChange?.(event, getValue(name))
      },
      ref: (element: Element) => {
        const refElValue = refEl.current.get(name)

        if (!refElValue) {
          const newRef = {
            elements: new Set([element]),
            defaultValue,
            type,
            validation,
            required,
            transform,
            message,
          }
          // @ts-expect-error type
          refEl.current.set(name, newRef)
          setFormValue(newRef, name)
        } else if (element && !refElValue.elements.has(element)) {
          refElValue.elements.add(element)
          setFormValue(refElValue, name)
        }
      },
    }
  }

  return {
    register,
    reset,
    watch,
    errors: () => errorsWatcher(formErrors.current),
    error: (path) => errorsWatcher(formErrors.current, path),
    handleSubmit,
    setValue,
    getValue,
    getAllValue,
    setDefaultValue,
  }
}

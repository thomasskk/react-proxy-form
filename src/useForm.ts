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
} from './types/index.js'
import type { DeepPartial, Path } from './types/utils.js'
import { errorProxy } from './utils/errorProxy.js'
import { updateProxy } from './utils/updateProxy.js'
import { errorWatcher } from './utils/errorWatcher.js'
import { errorsWatcher } from './utils/errorsWatcher.js'
import { get } from './utils/get.js'
import { set } from './utils/set.js'
import { unset } from './utils/unset.js'
import { watcher } from './utils/watcher.js'
import {
  refreshSymbol,
  resetSymbol,
  updateGlbobalSymbol,
  updateSymbol,
} from './utils/proxySymbol.js'

export function useForm<T extends object>(
  props: UseFormProps<T> = {
    autoUnregister: false,
    resetOnSubmit: true,
    isValidation: true,
  }
): UseFormReturn<T> {
  const { isValidation, autoUnregister, resetOnSubmit } = props

  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const [defaultFormValue, setdefaultFormValue] = useState(props.defaultValue)

  const watchStore = useRef(new Set<string>())

  const formValue = useRef(
    defaultFormValue !== undefined
      ? { value: { ...defaultFormValue } }
      : { value: {} as DeepPartial<T> }
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

  const validate = <P extends Path<T>>(path: P) => {
    let isValid = true
    const mssg: string[] = []
    const ref = refEl.current.get(path)
    const value = getValue(path)

    ref?.validation?.forEach(({ fn, message }) => {
      // @ts-expect-error map
      if (!fn(value)) {
        isValid = false
        mssg.push(message || 'Validation failed')
      }
    })

    if (ref?.required) {
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

  const validateAll = () => {
    let isValid = true

    if (!isValidation) {
      return true
    }

    formErrors.current[''] = { code: resetSymbol }

    for (const entry of refEl.current) {
      if (!validate(entry[0])) {
        isValid = false
      }
    }

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

    const { elements, type, valueAs } = entry

    let value: unknown[] = []

    for (const element of elements.values() as IterableIterator<HTMLInputElement>) {
      if (type === 'checkbox') {
        if (element?.checked) {
          value.push(valueAs(element.value))
        } else {
          value = value?.filter((v) => v !== valueAs(element?.value))
        }
        continue
      }

      if (entry.type === 'radio' && element.checked) {
        return set(formValue.current.value, name, valueAs(element?.value))
      }

      if (element?.value === undefined) {
        set(formValue.current.value, name, undefined)
      } else {
        set(formValue.current.value, name, valueAs(element?.value))
      }
      return
    }

    set(formValue.current.value, name, value)
  }

  const handleSubmit: HandleSubmit<T> = (callback) => (e) => {
    if (isValidation && !validateAll()) {
      return
    }

    callback?.(getAllValue(), e)

    if (resetOnSubmit) {
      reset()
    }
  }

  const register: UseFormRegister<T> = (name, options = {}) => {
    const {
      type = 'text',
      onChange,
      valueAs = String,
      defaultChecked,
      value,
      validation,
      required,
    } = options

    let defaultValue = options.defaultValue ?? get(defaultFormValue, name)

    if (autoUnregister) {
      defaultValue = defaultValue ?? (getValue(name) as unknown)
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
      onChange: (event) => {
        setFormValue(refEl.current.get(name), name)

        if (
          isValidation &&
          formErrors.current?.[name as string] !== undefined
        ) {
          validate(name)
          formErrors.current[''] = { code: updateGlbobalSymbol }
        }

        if (watchStore.current.has(name)) {
          updateStore.current[name as string] = { code: updateSymbol }
        }

        onChange?.(event)
      },
      ref: (element: Element) => {
        const refElValue = refEl.current.get(name)

        if (!refElValue) {
          const newRef = {
            elements: new Set([element]),
            defaultValue,
            valueAs,
            type,
            validation,
            required,
          }
          // @ts-expect-error map
          refEl.current.set(name, newRef)
          setFormValue(newRef, name)
        } else if (!refElValue.elements.has(element)) {
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
    error: (path) => errorWatcher(formErrors.current, path),
    handleSubmit,
    setValue,
    getValue,
    getAllValue,
    setDefaultValue,
  }
}

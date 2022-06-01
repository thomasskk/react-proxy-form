import { useReducer, useRef, useState } from 'react'
import type {
  Element,
  GetValue,
  HandleSubmit,
  ObjType,
  RefElValue,
  SetDefaultValue,
  SetValue,
  UseFormProps,
  UseFormRegister,
  UseFormReturn,
  Watch,
} from './types/index.js'
import { DeepPartial } from './types/utils.js'
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

export function useForm<T extends ObjType>(
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

  const refEl = useRef<Map<string, RefElValue>>(new Map())

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

  const validate = (path: any) => {
    let isValid = true
    let mssg: string[] = []
    const ref = refEl.current.get(path)
    const value = getValue(path)

    ref?.validation?.forEach(({ fn, message }) => {
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
      formErrors.current[path] = { code: refreshSymbol }
    } else {
      formErrors.current[path] = { code: updateSymbol, value: mssg }
    }

    return isValid
  }

  const validateAll = () => {
    let isValid = true

    if (!isValidation) {
      return true
    }

    formErrors.current.err = { code: resetSymbol }

    for (const entry of refEl.current) {
      if (!validate(entry[0])) {
        isValid = false
      }
    }

    if (!isValid) {
      formErrors.current.err = { code: updateGlbobalSymbol }
    }

    isPrevValid.current = isValid

    return isValid
  }

  // @ts-expect-error
  const watch: Watch<T> = (path, opts) => {
    return watcher(
      formValue.current.value,
      // @ts-expect-error
      path,
      updateStore.current,
      watchStore.current,
      opts?.defaultValue
    )
  }

  const setFormValue = (entry: RefElValue | undefined, name: string) => {
    if (!entry) {
      return
    }

    const { elements, type, valueAs } = entry

    let value: any[] = []

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
        set(formValue.current.value, name, valueAs(element?.value))
        return
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

  const register: UseFormRegister<T> = (name, _options = {}) => {
    let {
      type = 'text',
      onChange,
      valueAs = String,
      defaultValue,
      defaultChecked,
      value,
      validation,
      required,
    } = _options

    defaultValue = defaultValue ?? get(defaultFormValue, name)

    if (autoUnregister) {
      defaultValue = defaultValue ?? (getValue(name) as any)
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

        if (isValidation && formErrors.current?.[name] !== undefined) {
          validate(name)
          formErrors.current.err = { code: updateGlbobalSymbol }
        }

        if (watchStore.current.has(name)) {
          updateStore.current[name] = { code: updateSymbol }
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

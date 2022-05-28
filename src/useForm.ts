import { useReducer, useRef, useState } from 'react'
import type {
  Element,
  eventEl,
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
import { error } from './utils/error.js'
import { get } from './utils/get.js'
import { resolver } from './utils/resolver.js'
import { set } from './utils/set.js'
import { unset } from './utils/unset.js'
import { watcher } from './utils/watcher.js'
import {
  refreshSymbol,
  resetAndUpdateSymbol,
  resetSymbol,
  updateSymbol,
} from './utils/proxySymbol.js'

export function useForm<T extends ObjType>(
  props: UseFormProps<T> = {
    autoUnregister: false,
    resetOnSubmit: true,
  }
): UseFormReturn<T> {
  const {
    defaultValue,
    validation: _validation,
    setBeforeSubmit: _setBeforeSubmit,
    autoUnregister: _autoUnregister,
    resetOnSubmit: _resetOnSubmit,
    setAfterSubmit: _setAfterSubmit,
  } = props

  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const [_defaultFormValue, _setdefaultFormValue] = useState(defaultValue)

  const watchStore = useRef(new Set<string>())

  const formValue = useRef(
    _defaultFormValue !== undefined
      ? { value: { ..._defaultFormValue } }
      : { value: {} as DeepPartial<T> }
  )

  const formErrors = useRef(errorProxy())

  const updateStore = useRef(updateProxy())

  const isDefaultSet = useRef(false)

  const prevErrors = useRef(false)

  const refEl = useRef<Map<string, RefElValue>>(new Map())

  const reset = () => {
    formValue.current.value
    _defaultFormValue !== undefined ? { ..._defaultFormValue } : {}
    isDefaultSet.current = false
    refEl.current = new Map()
    formErrors.current.err = { code: resetSymbol }
    updateStore.current.up = { code: resetSymbol }
    forceUpdate()
  }

  const setDefaultValue: SetDefaultValue<T> = (value) => {
    if (!isDefaultSet.current) {
      isDefaultSet.current = true
      formValue.current.value = { ...value }
      _setdefaultFormValue(value)
    }
  }

  const getAllValue = () => {
    for (const entry of refEl.current) {
      if (_autoUnregister && !entry[1]) {
        unset(formValue.current.value, entry[0])
      }
    }
    return formValue.current.value as T
  }

  const getValue: GetValue<T> = (path) => {
    return get(formValue.current.value, path)
  }

  const setValue: SetValue<T> = (name, value) => {
    return set(formValue.current.value, name, value)
  }

  const validate = (name: string) => {
    let isError = false
    if (_validation) {
      isError = resolver(_validation, getAllValue(), formErrors.current, name)
      if (!isError) {
        formErrors.current[name] = { code: refreshSymbol }
      }
    }
  }

  const validateAll = () => {
    let isErrors = false

    if (_validation) {
      formErrors.current.err = { code: resetAndUpdateSymbol }

      isErrors = resolver(
        _validation,
        getAllValue(),
        formErrors.current,
        undefined
      )

      if (!isErrors && prevErrors.current) {
        formErrors.current.err = { code: resetAndUpdateSymbol }
      }

      prevErrors.current = isErrors
    }

    return !isErrors
  }

  // @ts-expect-error
  const watch: Watch<T> = (path, opts) => {
    return watcher({
      // @ts-expect-error
      path,
      object: formValue.current.value,
      updateStore: updateStore.current,
      watchStore: watchStore.current,
      defaultValue: opts?.defaultValue,
    })
  }

  const errors = (path: string) => {
    return error(formErrors.current, path)
  }

  const setFormValue = (
    entry: RefElValue | undefined,
    name: string,
    prox: any
  ) => {
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
        set(prox, name, valueAs(element.value))
        return
      }

      if (element?.value === undefined) {
        set(prox, name, undefined)
      } else {
        set(prox, name, valueAs(element?.value))
      }
      return
    }

    set(prox, name, value)
  }

  const handleSubmit: HandleSubmit<T> = (callback) => (e) => {
    e?.preventDefault()
    e?.stopPropagation()

    for (const entry of refEl.current) {
      if (_autoUnregister && !entry[1]) {
        unset(formValue.current.value, entry[0])
      } else {
        setFormValue(entry[1], entry[0], formValue.current.value)
      }
    }

    if (_setBeforeSubmit) {
      for (const [key, value] of Object.entries(_setBeforeSubmit)) {
        set(formValue.current.value, key, value)
      }
    }

    if (!validateAll()) {
      return
    }

    if (_setAfterSubmit) {
      for (const [key, value] of Object.entries(_setAfterSubmit)) {
        set(formValue.current.value, key, value)
      }
    }

    callback(getAllValue())

    if (_resetOnSubmit) {
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
    } = _options

    if (_autoUnregister) {
      value = get(_defaultFormValue, name) ?? value
    } else {
      value = getValue(name)
    }

    if (valueAs instanceof Boolean) {
      if (type === 'radio') {
        defaultChecked = !!value === !!value
      } else if (type === 'checkbox') {
        defaultValue = value
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
      onChange: (event: eventEl) => {
        setFormValue(refEl.current.get(name), name, formValue.current.value)

        if (_validation && formErrors.current?.[name] !== undefined) {
          validate(name)
        }

        const watchValue = watchStore.current.has(name)

        if (watchValue) {
          updateStore.current[name] = { code: updateSymbol }
        }

        onChange?.(event)
      },
      ref: (element: Element) => {
        const refElValue = refEl.current.get(name)

        if (!refElValue) {
          refEl.current?.set(name, {
            elements: new Set([element]),
            defaultValue,
            valueAs,
            type,
          })
          return
        } else if (!refElValue.elements.has(element)) {
          refElValue.elements.add(element)
        }
      },
    }
  }

  return {
    register,
    reset,
    watch,
    errors,
    handleSubmit,
    setValue,
    getValue,
    getAllValue,
    setDefaultValue,
  }
}

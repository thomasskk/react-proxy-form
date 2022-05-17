import { useReducer, useRef, useState } from 'react'
import {
  DeepPartial,
  DefaultValue,
  El,
  eventEl,
  GetValue,
  HandleSubmit,
  RefElValue,
  SetDefaultValue,
  SetValue,
  UseFormProps,
  UseFormRegister,
  UseFormReturn,
} from './types'
import createErrorProxy from './utils/createErrorProxy'
import createUpdateProxy from './utils/createUpdateProxy'
import { error } from './utils/error'
import { get } from './utils/get'
import { isStringDate } from './utils/isHelper'
import { resolver } from './utils/resolver'
import set from './utils/set'
import { unset } from './utils/unset'
import { watcher } from './utils/watcher'

export function useForm<T>(
  props: UseFormProps<T> = {
    autoUnregister: false,
    resetOnSubmit: true,
  }
): UseFormReturn<T> {
  const {
    defaultValue,
    validation: _validation,
    sideValidation: _sideValidation,
    setBeforeSubmit: _setBeforeSubmit,
    autoUnregister: _autoUnregister,
    resetOnSubmit: _resetOnSubmit,
    setAfterSubmit: _setAfterSubmit,
  } = props
  const [depUpdate, forceDepUpdate] = useState(0)

  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const [_defaultFormValue, _setdefaultFormValue] = useState<
    DeepPartial<T> | undefined
  >(defaultValue)

  const formSValue = useRef(
    _sideValidation?.defaultValue
      ? { value: { ..._sideValidation?.defaultValue } }
      : { value: {} }
  )
  const formSErrors = useRef<any>(createErrorProxy())

  const formValue = useRef(
    _defaultFormValue !== undefined
      ? { value: { ..._defaultFormValue } }
      : { value: {} }
  )

  const formErrors = useRef<any>(createErrorProxy())

  const updateStore = useRef<any>(createUpdateProxy())

  const isDefaultSet = useRef<any>(false)

  const prevErrors = useRef<any>(false)
  const prevSErrors = useRef<any>(false)

  const refEl = useRef<Map<string, RefElValue>>(new Map())

  const reset = () => {
    formSValue.current.value = _sideValidation?.defaultValue
      ? { ..._sideValidation?.defaultValue }
      : {}
    formValue.current.value =
      _defaultFormValue !== undefined ? { ..._defaultFormValue } : {}
    isDefaultSet.current = false
    refEl.current = new Map()
    formErrors.current.err = { code: 'RESET' }
    formSErrors.current.err = { code: 'RESET' }
    updateStore.current.up = { code: 'RESET' }
    forceUpdate()
    forceDepUpdate((v) => v + 1)
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
      if (_autoUnregister && !entry[1].el) {
        unset(formValue.current.value, entry[0])
      }
    }
    return formValue.current.value as T
  }

  const getAllSideValue = () => {
    for (const entry of refEl.current) {
      if (_autoUnregister && !entry[1].el) {
        unset(formSValue.current.value, entry[1].sideValueName)
      }
    }
    return formSValue.current.value as T
  }

  const getValue: GetValue<T> = (path) => get(formValue.current.value, path)
  const getSideValue: GetValue<T> = (path) =>
    get(formSValue.current.value, path)

  const setValue: SetValue<T> = (name, value) =>
    set(formValue.current.value, name, value)
  const setSideValue: SetValue<T> = (name, value) =>
    set(formSValue.current.value, name, value)

  const validate = (name: string, side: boolean) => {
    const isValidation = _validation
    const isSValidation = _sideValidation
    let isError = false
    if (!side && isValidation) {
      isError = resolver(_validation, getAllValue(), formErrors.current, name)
      if (!isError) {
        formErrors.current[name] = { code: 'REFRESH' }
      }
    } else if (isSValidation) {
      isError = resolver(
        _sideValidation.validation,
        getAllSideValue(),
        formSErrors.current,
        name
      )
      if (!isError) {
        formSErrors.current[name] = { code: 'REFRESH' }
      }
    }
  }

  const validateAll = () => {
    const isValidation = _validation
    const isSValidation = _sideValidation
    let isErrors = false
    let isSErrors = false

    if (isValidation) {
      formErrors.current.err = { code: 'RESET_AND_UPDATE' }

      isErrors = resolver(
        _validation,
        getAllValue(),
        formErrors.current,
        undefined
      )
      if (!isErrors && prevErrors.current) {
        formErrors.current.err = { code: 'RESET_AND_UPDATE' }
      }
      formErrors.current.err = { code: 'A' }

      prevErrors.current = isErrors
    }

    if (isSValidation) {
      formSErrors.current.err = { code: 'RESET_AND_UPDATE' }

      isSErrors = resolver(
        _sideValidation.validation,
        getAllSideValue(),
        formSErrors.current,
        undefined
      )

      if (!isSErrors && prevSErrors.current) {
        formSErrors.current.err = { code: 'RESET_AND_UPDATE' }
      }

      prevSErrors.current = isSErrors
    }
    return !isSErrors && !isErrors
  }

  const watch = (path: string, opts = { side: false }) => {
    return watcher({
      path,
      object: opts.side ? formSValue.current.value : formValue.current.value,
      updateStore: updateStore.current,
    })
  }

  const errors = (path: string) => {
    return error(formErrors.current, path)
  }
  const sideErrors = (path: string) => {
    return error(formSErrors.current, path)
  }

  const setFormValue = (
    entry?: RefElValue,
    name?: string,
    prox?: any,
    side?: boolean
  ) => {
    if (
      entry === undefined ||
      !entry.el ||
      name === undefined ||
      prox === undefined
    ) {
      return
    }

    const valueType = side ? entry.sideValueType : entry.valueType

    switch (entry.type) {
      // CHECKBOX
      case 'checkbox': {
        if (valueType === Boolean) {
          if (entry.el?.values().next().value?.value) {
            set(prox, name, entry.el?.values().next().value?.value?.checked)
          }
          break
        }
        let value: any[] = []
        for (const v of entry.el.values()) {
          if (v?.value) {
            if (v.value.checked) {
              value.push(valueType(v.value.value))
            } else {
              value = value.filter((v) => v !== valueType(v?.value?.value))
            }
          }
        }
        set(prox, name, value)
        break
      }
      // RADIO
      case 'radio':
        for (const el of entry.el.values()) {
          if (el?.value?.checked) {
            set(
              prox,
              name,
              side
                ? el.sideValueType(el?.value?.value)
                : el.valueType(el?.value?.value)
            )
          }
        }
        break
      // DEFAULT
      default: {
        if (entry.el?.value === 'false' && valueType === Boolean) {
          set(prox, name, false)
        } else {
          if (
            entry.el?.value === undefined ||
            entry.el?.value === null ||
            entry.el?.value === ''
          ) {
            set(prox, name, undefined)
          } else {
            set(prox, name, valueType(entry.el?.value))
          }
        }
      }
    }
  }

  const handleSubmit: HandleSubmit<T> = (callback) => (e) => {
    e?.preventDefault()
    e?.stopPropagation()

    for (const entry of refEl.current) {
      if (_autoUnregister && !entry[1].el) {
        unset(formValue.current.value, entry[0])
        unset(formSValue.current.value, entry[1].sideValueName)
      } else {
        setFormValue(
          entry[1],
          entry[1].sideValueName,
          formSValue.current.value,
          true
        )
        if (!entry[1].registerSideOnly) {
          setFormValue(entry[1], entry[0], formValue.current.value)
        }
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

  const valueDate = (value: string) => new Date(value).toISOString()

  const defineType = (_type: any, _valueAs: any) => {
    if (_valueAs instanceof Function) {
      return _valueAs
    }

    switch (_type) {
      case 'date':
        return valueDate
      case 'number':
        return Number
    }

    switch (_valueAs) {
      case 'string':
        return String
      case 'boolean':
        return Boolean
      case 'number':
        return Number
      case 'date':
        return valueDate
    }
  }

  const register: UseFormRegister<T> = (_name, _options = {}) => {
    const {
      type: _type = 'text',
      onChange: _onChange,
      valueAs: _valueAs = 'string',
      sideValueAs: _sideValueAs = 'string',
      defaultValue: _defaultValue,
      sideValueName: _sideValueName,
      defaultChecked: _defaultChecked,
      registerSideOnly: _registerSideOnly = false,
      value: _value,
    } = _options
    const valueType = defineType(_type, _valueAs)
    const sideValueType = defineType(_type, _sideValueAs)

    let defaultValue: DefaultValue
    let defaultChecked = _defaultChecked

    if (!_autoUnregister) {
      const v = getValue(_name as any)
      if (v !== undefined) {
        if (_type == 'radio' && _valueAs == 'boolean') {
          defaultChecked = !!_value == !!v
        } else if (_type === 'date' || _type === 'datetime-local') {
          const sliceEnd = _type === 'date' ? 10 : -1
          defaultValue = new Date(v).toISOString().slice(0, sliceEnd)
        } else if (_type != 'checkbox' && _type != 'radio') {
          defaultValue = v
        }
      }
    } else if (
      (_type === 'date' || _type === 'datetime-local') &&
      isStringDate(_defaultValue)
    ) {
      const sliceEnd = _type === 'date' ? 10 : -1
      defaultValue = new Date(_defaultValue).toISOString().slice(0, sliceEnd)
    } else {
      if (_defaultValue !== undefined) {
        defaultValue = _defaultValue
      } else if (_type != 'radio') {
        defaultValue = get(_defaultFormValue, _name)
      }
    }

    const props: any = {
      type: _type,
      name: _name,
    }

    if (_value !== undefined) {
      props.value = _value
    }
    if (defaultChecked !== undefined) {
      props.defaultChecked = defaultChecked
    }
    if (defaultValue !== undefined) {
      props.defaultValue = defaultValue
    }

    return {
      ...props,
      onChange: (event: eventEl) => {
        if (!_registerSideOnly) {
          setFormValue(refEl.current.get(_name), _name, formValue.current.value)
        }

        setFormValue(
          refEl.current.get(_name),
          _sideValueName,
          formSValue.current.value,
          true
        )

        if (_validation && formErrors.current?.[_name] !== undefined) {
          validate(_name, false)
        }

        if (
          _sideValueName &&
          _sideValidation &&
          formSErrors.current?.[_sideValueName] !== undefined
        ) {
          validate(_sideValueName, true)
        }
        _onChange?.(event)
      },
      ref: (el: El) => {
        if (_type === 'checkbox' || _type === 'radio') {
          const element = el as HTMLInputElement
          const id = element?.id

          const refElValue = refEl.current.get(_name)?.el as any

          if (!id) {
            refEl.current?.set(_name, {
              el: null,
              defaultValue,
              valueType,
              sideValueType,
              type: _type,
              sideValueName: _sideValueName,
              registerSideOnly: _registerSideOnly,
            })
            return
          }

          if (refElValue) {
            refElValue.set(id, {
              value: element,
              valueType,
              sideValueType,
            })
          } else {
            refEl.current.set(_name, {
              el: new Map([
                [
                  id,
                  {
                    value: element,
                    valueType,
                    sideValueType,
                  },
                ],
              ]),
              defaultValue,
              valueType,
              sideValueType,
              type: _type,
              sideValueName: _sideValueName,
              registerSideOnly: _registerSideOnly,
            })
          }
        } else {
          refEl.current.set(_name, {
            el,
            defaultValue,
            valueType,
            sideValueType,
            type: _type,
            sideValueName: _sideValueName,
            registerSideOnly: _registerSideOnly,
          })
        }
        const v = refEl.current.get(_name)

        if (v !== undefined) {
          if (!_registerSideOnly) {
            setFormValue(v, _name, formValue.current.value)
          }
          if (_sideValueName) {
            setFormValue(v, _sideValueName, formSValue.current.value, true)
          }
        }
      },
    }
  }

  return {
    register,
    reset,
    watch,
    errors,
    sideErrors,
    handleSubmit,
    setValue,
    getValue,
    setSideValue,
    getSideValue,
    getAllValue,
    getAllSideValue,
    setDefaultValue,
  }
}

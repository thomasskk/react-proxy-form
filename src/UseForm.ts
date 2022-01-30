import { useRef, useState } from 'react'
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
  ValueType
} from './types'
import createErrorProxy from './utils/createErrorProxy'
import error from './utils/error'
import get from './utils/get'
import { isStringDate } from './utils/isHelper'
import { resolver } from './utils/resolver'
import set from './utils/set'
import unset from './utils/unset'
import watch from './utils/watch'

/**
 * @param _match
 * @description _match : [string,string,string]
 * match[0] and match[1] are the fields to compare
 * match[2] is the error message value.
 * if match[0] and match[1] are not equal the error message will only be displayed on match[1]
 */
export function UseForm<T>(
  props: UseFormProps<T> = {
    autoUnregister: false,
    resetOnSubmit: true,
  }
): UseFormReturn<T> {
  const {
    defaultValue,
    validation: _validation,
    match: _match,
    sideValidation: _sideValidation,
    setBeforeSubmit: _setBeforeSubmit,
    autoUnregister: _autoUnregister,
    resetOnSubmit: _resetOnSubmit,
    setAfterSubmit: _setAfterSubmit,
  } = props

  const [_defaultFormValue, _setdefaultFormValue] = useState<
    DeepPartial<T> | undefined
  >(defaultValue)

  const formSValue = useRef({ ..._sideValidation?.defaultValue } || {})
  const formSErrors = useRef<any>(createErrorProxy())

  const formValue = useRef({ ...defaultValue } || {})
  const formErrors = useRef<any>(createErrorProxy())

  const prevErrors = useRef<any>(false)
  const prevSErrors = useRef<any>(false)

  const refEl = useRef<Map<string, RefElValue>>(new Map())

  const reset = () => {
    formSValue.current = { ..._sideValidation?.defaultValue } || {}
    formSErrors.current = { code: 'RESET' }
    formValue.current = { ...defaultValue } || {}
    formErrors.current.err = { code: 'RESET' }
    refEl.current = new Map()
  }

  const setDefaultValue: SetDefaultValue<T> = (value) => {
    _setdefaultFormValue(value)
  }

  const getAllValue = () => formValue.current as T
  const getAllSideValue = () => formSValue.current as T

  const getValue: GetValue<T> = (path) => get(formValue.current, path)
  const getSideValue: GetValue<T> = (path) => get(formSValue.current, path)

  const setValue: SetValue<T> = (name, value) =>
    set(formValue.current, name, value)
  const setSideValue: SetValue<T> = (name, value) =>
    set(formSValue.current, name, value)

  const validate = () => {
    const isValidation = _validation
    const isSValidation = _sideValidation
    let isErrors = false
    let isSErrors = false

    if (isValidation) {
      formErrors.current.err = { code: 'RESET' }

      isErrors = resolver(
        _validation,
        getAllValue(),
        formErrors.current,
        _match
      )
      if (!isErrors && prevErrors.current) {
        formErrors.current.err = { code: 'RESET_WITH_UPDATE' }
        return true
      }

      prevErrors.current = isErrors
    }

    if (isSValidation) {
      formSErrors.current.err = { code: 'RESET' }

      isSErrors = resolver(
        _sideValidation.validation!,
        getAllSideValue(),
        formSErrors.current,
        _sideValidation.matchSide
      )

      if (!isSErrors && prevSErrors.current) {
        formSErrors.current.err = { code: 'RESET' }
        return true
      }

      prevSErrors.current = isSErrors
    }

    return isSErrors && isErrors
  }

  const watchValue = (path: string) => watch(formValue.current, path)
  const watchSideValue = (path: string) => watch(formSValue.current, path)

  const errors = (path: string) => error(formErrors.current, path)
  const sideErrors = (path: string) => error(formSErrors.current, path)

  const setFormValue = (entry?: RefElValue, name?: string, prox?: any) => {
    if (
      entry === undefined ||
      !entry.el ||
      name === undefined ||
      prox === undefined
    ) {
      return
    }

    switch (entry.type) {
      // CHECKBOX
      case 'checkbox': {
        if (entry.valueType === Boolean) {
          if (entry.el?.values().next().value?.value) {
            set(prox, name, entry.el?.values().next().value?.value)
          }
          break
        }
        let value: any[] = []
        for (const v of entry.el.values()) {
          if (v?.value) {
            if (v.value.checked) {
              value.push((entry.valueType(v.value), v))
            } else {
              value = value.filter(
                (v) => v !== (entry.valueType(v.value.value), v)
              )
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
            set(prox, name, (entry.valueType(el?.value?.value), el))
          }
        }
        break
      // DEFAULT
      default: {
        if (entry.el?.value === 'false' && entry.valueType === Boolean) {
          set(prox, name, false)
        } else {
          if (
            entry.el?.value === undefined ||
            entry.el?.value === null ||
            entry.el?.value === ''
          ) {
            set(prox, name, undefined)
          } else {
            set(prox, name, (entry.valueType(entry.el?.value), entry.el))
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
        unset(formValue.current, entry[0])
        unset(formSValue.current, entry[1].sideValueName)
      } else {
        setFormValue(entry[1], entry[1].sideValueName, formSValue.current)
        if (!entry[1].registerSideOnly) {
          setFormValue(entry[1], entry[0], formValue.current)
        }
      }
    }

    if (_setBeforeSubmit) {
      for (const [key, value] of Object.entries(_setBeforeSubmit)) {
        set(formValue.current, key, value)
      }
    }

    if (!validate()) {
      return
    }

    if (_setAfterSubmit) {
      for (const [key, value] of Object.entries(_setAfterSubmit)) {
        set(formValue.current, key, value)
      }
    }

    callback(getAllValue())

    if (_resetOnSubmit) {
      reset()
    }
  }

  const register: UseFormRegister = (_name, _options = {}) => {
    const {
      type: _type = 'text',
      onChange: _onChange,
      valueAs: _valueAs = 'string',
      defaultValue: _defaultValue,
      sideValueName: _sideValueName,
      defaultChecked: _defaultChecked,
      registerSideOnly: _registerSideOnly = false,
    } = _options

    let valueType: ValueType

    const valueDate = (value: string) =>
      isStringDate(value) ? new Date(value).toISOString() : undefined

    switch (_type) {
      case 'date':
        valueType = valueDate
        break
      case 'number':
        valueType = Number
        break
    }

    switch (_valueAs) {
      case 'string':
        valueType = String
        break
      case 'boolean':
        valueType = Boolean
        break
      case 'number':
        valueType = Number
        break
      case 'date':
        valueType = valueDate
        break
    }

    let defaultValue: DefaultValue

    if (
      (_type === 'date' || _type === 'datetime-local') &&
      isStringDate(_defaultValue)
    ) {
      const sliceEnd = _type === 'date' ? 10 : -1
      defaultValue = new Date(_defaultValue).toISOString().slice(0, sliceEnd)
    } else {
      defaultValue = get(_defaultFormValue, _name)
    }

    return {
      onChange: (event: eventEl) => {
        if (!_registerSideOnly) {
          setFormValue(refEl.current.get(_name), _name, formValue.current)
        }

        setFormValue(
          refEl.current.get(_name),
          _sideValueName,
          formSValue.current
        )

        if (
          (_validation && formErrors.current?.[_name] !== undefined) ||
          (_sideValueName &&
            _sideValidation &&
            formSErrors.current?.[_sideValueName] !== undefined)
        ) {
          validate()
        }

        _onChange?.(event)
      },
      defaultChecked: _defaultChecked,
      type: _type,
      name: _name,
      defaultValue: defaultValue as string | number | undefined,
      ref: (el: El) => {
        const v = refEl.current.get(_name)

        if (_type === 'checkbox' || _type === 'radio') {
          const element = el as HTMLInputElement
          const id = element?.id

          const refElValue = refEl.current.get(_name)?.el as any

          if (!id) {
            refEl.current?.set(_name, {
              el: null,
              defaultValue,
              valueType,
              type: _type,
              sideValueName: _sideValueName,
              registerSideOnly: _registerSideOnly,
            })
            return
          }

          if (refElValue) {
            refElValue.set(id, {
              value: element,
            })
          } else {
            refEl.current.set(_name, {
              el: new Map([
                [
                  id,
                  {
                    value: element,
                    valueType,
                  },
                ],
              ]),
              defaultValue,
              valueType,
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
            type: _type!,
            sideValueName: _sideValueName,
            registerSideOnly: _registerSideOnly,
          })
        }
        if (v !== undefined) {
          if (!_registerSideOnly) {
            setFormValue(v, _name, formValue.current)
          }
          if (_sideValueName) {
            setFormValue(v, _sideValueName, formSValue.current)
          }
        }
      },
    }
  }

  return {
    register,
    reset,
    watchSideValue,
    watchValue,
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

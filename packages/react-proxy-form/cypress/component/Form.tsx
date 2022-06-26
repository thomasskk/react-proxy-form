import React from 'react'
import { useForm } from '../../src/index'

export const Form = (props: { cb: any }) => {
  const { register, watch, handleSubmit, errors } = useForm<{
    individual: string
    company: string
    status: 'individual' | 'company'
  }>({ autoUnregister: true })

  const watched = watch('status', { defaultValue: 'individual' })
  const submit = handleSubmit((data) => props.cb(data))
  const errs = errors()

  return (
    <form>
      {watched === 'individual' && (
        <>
          <input
            {...register('individual', {
              validation: (v) => v.length > 4,
              message: 'individual error',
            })}
          />
          {errs?.individual && <p>{errs?.individual[0]}</p>}
        </>
      )}
      {watched === 'company' && (
        <>
          <input
            {...register('company', {
              validation: (v) => v.length > 4,
              message: 'company error',
            })}
          />
          {errs?.company && <p>{errs?.company[0]}</p>}
        </>
      )}
      <input
        {...register('status', {
          type: 'radio',
          value: 'individual',
          defaultChecked: true,
        })}
      />
      <input
        {...register('status', {
          type: 'radio',
          value: 'company',
        })}
      />
      <button type='button' onClick={submit} />
    </form>
  )
}

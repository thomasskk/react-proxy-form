# react-proxy-form

---

- 2.2 kB gzipped
- Strongly typed
- Error re-render can be scoped to the component
- Fully asynchronous
- Syntax is heavily inspired from [react-hook-form](https://github.com/react-hook-form/react-hook-form)

---

```ts
import { useForm } from 'react-proxy-form'

function Form() {
  const { register, handleSubmit, errors } = useForm<{
    age: number
    data: [{ id: string }]
  }>()

  const errs = errors()

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input
        {...register('age', {
          required: true,
          valueAs: Number,
          validation: [
            { fn: (v) => v >= 18, message: 'You must be at least 18' },
          ],
        })}
      />
      {errs.age && <p> {errs.age[0]} </p>}
      <input
        {...register('data.[0].id', {
          required: 'Your id is required.',
          transform: (v) => v.toUpperCase(),
        })}
      />
      {errs['data.[0].id'] && <p> {errs['data.[0].id'][0]} </p>}
      <button />
    </form>
  )
}
```

## Installation

```bash
npm i react-proxy-form
yarn add react-proxy-form
```

## UseForm\<T\>

```ts
import { useForm } form 'react-proxy-form'

const Component = () => {
  const { register } = useForm<{id: number}>({
	defaultValue: { id: 1 },
	isValidation: true,
	resetOnSubmit: true,
	autoUnregister: false,
  })
}
```

options:

- ##### `defaultValue?:` DeepPartial\<T\>

- ##### `isValidation?:` boolean = true

- ##### `resetOnSubmit?:` boolean = true

- ##### `autoUnregister?:` boolean = false
  Unregister elements when they unmount.
  If the element remount its defaultValue will be automatically set.

## UseFormReturn\<T\>

#### register

> function register(path, options)

```ts
import { useFormContext } form 'react-proxy-form'

const Component = () => {
  const { register } = useFormContext<{id: number}>()

  return <input {...register('id', {
	required: 'You must enter a value',
	type: 'number',
	defaultValue: 2,
	transform: (v) => +v,
	onChange: (e) => console.log(e),
	validation: [{ fn: (v) => v > 0, message: 'Value must be superior to 0' }]
  })} />
}
```

options:

- ##### `required?:` boolean, string, undefined = false

  Indicate if the field is required or not. <br/>
  Passing a string is equivalent to `true` and will modify the default error mesage which is `"Field required"`. <br />
  A field is considered empty when its value is : `undefined`, `null` or `''`.

- ##### `type?:` HTLM input type attribute = 'text'

- ##### `defaultValue?:` V

- ##### `transform?:` (value: P, el: HTMLElement | null) => unknown

- ##### `onChange?:` (event: changeEvent) => void | Promise<void>

- ##### `defaultChecked?:` boolean

- ##### `value?:` T

- ##### `validation` { fn: (v: P, values: V) => boolean | Promise<boolean>, message?: string }[]

#### error

> (path: P) => string[] | undefined

Return a hook which trigger a single re-render when there is a validation error at the specified path.
The size of the array of error depend on the size of the validation array (+1 if required is true)

```ts
import { useFormContext } form 'react-proxy-form'

const Component = () => {
  const { error } = useFormContext()
  const err = error()

  return <p>{err[0]}</p>
}
```

#### errors

> () => string[] | undefined

Hook which trigger a single re-render when there is a validation error at the specified path.
The size of the array of error depend on the size of the validation array (+1 if required is true)

```ts
import { useForm } form 'react-proxy-form'

const Component = () => {
  const { errors } = useForm<{id: number}>()
  const errs = errors()

  return <p>{errs.id[0]}</p>
}
```

#### reset

Reset everything to the initial state. Trigger a re-render.

#### getValue

> (path: P) => V

#### setValue

> (path: P, value: V) => void

#### getAllValue

> () => T

#### setDefaultValue

> (value: DeepPartial<T>) => void

#### watch

> (path: P, opts?: { defaultValue: P }) => V

Hook which return the watched value and trigger a single re-render when it change.

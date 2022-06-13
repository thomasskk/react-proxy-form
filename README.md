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

## useForm

### UseFormReturn

#### `required`

> boolean, string, undefined

Indicate if the field is required or not. <br/>
Passing a string is equivalent to `true` and will modify the default error mesage which is `"Field required"`. <br />
A field is considered empty when it's value is : `undefined`, `null` or `''`.

#### `error`

> (path: string) => string[] | undefined

Return a hook which will trigger a single re-render when there is a validation error at the specified path.

```ts
import { useFormContext } form 'react-proxy-form'

const Component = () => {
  const { error } = useFormContext<{}>()
  const err = error()

  return <p>{err[0]}</p>
}
```

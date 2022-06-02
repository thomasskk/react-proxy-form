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
  const { register, handleSubmit, errors } =
    useForm<{ age: number; data: [{ id: string }] }>()

  const errs = errors()

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input
        {...register('age', {
          required: true,
          valueAs: Number,
          validation: [
            { fn: (v) => v > 0, message: 'Must be greater than 21' },
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

### Installation

```bash
npm i react-proxy-form
yarn add react-proxy-form
```

### useForm

import { ObjectType, ValitaError } from '@badrap/valita'
import get from './get'

const getFailureMessage = (failure: any) => {
  const { code, path, error, message } = failure

  switch (true) {
    case message !== undefined:
      return message
    case error !== undefined:
      return error
    case code === 'missing_value':
      return 'Veuillez remplir ce champ'
    default:
      return 'Champ invalide'
  }
}

export const resolver = (
  schema: ObjectType,
  values: Record<string, any>,
  errors: any,
  _name?: string,
  _match: [string, string, string][] = []
) => {
  let issues: ValitaError['issues'] | undefined

  try {
    schema.parse(values)
  } catch (error: unknown) {
    console.log(values)
    console.log(error)
    if (error instanceof ValitaError) {
      issues = error.issues
    } else {
      console.error(error)
    }
  }

  const matchErrorFieldsName: string[] = []

  if (!_name) {
    for (const [field1, field2, message] of _match) {
      const field1Value = get(values, field1)
      const field2Value = get(values, field2)

      if (field1Value !== field2Value) {
        matchErrorFieldsName.push(field2)
        errors[field2] = { code: 'UPDATE', value: message }
      }
    }
  }

  if (!issues) {
    return matchErrorFieldsName.length !== 0
  }

  for (const issue of issues) {
    const path = issue.path?.length === 0 ? (issue as any)?.keys : issue.path

    const name = path?.reduce(
      (p: any, c: any) => `${p}.${typeof c === 'number' ? `[${c}]` : c}`
    )
    const message = getFailureMessage(issue)

    if (name !== undefined && !matchErrorFieldsName.includes(name)) {
      errors[name] = { code: 'UPDATE', value: message }
      if (name === _name) {
        return true
      }
    }
  }

  if (_name) {
    return false
  }

  return true
}

import { ObjectType, ValitaError } from '@badrap/valita'
import get from './get'

const getFailureMessage = (failure: ValitaError['issues'][0]['code']) => {
  switch (failure) {
    case 'custom_error':
      return 'custom_error'
    case 'invalid_length':
      return 'Nombre de caractères invalide'
    case 'invalid_type':
      return 'Type invalide'
    case 'invalid_union':
      return 'Type invalide'
    case 'missing_value':
      return 'Champ requis'
    case 'unrecognized_keys':
      return 'Clé(s) inconnue(s)'
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
    if (error instanceof ValitaError) {
      console.log(error)

      issues = error.issues
    } else {
      console.error(error)
    }
  }

  if (!_name) {
    for (const [field1, field2, message] of _match) {
      const field1Value = get(values, field1)
      const field2Value = get(values, field2)

      if (field1Value !== field2Value) {
        errors[field2] = message
      }
    }
  }

  if (!issues) {
    return false
  }

  for (const issue of issues) {
    const name = issue?.path?.reduce(
      (p, c) => `${p}.${typeof c === 'number' ? `[${c}]` : c}`
    )
    const message = getFailureMessage(issue.code)

    if (name !== undefined) {
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

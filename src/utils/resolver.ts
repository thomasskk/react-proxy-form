import { ArrayType, ObjectType, ValitaError } from '@badrap/valita'

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
  schema: ObjectType | ArrayType,
  values: Record<string, any>,
  errors: any,
  _name?: string
) => {
  let issues: ValitaError['issues'] | undefined

  try {
    schema.parse(values)
  } catch (error: unknown) {
    if (error instanceof ValitaError) {
      issues = error.issues
    }
  }

  if (!issues) {
    return false
  }

  for (const issue of issues) {
    const path = issue.path?.length === 0 ? (issue as any)?.keys : issue.path

    const name = path?.reduce(
      (p: any, c: any) => `${p}.${typeof c === 'number' ? `[${c}]` : c}`
    )
    const message = getFailureMessage(issue)

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

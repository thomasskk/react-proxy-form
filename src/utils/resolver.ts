export const resolver = (
  schema: any,
  values: Record<string, any>,
  errors: any,
  _name?: string
) => {
  let issues: any

  try {
    schema.parse(values)
  } catch (error: any) {
    if (error) {
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

    const message = ''

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

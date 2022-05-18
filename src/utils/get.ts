import { dotPathReader } from './dotPathReader'

export const get = (object: any, path: string) => {
  if (typeof path != 'string') {
    return
  }
  return dotPathReader(path).reduce((acc, cv) => acc?.[cv], object)
}

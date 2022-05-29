import { dotPathReader } from './dotPathReader.js'

export const get = (object: any, path: string) => {
  if (!path) {
    return
  }
  return dotPathReader(path).reduce((acc, cv) => acc?.[cv], object)
}

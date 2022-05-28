import { dotPathReader } from './dotPathReader.js'

export const get = (object: any, path: string) => {
  return dotPathReader(path).reduce((acc, cv) => acc?.[cv], object)
}

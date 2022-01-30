import dotPathReader from './dotPathReader'

const get = (object: any, path: string) =>
  dotPathReader(path).reduce((acc, cv) => acc?.[cv], object)

export default get

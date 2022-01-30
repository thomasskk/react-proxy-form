
const dotPathReader = (path: string) => {
  const arrPath: (string | number)[] = path.split('.')

  for (const [i, v] of (arrPath as string[]).entries()) {
    if (v.charAt(0) === '[' && v.charAt(v.length - 1) === ']') {
      arrPath[i] = +v.slice(1, -1)
    }
  }

  return arrPath
}

export default dotPathReader

const enumToObject = (enumObj: any) => {
  const result = {}
  for (const key of Object.keys(enumObj)) {
    result[key] = enumObj[key]
  }
  return result
}



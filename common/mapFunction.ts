export const mapFunction = (value: string[], name: string) => { 
  return value.map(v => {
    return {
      [name]: v
    }
  })
}

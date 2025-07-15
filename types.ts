

export type DefinitionData = {
    definition: string
    synonyms?: string[]
    antonyms?: string[]
    phoneticText?: string
    pronunciationAudio?: string
    extrasFetched?: boolean
  }


  declare module "*.png" {
    const value: string
    export default value
  }
  declare module "*.jpg" {
    const value: string
    export default value
  }
  declare module "*.svg" {
    const value: string
    export default value
  }
  
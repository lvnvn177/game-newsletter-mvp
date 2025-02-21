export type BlockType = 'text' | 'image' | 'button'

export type BlockContent = {
  text?: string
  imageUrl?: string
  buttonText?: string
  buttonUrl?: string
  tempFile?: File
}

export interface EditorBlock {
  id: string
  type: BlockType
  content: BlockContent
  settings: BlockSettings
}

export interface BlockSettings {
  style?: React.CSSProperties
}

export interface Template {
  id: string
  name: string
  description: string
  blocks: EditorBlock[]
} 
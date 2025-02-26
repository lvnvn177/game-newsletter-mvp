export type BlockType = 'text' | 'image' | 'button' | 'audio'

export interface BlockContent {
  text?: string
  imageUrl?: string
  buttonText?: string
  buttonUrl?: string
  audioUrl?: string
  audioTitle?: string
  tempFile?: File
}

export interface BlockSettings {
  layout?: string
  style?: {
    width?: number | string
    height?: number | string
    objectPosition?: string
    [key: string]: string | number | undefined
  }
}

export interface Block {
  id: string
  type: BlockType
  content: BlockContent
  settings: BlockSettings
}

export type EditorBlock = Block

export interface Template {
  id: string
  name: string
  description: string
  blocks: Block[]
}

interface TextBlockContent {
  text?: string;
} 
export type BlockType = 'text' | 'image' | 'button'

export interface EditorBlock {
  id: string
  type: BlockType
  content: {
    text?: string
    imageUrl?: string
    buttonText?: string
    buttonUrl?: string
  }
  settings: {
    layout?: string
    style?: Record<string, string>
  }
}

export interface Template {
  id: string
  name: string
  description: string
  blocks: EditorBlock[]
} 
export class EditorHistory {
  private history: any[][] = []
  private currentIndex: number = -1

  push(state: any[]) {
    this.currentIndex++
    this.history = this.history.slice(0, this.currentIndex)
    this.history.push(JSON.parse(JSON.stringify(state)))
  }

  undo(): any[] | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return JSON.parse(JSON.stringify(this.history[this.currentIndex]))
    }
    return null
  }

  redo(): any[] | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return JSON.parse(JSON.stringify(this.history[this.currentIndex]))
    }
    return null
  }
} 
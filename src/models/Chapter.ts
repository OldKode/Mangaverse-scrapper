export interface Chapter {
    mangaId: string
    chapterNumber: number
    title: string
    uploadDate:Date
    uploader: string
    link: string
    pages?: Buffer[]
}
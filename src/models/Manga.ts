export interface Manga{
    id: string
    title: string
    author?: string
    artist?: string
    genres?: string[]
    status?: string
    summary?: string
    rating?: number
    publishDate?: Date
    coverImage?: string
    updateAt: Date
    numberChapters: number
    url: string
    site: string
    uploader?: string
    language?: string
}
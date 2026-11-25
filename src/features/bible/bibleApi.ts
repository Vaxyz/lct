
import { baseApi } from '../../app/baseApi'

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  timestamp?: string
}
//take a new commit

export type BibleTranslation = {
  code: string
  name: string
  languageCode: string
  providerType: string
  attribution?: string
  licenceName?: string
  licenceUrl?: string
  contentAvailable: boolean
}

export type BibleBook = {
  code: string
  name: string
  testament: 'OLD' | 'NEW'
  canonicalOrder: number
  chapterCount: number
}

export type BibleVerse = {
  translation: string
  bookCode: string
  book: string
  chapter: number
  verse: number
  text: string
}

export type BibleBookmark = {
  id: string
  translation: string
  bookCode: string
  book: string
  chapter: number
  verse?: number
  note?: string
  createdAt: string
}

export type BibleProgress = {
  translation: string
  bookCode: string
  book: string
  chapter: number
  verse?: number
  updatedAt?: string
}

type RawObject = Record<string, unknown>

function field(
  object: RawObject,
  camelCase: string,
  lowerCase: string = camelCase.toLowerCase(),
): unknown {
  return object[camelCase] ?? object[lowerCase]
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true'
}

function normalizeTranslation(value: RawObject): BibleTranslation {
  return {
    code: asString(field(value, 'code')),
    name: asString(field(value, 'name')),
    languageCode: asString(field(value, 'languageCode')),
    providerType: asString(field(value, 'providerType')),
    attribution: asString(field(value, 'attribution')) || undefined,
    licenceName: asString(field(value, 'licenceName')) || undefined,
    licenceUrl: asString(field(value, 'licenceUrl')) || undefined,
    contentAvailable: asBoolean(field(value, 'contentAvailable')),
  }
}

function normalizeBook(value: RawObject): BibleBook {
  const testament = asString(field(value, 'testament'))

  return {
    code: asString(field(value, 'code')),
    name: asString(field(value, 'name')),
    testament: testament === 'NEW' ? 'NEW' : 'OLD',
    canonicalOrder: asNumber(field(value, 'canonicalOrder')),
    chapterCount: asNumber(field(value, 'chapterCount')),
  }
}

function normalizeVerse(value: RawObject): BibleVerse {
  return {
    translation: asString(field(value, 'translation')),
    bookCode: asString(field(value, 'bookCode')),
    book: asString(field(value, 'book')),
    chapter: asNumber(field(value, 'chapter')),
    verse: asNumber(field(value, 'verse')),
    text: asString(field(value, 'text')),
  }
}

function normalizeBookmark(value: RawObject): BibleBookmark {
  const verse = field(value, 'verse')
  const note = field(value, 'note')

  return {
    id: asString(field(value, 'id')),
    translation: asString(field(value, 'translation')),
    bookCode: asString(field(value, 'bookCode')),
    book: asString(field(value, 'book')),
    chapter: asNumber(field(value, 'chapter')),
    ...(verse != null ? { verse: asNumber(verse) } : {}),
    ...(typeof note === 'string' ? { note } : {}),
    createdAt: asString(field(value, 'createdAt')),
  }
}

function normalizeArray<T>(
  response: ApiEnvelope<RawObject[]>,
  normalize: (value: RawObject) => T,
): T[] {
  return Array.isArray(response.data)
    ? response.data.map(normalize)
    : []
}

export const bibleApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getBibleTranslations: build.query<BibleTranslation[], void>({
      query: () => '/v1/bible/translations',
      transformResponse: (response: ApiEnvelope<RawObject[]>) =>
        normalizeArray(response, normalizeTranslation),
      providesTags: ['Bible'],
    }),

    getBibleBooks: build.query<BibleBook[], string | void>({
      query: testament => ({
        url: '/v1/bible/books',
        params: testament ? { testament } : {},
      }),
      transformResponse: (response: ApiEnvelope<RawObject[]>) =>
        normalizeArray(response, normalizeBook),
      providesTags: ['Bible'],
    }),

    getBiblePassage: build.query<
      BibleVerse[],
      { translation: string; book: string; chapter: number }
    >({
      query: params => ({
        url: '/v1/bible/passages',
        params,
      }),
      transformResponse: (response: ApiEnvelope<RawObject[]>) =>
        normalizeArray(response, normalizeVerse),
    }),

    searchBible: build.query<
      BibleVerse[],
      { translation: string; q: string }
    >({
      query: params => ({
        url: '/v1/bible/search',
        params,
      }),
      transformResponse: (response: ApiEnvelope<RawObject[]>) =>
        normalizeArray(response, normalizeVerse),
    }),

    getBibleBookmarks: build.query<BibleBookmark[], void>({
      query: () => '/v1/bible/bookmarks',
      transformResponse: (response: ApiEnvelope<RawObject[]>) =>
        normalizeArray(response, normalizeBookmark),
      providesTags: ['Bible'],
    }),

    addBibleBookmark: build.mutation<
      unknown,
      {
        translation: string
        book: string
        chapter: number
        verse?: number
        note?: string
      }
    >({
      query: body => ({
        url: '/v1/bible/bookmarks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Bible'],
    }),

    deleteBibleBookmark: build.mutation<unknown, string>({
      query: id => ({
        url: `/v1/bible/bookmarks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bible'],
    }),

  getBibleProgress: build.query<BibleProgress | null, void>({
  query: () => '/v1/bible/progress',
  transformResponse: (
    response: ApiEnvelope<Record<string, unknown>>,
  ): BibleProgress | null => {
    const data = response.data

    if (!data || !data.bookCode && !data.bookcode) {
      return null
    }

    return {
      translation: String(data.translation ?? ''),
      bookCode: String(data.bookCode ?? data.bookcode ?? ''),
      book: String(data.book ?? ''),
      chapter: Number(data.chapter ?? 0),
      ...(data.verse != null ? { verse: Number(data.verse) } : {}),
      ...(data.updatedAt != null || data.updatedat != null
        ? { updatedAt: String(data.updatedAt ?? data.updatedat) }
        : {}),
    }
  },
}),

    saveBibleProgress: build.mutation<
      unknown,
      {
        translation: string
        book: string
        chapter: number
        verse?: number
      }
    >({
      query: body => ({
        url: '/v1/bible/progress',
        method: 'PUT',
        body,
      }),
    }),
  }),
})

export const {
  useGetBibleTranslationsQuery,
  useGetBibleBooksQuery,
  useGetBiblePassageQuery,
  useLazySearchBibleQuery,
  useGetBibleBookmarksQuery,
  useAddBibleBookmarkMutation,
  useDeleteBibleBookmarkMutation,
  useGetBibleProgressQuery,
  useSaveBibleProgressMutation,
} = bibleApi

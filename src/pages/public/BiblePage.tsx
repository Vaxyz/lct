import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  Bookmark,
  Search,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Trash2,
} from 'lucide-react'
import {
  useAddBibleBookmarkMutation,
  useGetBibleBooksQuery,
  useGetBibleTranslationsQuery,
  useLazySearchBibleQuery,
  useGetBiblePassageQuery,
  useSaveBibleProgressMutation,
  useGetBibleBookmarksQuery,
  useDeleteBibleBookmarkMutation,
  useGetBibleProgressQuery,
} from '../../features/bible/bibleApi'

const NEW_TESTAMENT_CODES = new Set([
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM',
  '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
  '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM',
  'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN',
  '3JN', 'JUD', 'REV',
])

export function BiblePage() {
  const [translation, setTranslation] = useState('WEB')
  const [testament, setTestament] = useState<'OLD' | 'NEW'>('OLD')
  const [book, setBook] = useState('GEN')
  const [chapter, setChapter] = useState(1)
  const [query, setQuery] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null)
  const [pendingVerse, setPendingVerse] = useState<number | null>(null)
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const { data: translations = [], isLoading: translationsLoading } =
    useGetBibleTranslationsQuery()
  const { data: allBooks = [] } = useGetBibleBooksQuery()
  const books = useMemo(
    () => allBooks.filter(item => item.testament === testament).sort((a, b) => a.canonicalOrder - b.canonicalOrder),
    [allBooks, testament],
  )
  const selectedBook = useMemo(
    () => allBooks.find(item => item.code === book),
    [allBooks, book],
  )

  const {
    currentData: verses = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetBiblePassageQuery(
    { translation, book, chapter },
    { skip: searchMode },
  )

  const [searchBible, searchState] = useLazySearchBibleQuery()
  const [addBookmark] = useAddBibleBookmarkMutation()
  const [saveProgress, saveProgressState] = useSaveBibleProgressMutation()
  const [deleteBookmark, deleteBookmarkState] =
    useDeleteBibleBookmarkMutation()

  const isSignedIn = Boolean(localStorage.getItem('lct_access_token'))

  const {
    data: bookmarks = [],
    isLoading: bookmarksLoading,
    isError: bookmarksError,
  } = useGetBibleBookmarksQuery(undefined, { skip: !isSignedIn })

  const {
    data: readingProgress,
    isLoading: progressLoading,
    isError: progressError,
  } = useGetBibleProgressQuery(undefined, { skip: !isSignedIn })

  const searchResults = searchState.data ?? []

  useEffect(() => {
    if (pendingVerse == null || isLoading || isFetching || !verses.length) return
    const target = verseRefs.current[pendingVerse]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedVerse(pendingVerse)
    }
    setPendingVerse(null)
  }, [pendingVerse, verses, isLoading, isFetching])

  const chooseTestament = (value: 'OLD' | 'NEW') => {
    setTestament(value)
    setBook(value === 'OLD' ? 'GEN' : 'MAT')
    setChapter(1)
    setSearchMode(false)
    setFeedback('')
    setHighlightedVerse(null)
    setPendingVerse(null)
  }

  const moveChapter = (delta: number) => {
    if (!selectedBook || !allBooks.length) return
    const nextChapter = chapter + delta
    let nextBook = selectedBook
    let next = nextChapter
    if (nextChapter > selectedBook.chapterCount) {
      const index = allBooks.findIndex(item => item.code === selectedBook.code)
      nextBook = allBooks[index + 1] ?? selectedBook
      next = nextBook === selectedBook ? chapter : 1
    } else if (nextChapter < 1) {
      const index = allBooks.findIndex(item => item.code === selectedBook.code)
      nextBook = allBooks[index - 1] ?? selectedBook
      next = nextBook === selectedBook ? 1 : nextBook.chapterCount
    }
    if (nextBook.code === book && next === chapter) return
    setBook(nextBook.code)
    setTestament(nextBook.testament)
    setChapter(next)
    setSearchMode(false)
    setFeedback('')
    setHighlightedVerse(null)
    setPendingVerse(null)
    if (isSignedIn) void saveProgress({ translation, book: nextBook.code, chapter: next })
  }

  const runSearch = async () => {
    const term = query.trim()
    if (term.length < 2) {
      setFeedback('Enter at least two characters to search the Bible.')
      return
    }
    setFeedback('')
    setSearchMode(true)
    await searchBible({ translation, q: term })
  }

  const openReference = (
    referenceBookCode: string,
    referenceChapter: number,
    referenceTranslation = translation,
  ) => {
    setTranslation(referenceTranslation)
    setTestament(
      NEW_TESTAMENT_CODES.has(referenceBookCode) ? 'NEW' : 'OLD',
    )
    setBook(referenceBookCode)
    setChapter(referenceChapter)
    setSearchMode(false)
    setFeedback('')
    setHighlightedVerse(null)
    setPendingVerse(null)
  }

  const resumeReading = () => {
    if (!readingProgress?.bookCode || !readingProgress.chapter) return
    openReference(
      readingProgress.bookCode,
      readingProgress.chapter,
      readingProgress.translation || translation,
    )
    if (readingProgress.verse != null) setPendingVerse(readingProgress.verse)
  }

  const handleBookmark = async (
    verseNumber: number,
    verseBook: string,
    verseChapter: number,
  ) => {
    setFeedback('')
    try {
      await addBookmark({
        translation,
        book: verseBook,
        chapter: verseChapter,
        verse: verseNumber,
      }).unwrap()
      setFeedback(`Bookmark saved: ${verseBook} ${verseChapter}:${verseNumber}.`)
    } catch {
      setFeedback('The bookmark could not be saved. Please try again.')
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    setFeedback('')
    try {
      await deleteBookmark(id).unwrap()
      setFeedback('Bookmark removed.')
    } catch {
      setFeedback('The bookmark could not be removed. Please try again.')
    }
  }

  const handleSaveProgress = async () => {
    setFeedback('')
    try {
      await saveProgress({ translation, book, chapter, ...(highlightedVerse != null ? { verse: highlightedVerse } : {}) }).unwrap()
      setFeedback(`Reading progress saved: ${selectedBook?.name ?? book} ${chapter}.`)
    } catch {
      setFeedback('Reading progress could not be saved. Please try again.')
    }
  }

  return (
    <div className="min-h-[75vh] bg-gradient-to-b from-purple-50 to-white">
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 p-7 text-white md:p-10">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-purple-200">
            <BookOpen size={17} />
            LCT Bible
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
            Make room for the Word.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100 md:text-base">
            Read Scripture, explore the books of the Bible, and return to your
            reading journey whenever you are ready.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Translation
            </label>
            <select
              className="mb-5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
              value={translation}
              onChange={event => setTranslation(event.target.value)}
              disabled={translationsLoading}
            >
              {translations.map(item => (
                <option key={item.code} value={item.code}>
                  {item.name}
                  {item.contentAvailable ? '' : ' (content not loaded)'}
                </option>
              ))}
            </select>

            <div className="mb-3 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => chooseTestament('OLD')}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${
                  testament === 'OLD'
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Old Testament
              </button>
              <button
                type="button"
                onClick={() => chooseTestament('NEW')}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${
                  testament === 'NEW'
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                New Testament
              </button>
            </div>

            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Choose a book
            </label>
            <div className="max-h-[440px] space-y-1 overflow-y-auto">
              {books.map(item => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => {
                    setBook(item.code)
                    setChapter(1)
                    setSearchMode(false)
                    setFeedback('')
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                    book === item.code
                      ? 'bg-purple-50 font-bold text-purple-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-slate-400">
                    {item.chapterCount}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <main className="min-w-0 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm md:p-8">
            <form
              className="mb-6 flex gap-2"
              onSubmit={event => {
                event.preventDefault()
                void runSearch()
              }}
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search Bible text"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-purple-800 px-4 py-3 text-sm font-bold text-white hover:bg-purple-900"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode(false)
                  setFeedback('')
                }}
                className="rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600"
              >
                Read
              </button>
            </form>

            {feedback && (
              <p
                role="status"
                aria-live="polite"
                className={`mb-5 rounded-xl p-3 text-sm ${
                  /could not|Enter at least/i.test(feedback)
                    ? 'bg-amber-50 text-amber-900'
                    : 'bg-green-50 text-green-800'
                }`}
              >
                {feedback}
              </p>
            )}

            {searchMode ? (
              <div>
                <h2 className="mb-4 text-xl font-extrabold text-slate-900">
                  Search results
                </h2>
                {searchState.isFetching ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                    <LoaderCircle className="animate-spin" />
                    Searching Scripture...
                  </div>
                ) : searchState.isError ? (
                  <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-800">
                    Search failed. Please try again.
                  </p>
                ) : searchResults.length ? (
                  <div className="space-y-3">
                    {searchResults.map((verse, index) => (
                      <button
                        type="button"
                        key={`${verse.bookCode}-${verse.chapter}-${verse.verse}-${index}`}
                        onClick={() =>
                          openReference(verse.bookCode, verse.chapter, verse.translation)
                        }
                        className="block w-full rounded-xl border border-slate-100 p-4 text-left hover:border-purple-200 hover:bg-purple-50"
                      >
                        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-purple-800">
                          {verse.book} {verse.chapter}:{verse.verse}
                        </div>
                        <p className="text-sm leading-6 text-slate-700">
                          {verse.text}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                    No results found for this search.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.15em] text-purple-700">
                      Holy Scripture
                    </div>
                    <h2 className="mt-1 text-3xl font-black text-slate-900">
                      {selectedBook?.name ?? book}{' '}
                      <span className="text-purple-800">{chapter}</span>
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {translations.find(item => item.code === translation)?.name ??
                        translation}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isSignedIn && readingProgress?.bookCode && (
                      <button
                        type="button"
                        onClick={resumeReading}
                        disabled={progressLoading}
                        className="rounded-xl bg-purple-50 px-4 py-3 text-sm font-bold text-purple-900 hover:bg-purple-100 disabled:opacity-50"
                      >
                        {progressLoading
                          ? 'Loading progress...'
                          : `Resume ${readingProgress.book} ${readingProgress.chapter}`}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => moveChapter(-1)}
                      disabled={chapter <= 1 && allBooks.findIndex(item => item.code === book) <= 0}
                      aria-label="Previous chapter or book"
                      className="rounded-xl border border-slate-200 p-3 disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveChapter(1)}
                      disabled={!selectedBook || (chapter >= selectedBook.chapterCount && allBooks.findIndex(item => item.code === book) >= allBooks.length - 1)}
                      aria-label="Next chapter or book"
                      className="rounded-xl border border-slate-200 p-3 disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {!isLoading && !isFetching && verses.length > 0 && (
                  <div className="mt-5 mb-2" aria-label={`Chapter contains ${verses.length} verses`}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Position in chapter</span>
                      <span>{highlightedVerse != null ? `Verse ${highlightedVerse} of ${verses.length}` : `${verses.length} verses`}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-purple-100">
                      <div className="h-full rounded-full bg-purple-700 transition-all" style={{ width: `${highlightedVerse != null ? (highlightedVerse / verses.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                )}

                {isLoading || isFetching ? (
                  <div
                    className="flex items-center gap-2 py-12 text-sm text-slate-500"
                    role="status"
                    aria-live="polite"
                  >
                    <LoaderCircle className="animate-spin" />
                    Loading passage...
                  </div>
                ) : error ? (
                  <div className="my-8 rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
                    <h3 className="font-bold text-red-950">
                      Unable to load this passage
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-red-900">
                      The Bible service could not return this passage. Please
                      check your connection and try again.
                    </p>
                    <button
                      type="button"
                      onClick={() => void refetch()}
                      className="mt-4 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-900"
                    >
                      Try again
                    </button>
                  </div>
                ) : verses.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {verses.map(verse => (
                      <div
                        key={`${verse.chapter}-${verse.verse}`}
                        ref={element => { verseRefs.current[verse.verse] = element }}
                        className={`group flex gap-4 rounded-xl px-3 py-4 transition-colors duration-500 ${highlightedVerse === verse.verse ? 'bg-amber-100 ring-2 ring-amber-300' : 'hover:bg-purple-50/60'}`}
                        aria-current={highlightedVerse === verse.verse ? 'location' : undefined}
                      >
                        <span className={`pt-1 text-xs font-extrabold ${highlightedVerse === verse.verse ? 'text-amber-900' : 'text-purple-700'}`}>
                          {verse.verse}
                        </span>
                        <p className={`flex-1 font-serif text-lg leading-8 ${highlightedVerse === verse.verse ? 'text-slate-950' : 'text-slate-700'}`}>
                          {verse.text}
                        </p>
                        {isSignedIn && (
                          <button
                            type="button"
                            title="Bookmark verse"
                            aria-label={`Bookmark ${verse.book} ${verse.chapter}:${verse.verse}`}
                            onClick={() =>
                              void handleBookmark(verse.verse, book, chapter)
                            }
                            className="self-start rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-800"
                          >
                            <Bookmark size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="my-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <h3 className="font-bold text-amber-950">
                      No verse text available
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-amber-900">
                      No verse text was returned for this passage in the selected
                      translation. Some source editions contain textual variants
                      or footnotes in place of verse text. No Scripture text has
                      been invented.
                    </p>
                  </div>
                )}

                {isSignedIn && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => void handleSaveProgress()}
                      disabled={saveProgressState.isLoading}
                      className="rounded-xl bg-purple-800 px-4 py-3 text-sm font-bold text-white hover:bg-purple-900 disabled:opacity-50"
                    >
                      {saveProgressState.isLoading
                        ? 'Saving progress...'
                        : 'Save reading progress'}
                    </button>
                    {progressError && (
                      <p className="mt-2 text-sm text-amber-800">
                        Saved reading progress could not be loaded.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {isSignedIn && (
          <section className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  My Bible Bookmarks
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your saved Scripture references.
                </p>
              </div>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-900">
                {bookmarks.length} saved
              </span>
            </div>

            {bookmarksLoading ? (
              <p className="py-6 text-sm text-slate-500">
                Loading your bookmarks...
              </p>
            ) : bookmarksError ? (
              <p role="alert" className="py-6 text-sm text-red-700">
                Your bookmarks could not be loaded. Please refresh and try again.
              </p>
            ) : bookmarks.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">
                No bookmarks yet. Use the bookmark icon beside a verse to save it.
              </p>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {bookmarks.map(item => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <button
                      type="button"
                      className="text-left"
                      onClick={() =>
                        {
                          openReference(item.bookCode, item.chapter, item.translation)
                          if (item.verse != null) setPendingVerse(item.verse)
                        }
                      }
                    >
                      <span className="block font-bold text-purple-900">
                        {item.book} {item.chapter}
                        {item.verse != null ? `:${item.verse}` : ''}
                      </span>
                      {item.note && (
                        <span className="mt-1 block text-sm text-slate-500">
                          {item.note}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={deleteBookmarkState.isLoading}
                      onClick={() => void handleDeleteBookmark(item.id)}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </div>
  )
}

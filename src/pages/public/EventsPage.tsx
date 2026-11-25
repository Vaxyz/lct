import { Link } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Pagination } from '../../components/ui/Pagination'
import { useEventCategoriesQuery, useEventsQuery } from '../../features/events/eventsApi'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}
function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function monthTitle(date: Date) {
  return new Intl.DateTimeFormat('en-NG', { month: 'long', year: 'numeric' }).format(date)
}
function timeLabel(value: string) {
  return new Intl.DateTimeFormat('en-NG', { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export function EventsPage() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(() => dayKey(new Date()))
  const pageSize = 6
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useEventCategoriesQuery()
  const { data = [], isLoading, isError } = useEventsQuery({ q: q || undefined, category: category || undefined })

  const monthDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const startOffset = (first.getDay() + 6) % 7 // Monday-first calendar
    const count = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
    const cells: Array<Date | null> = Array.from({ length: startOffset }, () => null)
    for (let day = 1; day <= count; day++) cells.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [visibleMonth])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof data>()
    data.forEach(event => {
      const key = dayKey(new Date(event.startAt))
      map.set(key, [...(map.get(key) ?? []), event])
    })
    map.forEach(events => events.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()))
    return map
  }, [data])
  const selectedEvents = eventsByDate.get(selectedDate) ?? []
  const monthEventCount = monthDays.reduce((count, day) => count + (day ? (eventsByDate.get(dayKey(day))?.length ?? 0) : 0), 0)

  function changeMonth(amount: number) {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1)
    setVisibleMonth(next)
    setSelectedDate(dayKey(next))
  }

  return <main className="page">
    <section className="hero compact"><span className="eyebrow"><CalendarDays size={16} /> EVENTS & COMMUNITY</span><h1>Gather. Connect. Experience.</h1><p>Discover worship services, special programs, conferences, youth gatherings and church-wide moments.</p></section>
    <div className="event-tools"><label className="search"><Search size={18} /><input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="Search events..." /></label><label className="event-category-filter"><span className="sr-only">Filter events by category</span><select aria-label="Filter events by category" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}><option value="">All categories</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>{categoriesError && <span className="filter-hint">Category filters may be incomplete.</span>}{categoriesLoading && <span className="filter-hint">Loading categories…</span>}</label></div>

    <section className="event-calendar" aria-label="Interactive event calendar">
      <div className="event-calendar-header"><div><span className="eyebrow">PLAN YOUR VISIT</span><h2>{monthTitle(visibleMonth)}</h2><p>{monthEventCount} {monthEventCount === 1 ? 'event' : 'events'} this month</p></div><div className="calendar-controls"><button type="button" className="button secondary calendar-nav" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={18} /> <span>Previous</span></button><button type="button" className="button secondary calendar-nav" aria-label="Next month" onClick={() => changeMonth(1)}><span>Next</span> <ChevronRight size={18} /></button></div></div>
      <div className="calendar-weekdays" aria-hidden="true">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar-days">{monthDays.map((day, index) => {
        if (!day) return <div className="calendar-day calendar-day--blank" key={`blank-${index}`} aria-hidden="true" />
        const key = dayKey(day)
        const dayEvents = eventsByDate.get(key) ?? []
        const isSelected = selectedDate === key
        const isToday = key === dayKey(new Date())
        return <button type="button" className={`calendar-day${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}${dayEvents.length ? ' has-events' : ''}`} key={key} onClick={() => setSelectedDate(key)} aria-pressed={isSelected} aria-label={`${day.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}${dayEvents.length ? `, ${dayEvents.length} events` : ''}`}>
          <span className="calendar-day-number">{day.getDate()}</span>{dayEvents.length > 0 && <span className="calendar-event-dots" aria-hidden="true">{dayEvents.slice(0, 3).map(event => <i key={event.id} />)}{dayEvents.length > 3 && <small>+{dayEvents.length - 3}</small>}</span>}
          {dayEvents.length > 0 && <span className="calendar-day-count">{dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}</span>}
        </button>
      })}</div>
      <div className="calendar-agenda"><div className="calendar-agenda-title"><CalendarDays size={19} /><h3>{new Intl.DateTimeFormat('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${selectedDate}T12:00:00`))}</h3></div>
        {isLoading ? <p className="calendar-message">Loading events…</p> : isError ? <p className="calendar-message error">Unable to load events. Please try again.</p> : selectedEvents.length === 0 ? <p className="calendar-message">No events scheduled for this date. Choose another day to explore the calendar.</p> : <div className="calendar-agenda-list">{selectedEvents.map(event => <Link to={`/events/${event.slug}`} className="calendar-agenda-event" key={event.id}><span className="agenda-time">{timeLabel(event.startAt)}</span><span className="agenda-event-info"><strong>{event.title}</strong><small>{event.category || 'Church Event'}{event.venue ? ` · ${event.venue}` : ''}</small></span><ChevronRight size={18} /></Link>)}</div>}
      </div>
    </section>

    <div className="section-heading event-list-heading"><div><span className="eyebrow">ALL GATHERINGS</span><h2>Upcoming events</h2></div></div>
    {isLoading ? <div className="empty">Loading upcoming events...</div> : isError ? <div className="empty error">Unable to load events.</div> : data.length === 0 ? <div className="empty"><CalendarDays size={30} /><h3>No upcoming events</h3><p>Check back soon for the next LifeChanger Touch gathering.</p></div> : <div className="event-grid">{data.slice((page - 1) * pageSize, page * pageSize).map(e => <Link className="event-card" to={`/events/${e.slug}`} key={e.id}><div className="event-cover" style={e.coverImageUrl ? { backgroundImage: `url(${e.coverImageUrl})` } : undefined}><span>{e.category || 'Church Event'}</span></div><div className="card-body"><div className="event-date">{formatDate(e.startAt)}</div><h3>{e.title}</h3><p>{e.description || 'Join us for a meaningful time of worship, connection and community.'}</p><div className="event-meta">{e.venue && <span><MapPin size={15} />{e.venue}</span>}{e.registrationRequired && <span><Users size={15} />{e.capacity ? `${e.registeredCount}/${e.capacity} registered` : `${e.registeredCount} registered`}</span>}</div></div></Link>)}</div>}
    {!isLoading && !isError && <Pagination page={page} pageSize={pageSize} totalItems={data.length} onPageChange={setPage} label="events" />}
  </main>
}

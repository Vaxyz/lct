import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  PlayCircle,
  Sparkles,
  BookOpen,
  Radio,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetPublicChurchQuery } from "../../features/church/churchApi";
import { useFeaturedEventsQuery } from "../../features/events/eventsApi";
import { useSermonsQuery } from "../../features/media/mediaApi";

export function HomePage() {
  const { data } = useGetPublicChurchQuery();
  const church = data?.data;
  const { data: featuredEvents = [] } = useFeaturedEventsQuery();
  const { data: latestSermons = [], isLoading: sermonsLoading } = useSermonsQuery();
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 text-white">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-yellow-400/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-32">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-100">
              <Sparkles size={14} />{" "}
              {church?.name ?? "LifeChanger Touch Church"}
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
              Experience God's Presence.
              <span className="block text-yellow-300">Anywhere. Anytime.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-purple-100">
              Watch services, discover powerful messages, connect with our
              community and grow in faith.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/church-tv"
                className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-purple-950 shadow-lg transition hover:bg-yellow-300"
              >
                <PlayCircle size={18} className="mr-2" /> Watch Live
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15"
              >
                Explore the platform <ArrowRight size={17} className="ml-2" />
              </Link>
            </div>
          </div>
          <div className="relative hidden min-h-[430px] lg:block">
            <div className="absolute inset-10 rounded-[2.5rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex h-full flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-700 to-slate-950 p-7">
                <div className="mb-auto flex items-center justify-between">
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black uppercase">
                    Live
                  </span>
                  <span className="text-xs text-purple-100">Church TV</span>
                </div>
                <div>
                  <p className="text-sm text-purple-200">
                    Sunday Worship Experience
                  </p>
                  <h2 className="mt-2 text-3xl font-black">Join us live.</h2>
                  <div className="mt-5 h-1.5 w-full rounded-full bg-white/15">
                    <div className="h-full w-2/3 rounded-full bg-yellow-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><span className="text-sm font-black uppercase tracking-[0.2em] text-purple-700">Discover LCT</span><h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">Worship, grow and connect.</h2><p className="mt-3 max-w-2xl text-slate-600">Explore the experiences available to you, wherever you are.</p></div>
            <span className="text-sm font-semibold text-slate-500">Swipe to explore →</span>
          </div>
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5">
            {[
              {title:'Church TV',text:'Join worship and church broadcasts online.',to:'/church-tv',image:'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=85'},
              {title:'Events & gatherings',text:'Find upcoming services, conferences and community events.',to:'/events',image:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85'},
              {title:'Bible & devotionals',text:'Spend time in Scripture and grow your daily faith rhythm.',to:'/bible',image:'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=85'},
              {title:'Sermons & teaching',text:'Return to messages and study the Word at your pace.',to:'/sermons',image:'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=85'},
              {title:'Prayer & community',text:'Share prayer needs and stay connected with the church.',to:'/prayer',image:'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=85'},
            ].map(item=><Link key={item.title} to={item.to} className="group relative h-[340px] min-w-[260px] flex-1 snap-start overflow-hidden rounded-3xl bg-purple-950 shadow-lg md:min-w-[320px]">
              <img src={item.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-6 text-white"><h3 className="text-2xl font-black">{item.title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-white/85">{item.text}</p><span className="mt-4 inline-flex items-center font-bold text-yellow-300">Explore <ArrowRight size={16} className="ml-2"/></span></div>
            </Link>)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-purple-950 p-6 text-white md:grid-cols-2 md:p-10">
          <div><span className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">Watch and worship</span><h2 className="mt-3 text-3xl font-black md:text-4xl">Church life, wherever you are.</h2><p className="mt-4 leading-7 text-purple-100">Join live services and watch church video through LifeChanger Touch Church TV.</p><Link to="/church-tv" className="mt-6 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-extrabold text-purple-950">Open Church TV <ArrowRight size={17} className="ml-2"/></Link></div>
          <div className="aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black">
            {import.meta.env.VITE_HOME_CHURCH_VIDEO_URL ? <iframe className="h-full w-full" src={import.meta.env.VITE_HOME_CHURCH_VIDEO_URL} title="LifeChanger Touch church video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <Link to="/church-tv" className="group flex h-full flex-col items-center justify-center bg-gradient-to-br from-purple-800 to-slate-950 p-8 text-center"><PlayCircle size={58} className="text-yellow-300 transition group-hover:scale-110"/><span className="mt-4 text-xl font-black">Watch on Church TV</span><span className="mt-2 text-sm text-purple-100">Connect to the current live broadcast or available recordings.</span></Link>}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">To embed a featured church video on the homepage, set <code>VITE_HOME_CHURCH_VIDEO_URL</code> to an embeddable video URL. Church TV remains available independently.</p>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-purple-700">Latest messages</span>
            <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">Sermons to strengthen your faith.</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Catch up on the latest messages from LifeChanger Touch.</p>
          </div>
          <Link className="font-bold text-purple-800" to="/sermons">View all sermons <ArrowRight size={16} className="ml-1 inline" /></Link>
        </div>
        {sermonsLoading ? (
          <p className="text-slate-600">Loading latest sermons…</p>
        ) : latestSermons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 p-8 text-center">
            <BookOpen size={32} className="mx-auto text-purple-700" />
            <p className="mt-3 font-semibold text-slate-800">New sermons will appear here when published.</p>
            <p className="mt-1 text-sm text-slate-600">Visit the sermon library to explore available messages.</p>
            <Link to="/sermons" className="mt-4 inline-flex font-bold text-purple-800">Open sermon library <ArrowRight size={16} className="ml-1" /></Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestSermons.slice(0, 3).map((sermon) => (
              <Link key={sermon.id} to={`/sermons/${sermon.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                {sermon.thumbnailUrl ? <img src={sermon.thumbnailUrl} alt="" loading="lazy" className="h-48 w-full object-cover" /> : <div className="grid h-48 place-items-center bg-gradient-to-br from-purple-900 to-slate-950 text-white"><PlayCircle size={48} /></div>}
                <div className="p-5">
                  {sermon.featured && <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700">Featured sermon</span>}
                  <h3 className="mt-1 text-xl font-black text-slate-950 group-hover:text-purple-800">{sermon.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{sermon.speaker}{sermon.topic ? ` · ${sermon.topic}` : ""}</p>
                  {sermon.bibleReferences && <p className="mt-2 text-sm font-semibold text-purple-800">{sermon.bibleReferences}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <span className="text-sm font-black uppercase tracking-[0.2em] text-purple-700">
            Explore LifeChanger Touch
          </span>
          <h2 className="mt-3 text-4xl font-black leading-tight text-slate-950 md:text-5xl">
            A church community that stays connected.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 md:text-xl">
            Worship with us, grow in the Word, find your next church gathering
            and take part in the work God is doing through our community.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: PlayCircle,
              title: "Church TV",
              text: "Join live worship and revisit recorded services and messages.",
              to: "/church-tv",
              cta: "Watch Church TV",
            },
            {
              icon: CalendarDays,
              title: "Events & gatherings",
              text: "Discover upcoming programs, view event details and register.",
              to: "/events",
              cta: "Explore events",
            },
            {
              icon: HeartHandshake,
              title: "Give with purpose",
              text: "Support ministry, missions and church projects through secure giving.",
              to: "/give",
              cta: "Give securely",
            },
            {
              icon: BookOpen,
              title: "Bible & devotionals",
              text: "Read Scripture, follow devotionals and build a consistent reading rhythm.",
              to: "/bible",
              cta: "Open the Bible",
            },
            {
              icon: Users,
              title: "Church community",
              text: "Stay connected through announcements, prayer and shared church life.",
              to: "/announcements",
              cta: "See announcements",
            },
            {
              icon: Radio,
              title: "Sermons & teaching",
              text: "Explore messages and teaching resources to strengthen your walk of faith.",
              to: "/sermons",
              cta: "Browse sermons",
            },
          ].map(({ icon: Icon, title, text, to, cta }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
            >
              <div className="mb-7 grid size-16 place-items-center rounded-2xl bg-purple-50 text-purple-800 transition group-hover:bg-purple-800 group-hover:text-white">
                <Icon size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 min-h-20 text-base leading-7 text-slate-600 md:text-lg">
                {text}
              </p>
              <span className="mt-7 inline-flex items-center text-base font-extrabold text-purple-800">
                {cta}
                <ArrowRight
                  className="ml-2 transition group-hover:translate-x-1"
                  size={18}
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-purple-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
              You belong here
            </p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Take your next step in faith.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-purple-100 md:text-lg">
              Join the LifeChanger Touch community and stay connected to
              worship, the Word and the life of the church.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex w-fit items-center rounded-xl bg-yellow-400 px-6 py-4 text-base font-black text-purple-950 transition hover:bg-yellow-300"
          >
            Join the community <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>
      {featuredEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">FEATURED EVENTS</span>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                What’s happening at LifeChanger Touch
              </h2>
            </div>
            <Link className="font-bold text-purple-800" to="/events">
              View all events →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.slice(0, 3).map((e) => (
              <Link
                to={`/events/${e.slug}`}
                key={e.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div
                  className="h-48 bg-cover bg-center bg-slate-100"
                  style={
                    e.coverImageUrl
                      ? { backgroundImage: `url(${e.coverImageUrl})` }
                      : undefined
                  }
                />
                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-wider text-purple-700">
                    {e.category || "Church Event"}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">
                    {e.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {new Date(e.startAt).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

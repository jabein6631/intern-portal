"use client"
import { useState, useEffect } from "react"
import InternSidebar from "../../../lib/internSidebar"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { api, getUser } from "../../../lib/api"

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

const BASE_EVENTS = {
  // Jan 2026
  "2026-0":{ 5:[{l:"Mentor Meeting",c:"#7C3AED"}], 8:[{l:"Task Deadline",c:"#ef4444"}], 12:[{l:"Journal Submit",c:"#06B6D4"}], 15:[{l:"Code Review",c:"#22c55e"}], 20:[{l:"Sprint Start",c:"#7C3AED"}], 25:[{l:"Report Submit",c:"#f59e0b"}], 28:[{l:"Presentation",c:"#ec4899"}] },
  // Feb 2026
  "2026-1":{ 3:[{l:"Task Deadline",c:"#ef4444"}], 7:[{l:"Mentor Meet",c:"#7C3AED"}], 10:[{l:"Journal Submit",c:"#06B6D4"}], 14:[{l:"Mid Review",c:"#f59e0b"}], 18:[{l:"Code Review",c:"#22c55e"}], 22:[{l:"Presentation",c:"#ec4899"}], 25:[{l:"Report Submit",c:"#7C3AED"}] },
  // Mar 2026
  "2026-2":{ 1:[{l:"Sprint Start",c:"#7C3AED"}], 5:[{l:"Task Assigned",c:"#06B6D4"}], 8:[{l:"Code Review",c:"#06B6D4"}], 12:[{l:"Mentor Meet",c:"#22c55e"}], 15:[{l:"Task Deadline",c:"#ef4444"}], 20:[{l:"Journal Due",c:"#f59e0b"}], 25:[{l:"Presentation",c:"#ec4899"}], 28:[{l:"Monthly Report",c:"#7C3AED"}] },
  // Apr 2026
  "2026-3":{ 2:[{l:"Mentor Meet",c:"#7C3AED"}], 5:[{l:"Sprint Start",c:"#06B6D4"}], 8:[{l:"Task Deadline",c:"#ef4444"}], 12:[{l:"Journal Submit",c:"#06B6D4"}], 15:[{l:"Code Review",c:"#22c55e"}], 18:[{l:"Mid Evaluation",c:"#f59e0b"}], 22:[{l:"Presentation",c:"#ec4899"}], 28:[{l:"Report Submit",c:"#7C3AED"}] },
  // May 2026
  "2026-4":{ 3:[{l:"Mentor Meeting",c:"#7C3AED"}], 6:[{l:"Task Deadline",c:"#ef4444"}], 8:[{l:"Journal Submit",c:"#06B6D4"}], 12:[{l:"Code Review",c:"#22c55e"}], 15:[{l:"Submission",c:"#f59e0b"}], 20:[{l:"Sprint Review",c:"#7C3AED"}], 22:[{l:"Report Submit",c:"#22c55e"}], 25:[{l:"Mentor Meet",c:"#06B6D4"}], 28:[{l:"Presentation",c:"#ec4899"}] },
  // Jun 2026
  "2026-5":{ 2:[{l:"Sprint Start",c:"#7C3AED"}], 5:[{l:"Task Deadline",c:"#ef4444"}], 8:[{l:"Journal Due",c:"#06B6D4"}], 12:[{l:"Deploy App",c:"#ec4899"}], 15:[{l:"Unit Testing",c:"#f59e0b"}], 20:[{l:"Mentor Meet",c:"#22c55e"}], 25:[{l:"Final Report",c:"#7C3AED"}] },
}

const UPCOMING = [
  {title:"Mentor Meeting",date:"May 3, 2025",time:"10:00 AM – 11:00 AM",color:"#7C3AED",type:"Meeting"},
  {title:"Task Deadline",date:"May 5, 2025",time:"11:59 PM",color:"#ef4444",type:"Deadline"},
  {title:"Journal Submission",date:"May 8, 2025",time:"10:00 AM",color:"#06B6D4",type:"Submission"},
  {title:"Code Review",date:"May 12, 2025",time:"2:00 PM",color:"#22c55e",type:"Review"},
  {title:"Mid Evaluation",date:"May 15, 2025",time:"12:00 PM",color:"#f59e0b",type:"Evaluation"},
]

export default function CalendarPage() {
  const now = new Date()
  const [view, setView] = useState("Month")
  const [year, setYear] = useState(2026)
  const [monthIdx, setMonthIdx] = useState(0) // Start at Jan 2026
  const [modal, setModal] = useState(false)
  const [allEvents, setAllEvents] = useState(BASE_EVENTS)
  const [upcoming, setUpcoming] = useState(UPCOMING)
  const [newEv, setNewEv] = useState({ title:"", date:"", time:"", color:"#7C3AED" })

  useEffect(() => {
    const user = getUser()
    api.getEvents(user.id).then(r=>{
      if(r.ok&&r.data?.length){
        const merged = { ...BASE_EVENTS }
        r.data.forEach(ev=>{
          const d = new Date(ev.date||ev.createdAt)
          const key = `${d.getFullYear()}-${d.getMonth()}`
          const day = d.getDate()
          if(!merged[key]) merged[key]={}
          if(!merged[key][day]) merged[key][day]=[]
          merged[key][day].push({ l:ev.title, c:ev.color||"#7C3AED" })
        })
        setAllEvents(merged)
      }
    }).catch(()=>{})
  },[])

  const days = new Date(year, monthIdx+1, 0).getDate()
  const startDay = new Date(year, monthIdx, 1).getDay()
  const cells = [...Array(startDay).fill(null), ...Array.from({length:days},(_,i)=>i+1)]
  const evKey = `${year}-${monthIdx}`
  const eventsForDay = (d) => allEvents[evKey]?.[d] || []

  const addEvent = async () => {
    if (!newEv.title||!newEv.date) return
    const user = getUser()
    await api.addEvent({ title:newEv.title, date:newEv.date, time:newEv.time, color:newEv.color, type:"Event", userId:user.id })
    const d = new Date(newEv.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const day = d.getDate()
    setAllEvents(p=>({ ...p, [key]:{ ...(p[key]||{}), [day]:[...(p[key]?.[day]||[]),{ l:newEv.title, c:newEv.color }] } }))
    setUpcoming(p=>[{ title:newEv.title, date:newEv.date, time:newEv.time, color:newEv.color, type:"Event" },...p])
    setModal(false); setNewEv({ title:"", date:"", time:"", color:"#7C3AED" })
  }

  const inp = "w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs outline-none text-white"

  return (
    <div className="h-screen w-screen overflow-hidden text-white flex relative">

  {/* VIDEO BACKGROUND */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover z-0"
  >
    <source src="data:video/mp4;base64," type="video/mp4" />
  </video>

  {/* DARK OVERLAY */}
  <div className="absolute inset-0 bg-black/65 z-0"></div>

  {/* CONTENT */}
  <div className="relative z-10 flex w-full h-full">
      <InternSidebar active="Calendar"/>
      <main className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-gray-400 text-xs mt-0.5">Track your schedule, deadlines and important events.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-xl p-0.5 gap-0.5">
              {["Month","Week","List"].map(v=>(
                <button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${view===v?"bg-gradient-to-r from-cyan-500 to-purple-600 text-white":"text-gray-400 hover:text-white"}`}>{v}</button>
              ))}
            </div>
            <button onClick={()=>setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-semibold">
              <Plus size={14}/> Add Event
            </button>
          </div>
        </div>

        <div className="flex gap-3 flex-1 overflow-hidden min-h-0">
          {/* CALENDAR GRID */}
          <div className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button onClick={()=>{ if(monthIdx===0){setMonthIdx(11);setYear(y=>y-1)}else setMonthIdx(m=>m-1) }} className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center"><ChevronLeft size={13}/></button>
                <span className="text-sm font-bold">{MONTHS[monthIdx]} {year}</span>
                <button onClick={()=>{ if(monthIdx===11){setMonthIdx(0);setYear(y=>y+1)}else setMonthIdx(m=>m+1) }} className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center"><ChevronRight size={13}/></button>
              </div>
            </div>

            {/* MONTH VIEW */}
            {view==="Month" && (
              <>
                <div className="grid grid-cols-7 gap-0 mb-0 border-b border-[#1e293b]/30">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="text-center text-[10px] text-gray-500 py-2 font-medium">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-0 flex-1 overflow-y-auto">
                  {cells.map((day,i)=>{
                    if(!day) return <div key={i} className="border-b border-r border-[#1e293b]/30 min-h-[55px]"/>
                    const isToday = day===now.getDate()&&monthIdx===now.getMonth()&&year===now.getFullYear()
                    const evs = eventsForDay(day)
                    return (
                      <div key={i} className={`border-b border-r border-[#1e293b]/30 p-1 min-h-[55px] cursor-pointer transition hover:bg-[#111827]/50 ${isToday?"bg-purple-600/10":""}`}>
                        <span className={`text-xs block mb-0.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${isToday?"bg-purple-600 text-white font-bold":"text-gray-300"}`}>{day}</span>
                        {evs.slice(0,2).map((ev,j)=>(
                          <div key={j} className="text-[8px] rounded px-1 py-0.5 mb-0.5 truncate text-white font-medium" style={{ background:ev.c+"cc" }}>{ev.l}</div>
                        ))}
                        {evs.length>2 && <div className="text-[8px] text-gray-500">+{evs.length-2}</div>}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* WEEK VIEW */}
            {view==="Week" && (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i)=>{
                    const dayNum = new Date(year, monthIdx, now.getDate() - now.getDay() + i).getDate()
                    const isToday = i === now.getDay()
                    return (
                      <div key={d} className={`text-center p-2 rounded-xl ${isToday?"bg-purple-600/20 border border-purple-500":""}`}>
                        <div className="text-[9px] text-gray-500">{d}</div>
                        <div className={`text-sm font-bold mt-0.5 ${isToday?"text-purple-300":"text-white"}`}>{dayNum}</div>
                      </div>
                    )
                  })}
                </div>
                {["9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM"].map(h=>(
                  <div key={h} className="flex gap-1 mb-1">
                    <div className="w-12 text-[9px] text-gray-500 pt-1 flex-shrink-0">{h}</div>
                    <div className="flex-1 grid grid-cols-7 gap-1">
                      {Array(7).fill(null).map((_,i)=>(
                        <div key={i} className="h-8 border border-[#1e293b]/30 rounded hover:bg-[#111827]/50 cursor-pointer"/>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LIST VIEW */}
            {view==="List" && (
              <div className="flex-1 overflow-y-auto space-y-2">
                {upcoming.length===0 ? (
                  <div className="text-center text-gray-500 text-xs py-8">No upcoming events</div>
                ) : upcoming.map((ev,i)=>(
                  <div key={i} className="flex items-center gap-3 bg-[#111827] rounded-xl p-3 border-l-4" style={{ borderColor:ev.color }}>
                    <div className="flex-shrink-0 text-center">
                      <div className="text-[9px] text-gray-500">{new Date(ev.date).toLocaleDateString("en-US",{month:"short"})}</div>
                      <div className="text-lg font-bold text-white">{new Date(ev.date).getDate()}</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{ev.title}</p>
                      <p className="text-[9px] text-gray-400">{ev.time}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-lg" style={{ background:ev.color+"22", color:ev.color }}>{ev.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING EVENTS */}
          <div className="w-56 min-w-56 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400">Upcoming Events</p>
            <div className="flex-1 overflow-y-auto space-y-2">
              {upcoming.map((ev,i)=>(
                <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 card-hover" style={{ borderLeft:`3px solid ${ev.color}` }}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[11px] font-semibold text-white">{ev.title}</p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background:ev.color+"22", color:ev.color }}>{ev.type}</span>
                  </div>
                  <p className="text-[9px] text-gray-400">{ev.date}</p>
                  <p className="text-[9px] text-gray-500">{ev.time}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-[10px] text-gray-400 hover:text-white">View All Events</button>
          </div>
        </div>
      </main>

      {/* ADD EVENT MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-80">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold">Add Event</span>
              <button onClick={()=>setModal(false)}><X size={14} className="text-gray-400"/></button>
            </div>
            <div className="space-y-3">
              {[{l:"Event Title",k:"title",type:"text"},{l:"Date",k:"date",type:"date"},{l:"Time",k:"time",type:"time"}].map(f=>(
                <div key={f.k}>
                  <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                  <input type={f.type} value={newEv[f.k]} onChange={e=>setNewEv({...newEv,[f.k]:e.target.value})} className={inp}/>
                </div>
              ))}
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Color</label>
                <div className="flex gap-2">
                  {["#7C3AED","#06B6D4","#22c55e","#ef4444","#f59e0b","#ec4899"].map(c=>(
                    <button key={c} onClick={()=>setNewEv({...newEv,color:c})} className="w-6 h-6 rounded-full border-2 transition" style={{ background:c, borderColor:newEv.color===c?"white":"transparent" }}/>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setModal(false)} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
              <button onClick={addEvent} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}


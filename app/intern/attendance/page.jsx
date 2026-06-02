"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import InternSidebar from "../../../lib/internSidebar"
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, MapPin, Download, X, BarChart2, CalendarCheck, CalendarX, AlarmClock } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { api, getUser } from "../../../lib/api"

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DOT = { p:"#22c55e", a:"#ef4444", l:"#f59e0b", v:"#3b82f6" }
const SC = { Present:{c:"#22c55e",bg:"rgba(34,197,94,0.15)"}, Absent:{c:"#ef4444",bg:"rgba(239,68,68,0.15)"}, Late:{c:"#f59e0b",bg:"rgba(245,158,11,0.15)"} }

const RECORDS = [
  {date:"May 20, 2025",checkIn:"09:15 AM",checkOut:"-",status:"Present",location:"Sector 62, Noida",hours:"8h 45m"},
  {date:"May 19, 2025",checkIn:"09:08 AM",checkOut:"06:02 PM",status:"Present",location:"Sector 62, Noida",hours:"8h 54m"},
  {date:"May 18, 2025",checkIn:"-",checkOut:"-",status:"Absent",location:"-",hours:"-"},
  {date:"May 17, 2025",checkIn:"09:22 AM",checkOut:"06:10 PM",status:"Present",location:"Sector 62, Noida",hours:"8h 48m"},
  {date:"May 16, 2025",checkIn:"09:05 AM",checkOut:"06:00 PM",status:"Late",location:"Sector 62, Noida",hours:"8h 55m"},
]

const CHART_DATA = {
  Day:  [{d:"9AM",v:10},{d:"11AM",v:30},{d:"1PM",v:60},{d:"3PM",v:80},{d:"5PM",v:92}],
  Week: [{d:"May 1",v:10},{d:"May 8",v:45},{d:"May 15",v:60},{d:"May 22",v:78},{d:"May 29",v:92}],
  Month:[{d:"Jan",v:85},{d:"Feb",v:88},{d:"Mar",v:90},{d:"Apr",v:87},{d:"May",v:92}],
}

function mergeRecords(primary = [], secondary = []) {
  const seen = new Set()
  const merged = []
  ;[...primary, ...secondary].forEach((r) => {
    const key = `${r.date}|${r.checkIn}|${r.checkOut}|${r.status}|${r.location}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(r)
    }
  })
  return merged
}

function genMonthData(year, month) {
  const days = new Date(year, month+1, 0).getDate()
  const firstDow = new Date(year, month, 1).getDay()
  const startMon = (firstDow + 6) % 7
  const data = {}
  for (let d=1; d<=days; d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow===0||dow===6) data[d]="v"
    else if (d%12===0) data[d]="a"
    else if (d%8===0) data[d]="l"
    else data[d]="p"
  }
  return { days, startMon, data }
}

export default function AttendancePage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [monthIdx, setMonthIdx] = useState(now.getMonth())
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInId, setCheckInId] = useState(null)
  const [checkInTime, setCheckInTime] = useState(null)
  const [records, setRecords] = useState(RECORDS)
  const [stats, setStats] = useState({ present:22, absent:2, late:1, percentage:92 })
  const [viewRecord, setViewRecord] = useState(null)
  const [liveTime, setLiveTime] = useState("")
  const [liveDate, setLiveDate] = useState("")
  const [location, setLocation] = useState("Fetching location...")
  const [chartPeriod, setChartPeriod] = useState("Week")

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setLiveTime(d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
      setLiveDate(d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"2-digit",year:"numeric"}))
    }
    tick(); const id = setInterval(tick,1000); return ()=>clearInterval(id)
  },[])

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { setLocation("Not supported"); return }
    setLocation("Fetching location...")
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
          const d = await r.json()
          const a = d.address
          setLocation(`${a.suburb||a.city_district||a.city||"Unknown"}, ${a.state||""}`)
        } catch { setLocation(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`) }
      },
      async () => {
        try {
          const r = await fetch("https://ipapi.co/json/")
          const d = await r.json()
          setLocation(d.city ? `${d.city}, ${d.region}` : "Location unavailable")
        } catch { setLocation("Enable location for check-in") }
      },
      { timeout:8000, enableHighAccuracy:false }
    )
  },[])

  useEffect(() => {
    const user = getUser()
    const recordsKey = `attendanceRecords_${user.id || "guest"}`
    api.getAttendance(user.id).then(r=>{
      if (r.ok && r.data?.length) {
        setRecords((prev) => {
          const merged = mergeRecords(r.data, prev)
          try { localStorage.setItem(recordsKey, JSON.stringify(merged)) } catch {}
          return merged
        })
      }
    }).catch(()=>{})
    api.getStats(user.id).then(r=>{ if(r.ok&&r.data) setStats(r.data) }).catch(()=>{})
    const today = new Date().toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})
    const key = `checkedIn_${user.id}_${today}`

    // Restore records from localStorage if available
    try {
      const saved = JSON.parse(localStorage.getItem(recordsKey)||"[]")
      if (saved.length) setRecords(saved)
    } catch {}

    if (!localStorage.getItem(key) && user.id) {
      const timeStr = new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})
      api.checkIn({ internName:user.fullName||"Intern", date:today, checkIn:timeStr, status:"Present", location:"Auto check-in", userId:user.id })
        .then(r=>{ if(r.ok){ localStorage.setItem(key, r.data?.id||"done"); setCheckInId(r.data?.id); setCheckedIn(true); setCheckInTime(timeStr) } }).catch(()=>{})
    } else if (localStorage.getItem(key)) {
      setCheckedIn(true)
    }
  },[])

  const { days, startMon, data: calData } = genMonthData(year, monthIdx)
  const cells = [...Array(startMon).fill(null), ...Array.from({length:days},(_,i)=>i+1)]

  const pushActivity = (entry) => {
    try {
      const existing = JSON.parse(localStorage.getItem("recentActivities") || "[]")
      const updated = [entry, ...existing].slice(0, 10)
      localStorage.setItem("recentActivities", JSON.stringify(updated))
    } catch {}
  }

  const handleMarkAttendance = async () => {
    const user = getUser()
    const d = new Date()
    const dateStr = d.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})
    const timeStr = d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})
    const r = await api.checkIn({ internName:user.fullName||"Intern", date:dateStr, checkIn:timeStr, status:"Present", location, userId:user.id })
    if(r.ok) setCheckInId(r.data?.id)
    setCheckedIn(true)
    setCheckInTime(timeStr)
    setStats(p=>({...p,present:p.present+1,percentage:Math.round(((p.present+1)/(p.present+p.absent+p.late+1))*100)}))
    const newRecord = {date:dateStr,checkIn:timeStr,checkOut:"-",status:"Present",location,hours:"-"}
    setRecords(p=>{
      const updated = [newRecord,...p]
      try {
        const userId = getUser()?.id || "guest"
        localStorage.setItem(`attendanceRecords_${userId}`, JSON.stringify(updated))
      } catch {}
      return updated
    })
    pushActivity({ type:"attendance", text:`Attendance marked — Present`, time:`${timeStr}`, loc:location })
  }

  const handleCheckOut = async () => {
    const d = new Date()
    const timeStr = d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})
    const dateStr = d.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})
    if(checkInId) await api.checkOut(checkInId,{checkOut:timeStr})
    let hoursStr = "-"
    if (checkInTime) {
      const inMs = new Date(`${dateStr} ${checkInTime}`).getTime()
      const outMs = d.getTime()
      const diff = Math.max(0, outMs - inMs)
      const h = Math.floor(diff/3600000)
      const m = Math.floor((diff%3600000)/60000)
      hoursStr = `${h}h ${m}m`
    }
    setCheckedIn(false)
    setRecords(p=>{
      const updated = p.map((rec,i)=>i===0?{...rec,checkOut:timeStr,hours:hoursStr}:rec)
      try {
        const userId = getUser()?.id || "guest"
        localStorage.setItem(`attendanceRecords_${userId}`, JSON.stringify(updated))
      } catch {}
      return updated
    })
    pushActivity({ type:"checkout", text:`Checked out — ${hoursStr} worked`, time:timeStr, loc:location })
    // Clear today's check-in key so user can check in again tomorrow
    const user = getUser()
    const today = d.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})
    localStorage.removeItem(`checkedIn_${user.id}_${today}`)
  }

  // Auto-checkout when tab/window closes
  useEffect(() => {
    const autoCheckout = () => {
      if (!checkedIn) return
      const d = new Date()
      const timeStr = d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})
      const dateStr = d.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})
      if (checkInId) {
        // Use sendBeacon for reliability on page close
        const blob = new Blob([JSON.stringify({checkOut:timeStr})], {type:"application/json"})
        navigator.sendBeacon?.(`http://localhost:5000/intern/attendance/checkout/${checkInId}`, blob)
      }
      // Save checkout time to localStorage so it persists
      try {
        const userId = getUser()?.id || "guest"
        const recs = JSON.parse(localStorage.getItem(`attendanceRecords_${userId}`)||"[]")
        if (recs.length) {
          recs[0] = {...recs[0], checkOut:timeStr}
          localStorage.setItem(`attendanceRecords_${userId}`, JSON.stringify(recs))
        }
      } catch {}
    }
    window.addEventListener("beforeunload", autoCheckout)
    return () => window.removeEventListener("beforeunload", autoCheckout)
  }, [checkedIn, checkInId, checkInTime])

  const exportCSV = () => {
    const rows = [["Date","Check In","Check Out","Status","Location","Hours"]]
    records.forEach(r=>rows.push([r.date,r.checkIn,r.checkOut,r.status,r.location,r.hours]))
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"})
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="attendance.csv"; a.click(); URL.revokeObjectURL(url)
  }

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
      <InternSidebar active="Attendance"/>
      <main className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
        {/* HEADER */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Attendance</h1>
            <p className="text-gray-400 text-xs mt-0.5">Track your daily attendance and stay consistent.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleMarkAttendance} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-semibold">
              <CheckCircle2 size={14}/> Mark Attendance
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-gray-400 hover:text-white">
              <Download size={14}/> Export Report
            </button>
          </div>
        </div>

        {/* STAT CARDS — lucide icons, no broken emoji */}
        <div className="grid grid-cols-4 gap-3 flex-shrink-0">
          {[
            { l:"Overall Attendance", v:`${stats.percentage||92}%`, sub:"8% from last month", c:"#7C3AED", Icon:BarChart2 },
            { l:"Present Days",       v:String(stats.present||22),  sub:"This Month",         c:"#22c55e", Icon:CalendarCheck },
            { l:"Absent Days",        v:String(stats.absent||2),    sub:"This Month",         c:"#ef4444", Icon:CalendarX },
            { l:"Late Entries",       v:String(stats.late||1),      sub:"This Month",         c:"#f59e0b", Icon:AlarmClock },
          ].map((s,i)=>(
            <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:s.c+"22" }}>
                  <s.Icon size={15} style={{ color:s.c }}/>
                </div>
                <span className="text-[10px] text-gray-400">{s.l}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color:s.c }}>{s.v}</div>
              <div className="text-[10px] mt-1" style={{ color:s.c }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-1 overflow-hidden min-h-0">
          {/* CALENDAR */}
          <div className="bg-[#0f172a] border-2 border-[#7C3AED]/40 rounded-2xl p-3 flex flex-col card-hover" style={{ width:"52%", minWidth:0 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Attendance Calendar</span>
              <div className="flex items-center gap-2">
                <button onClick={()=>{ if(monthIdx===0){setMonthIdx(11);setYear(y=>y-1)}else setMonthIdx(m=>m-1) }} className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:bg-[#1e293b]"><ChevronLeft size={13}/></button>
                <span className="text-xs font-semibold min-w-[100px] text-center">{MONTHS[monthIdx]} {year}</span>
                <button onClick={()=>{ if(monthIdx===11){setMonthIdx(0);setYear(y=>y+1)}else setMonthIdx(m=>m+1) }} className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:bg-[#1e293b]"><ChevronRight size={13}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><div key={d} className="text-center text-[9px] text-gray-500 py-0.5">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5 flex-1">
              {cells.map((day,i)=>{
                if(!day) return <div key={i}/>
                const isToday = day===now.getDate()&&monthIdx===now.getMonth()&&year===now.getFullYear()
                const att = calData[day]
                return (
                  <div key={i} className={`flex flex-col items-center justify-center rounded-lg cursor-pointer transition ${isToday?"bg-purple-600/30 border border-purple-500":"hover:bg-[#111827]"}`} style={{ minHeight:"28px" }}>
                    <span className={`text-[10px] ${isToday?"text-purple-300 font-bold":"text-gray-300"}`}>{day}</span>
                    {att && <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background:DOT[att] }}/>}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 mt-2 flex-wrap">
              {[["Present","#22c55e"],["Absent","#ef4444"],["Late","#f59e0b"],["Leave","#3b82f6"]].map(([l,c])=>(
                <div key={l} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background:c }}/><span className="text-[9px] text-gray-400">{l}</span></div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-3 overflow-hidden" style={{ width:"48%", minWidth:0 }}>
            {/* CHART */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 flex-shrink-0 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Attendance Overview</span>
                <div className="flex bg-[#111827] border border-[#1e293b] rounded-lg p-0.5 gap-0.5">
                  {["Day","Week","Month"].map(p=>(
                    <button key={p} onClick={()=>setChartPeriod(p)} className={`px-2 py-0.5 rounded text-[9px] font-medium transition ${chartPeriod===p?"bg-gradient-to-r from-cyan-500 to-purple-600 text-white":"text-gray-400"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA[chartPeriod]}>
                    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.6}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="d" stroke="#94a3b8" fontSize={8}/>
                    <YAxis stroke="#94a3b8" fontSize={8}/>
                    <Tooltip contentStyle={{ backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"8px", fontSize:"10px" }}/>
                    <Area type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} fill="url(#ag)" dot={{ fill:"#7C3AED", r:2 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHECK IN/OUT */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 flex-1 flex flex-col overflow-hidden card-hover">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <span className="text-xs font-semibold">Check In / Out</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${checkedIn?"bg-green-400 animate-pulse":"bg-gray-500"}`}/>
                  <span className={`text-[10px] ${checkedIn?"text-green-400":"text-gray-400"}`}>{checkedIn?"Checked In":"Not In"}</span>
                </div>
              </div>

              {/* Live clock + date + location all in one card */}
              <div className="bg-[#111827] rounded-xl px-3 py-3 mb-2 flex-shrink-0">
                <div className="text-2xl font-bold font-mono text-white tracking-wider">{liveTime||"--:--:--"}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 mb-2">{liveDate}</div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-cyan-400 flex-shrink-0"/>
                  <span className="text-[10px] text-gray-300 truncate">{location}</span>
                </div>
              </div>

              {/* Check In time row */}
              <div className="bg-[#111827] rounded-xl px-3 py-2 mb-3 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Check In</span>
                  <span className="text-[11px] font-semibold text-green-400">
                    {checkInTime || (records[0]?.checkIn !== "-" ? records[0]?.checkIn : "--:--")}
                  </span>
                </div>
                <div className="w-full h-px bg-[#1e293b] my-1.5"/>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Check Out</span>
                  <span className={`text-[11px] font-semibold ${checkedIn?"text-yellow-400":"text-gray-300"}`}>
                    {records[0]?.checkOut && records[0]?.checkOut !== "-"
                      ? records[0].checkOut
                      : checkedIn ? "Still working…" : "--:--"}
                  </span>
                </div>
              </div>

              {/* Button */}
              <button onClick={handleMarkAttendance}
                className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 flex-shrink-0 bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                <CheckCircle2 size={12}/> Check In (Manual)
              </button>
              {checkedIn && (
                <button onClick={handleCheckOut}
                  className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 flex-shrink-0 mt-1"
                  style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171" }}>
                  <Clock size={12}/> Check Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RECENT ATTENDANCE TABLE */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden flex-shrink-0" style={{ maxHeight:"280px" }}>
          <div className="px-4 py-2.5 border-b border-[#1e293b] flex-shrink-0"><span className="text-xs font-semibold">Recent Attendance</span></div>
          <div className="overflow-y-auto" style={{ maxHeight:"240px" }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#0f172a]"><tr className="border-b border-[#1e293b]">
                {["Date","Check In","Check Out","Status","Location",""].map(h=><th key={h} className="text-left px-4 py-2 text-[10px] text-gray-400 font-medium">{h}</th>)}
              </tr></thead>
              <tbody>
                {records.map((r,i)=>(
                  <tr key={i} className="border-b border-[#1e293b] transition row-hover">
                    <td className="px-4 py-2 text-xs text-white">{r.date}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{r.checkIn}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{r.checkOut}</td>
                    <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold" style={{ color:SC[r.status]?.c, background:SC[r.status]?.bg }}>{r.status}</span></td>
                    <td className="px-4 py-2 text-xs text-gray-400">{r.location}</td>
                    <td className="px-4 py-2"><button onClick={()=>setViewRecord(r)} className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-600/30 text-purple-400 text-[10px]">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* VIEW MODAL */}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold">Attendance Details</span>
              <button onClick={()=>setViewRecord(null)}><X size={14} className="text-gray-400"/></button>
            </div>
            <div className="space-y-2">
              {[["Date",viewRecord.date],["Check In",viewRecord.checkIn],["Check Out",viewRecord.checkOut],["Hours",viewRecord.hours],["Location",viewRecord.location]].map(([l,v])=>(
                <div key={l} className="flex justify-between items-center bg-[#111827] rounded-xl px-3 py-2">
                  <span className="text-[10px] text-gray-400">{l}</span>
                  <span className="text-xs font-medium text-white">{v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center bg-[#111827] rounded-xl px-3 py-2">
                <span className="text-[10px] text-gray-400">Status</span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold" style={{ color:SC[viewRecord.status]?.c, background:SC[viewRecord.status]?.bg }}>{viewRecord.status}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>{ const blob=new Blob([`Date,Check In,Check Out,Status,Location\n${viewRecord.date},${viewRecord.checkIn},${viewRecord.checkOut},${viewRecord.status},${viewRecord.location}`],{type:"text/csv"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="record.csv"; a.click(); URL.revokeObjectURL(url) }} className="flex-1 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs">Download</button>
              <button onClick={()=>setViewRecord(null)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

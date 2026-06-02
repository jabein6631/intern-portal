"use client"
import { useState, useEffect } from "react"
import InternSidebar from "../../../lib/internSidebar"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts"
import { api, getUser } from "../../../lib/api"
import { X } from "lucide-react"

const RD = [{ s:"Technical",v:80 },{ s:"Punctuality",v:90 },{ s:"Communication",v:60 },{ s:"Teamwork",v:75 },{ s:"Problem Solving",v:70 }]

const CHART_DATA = {
  Day:  { T1:[{d:"9AM",v:10},{d:"11AM",v:25},{d:"1PM",v:40},{d:"3PM",v:55},{d:"5PM",v:65}], T2:[{d:"9AM",v:0},{d:"11AM",v:0},{d:"1PM",v:100},{d:"3PM",v:100},{d:"5PM",v:100}], stats:{score:"65%",completed:3,attendance:"100%",ontime:"67%"} },
  Week: { T1:[{d:"Mon",v:20},{d:"Tue",v:35},{d:"Wed",v:50},{d:"Thu",v:65},{d:"Fri",v:80},{d:"Sat",v:85},{d:"Sun",v:85}], T2:[{d:"Mon",v:100},{d:"Tue",v:100},{d:"Wed",v:0},{d:"Thu",v:100},{d:"Fri",v:100},{d:"Sat",v:0},{d:"Sun",v:0}], stats:{score:"78%",completed:8,attendance:"71%",ontime:"75%"} },
  Month:{ T1:[{d:"Apr 28",v:0},{d:"May 4",v:40},{d:"May 11",v:55},{d:"May 18",v:70},{d:"May 25",v:85}], T2:[{d:"Apr 21",v:0},{d:"Apr 27",v:60},{d:"May 4",v:75},{d:"May 11",v:80},{d:"May 18",v:92}], stats:{score:"82%",completed:18,attendance:"92%",ontime:"85%"} },
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("Month")
  const [stats, setStats] = useState({ score:"82%", completed:18, attendance:"92%", ontime:"85%", total:24 })
  const [donut, setDonut] = useState([{n:"Completed",v:12,c:"#7C3AED"},{n:"In Progress",v:8,c:"#06B6D4"},{n:"Pending",v:4,c:"#f59e0b"}])
  const [showReport, setShowReport] = useState(false)

  const REPORT_BAR_DATA = [
    { week:"Week 1", tasks:4, attendance:5, score:65 },
    { week:"Week 2", tasks:6, attendance:4, score:72 },
    { week:"Week 3", tasks:8, attendance:5, score:78 },
    { week:"Week 4", tasks:10, attendance:5, score:85 },
    { week:"Week 5", tasks:12, attendance:4, score:88 },
    { week:"Week 6", tasks:18, attendance:5, score:92 },
  ]

  const SKILL_BAR = [
    { skill:"Technical",    score:80 },
    { skill:"Punctuality",  score:90 },
    { skill:"Comms",        score:60 },
    { skill:"Teamwork",     score:75 },
    { skill:"Problem Solv", score:70 },
  ]

  useEffect(() => {
    const user = getUser()
    api.getTasks(user.id).then(r => {
      if (r.ok && r.data?.length) {
        const tasks = r.data
        const completed = tasks.filter(t => t.status==="Completed"||t.status==="Submitted").length
        const total = tasks.length
        const inprog = tasks.filter(t => t.status==="In Progress").length
        const pending = tasks.filter(t => t.status==="Pending").length
        setStats(p => ({ ...p, completed, total, ontime:`${total>0?Math.round(completed/total*100):85}%` }))
        setDonut([{n:"Completed",v:completed,c:"#7C3AED"},{n:"In Progress",v:inprog,c:"#06B6D4"},{n:"Pending",v:pending,c:"#f59e0b"}])
      }
    }).catch(()=>{})
    api.getStats(user.id).then(r => {
      if (r.ok && r.data) setStats(p => ({ ...p, attendance:`${r.data.percentage||92}%` }))
    }).catch(()=>{})
  }, [])

  const cd = CHART_DATA[period]
  const ds = period==="Month" ? stats : cd.stats

  // Plain text insights — no emoji encoding issues
  const insights = [
    { icon:"OK", color:"#22c55e", text:`Task completion: ${ds.completed}/${stats.total||24}. ${parseInt(ds.score)>=80?"Above average! Keep it up.":"Focus on completing pending tasks."}` },
    { icon:"ATT", color:"#06B6D4", text:`Attendance: ${ds.attendance} — ${parseInt(ds.attendance)>=90?"Outstanding! Top 10%.":"Aim for 90%+ for best evaluation."}` },
    { icon:"!", color:"#f59e0b", text:`On-time submissions: ${ds.ontime}. Focus more on meeting deadlines.` },
  ]

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
      <InternSidebar active="Analytics"/>
      <main className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-gray-400 text-xs mt-0.5">Detailed insights into your performance.</p>
          </div>
          <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-xl p-0.5 gap-0.5">
            {["Day","Week","Month"].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${period===p?"bg-gradient-to-r from-cyan-500 to-purple-600 text-white":"text-gray-400 hover:text-white"}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-4 gap-3 flex-shrink-0">
          {[
            {l:"Overall Score",v:ds.score,sub:`+12% vs last ${period.toLowerCase()}`,c:"#7C3AED"},
            {l:"Completed",v:String(ds.completed),sub:`+20% vs last ${period.toLowerCase()}`,c:"#22c55e"},
            {l:"Attendance",v:ds.attendance,sub:`+8% vs last ${period.toLowerCase()}`,c:"#06B6D4"},
            {l:"On-time",v:ds.ontime,sub:`+10% vs last ${period.toLowerCase()}`,c:"#f59e0b"},
          ].map((s,i)=>(
            <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 card-hover">
              <p className="text-[10px] text-gray-400 mb-1">{s.l}</p>
              <p className="text-2xl font-bold" style={{ color:s.c }}>{s.v}</p>
              <p className="text-[10px] mt-1" style={{ color:s.c }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-1 overflow-hidden min-h-0">
          <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden">
            {/* TASK TREND */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 card-hover">
              <p className="text-xs font-semibold mb-1">Task Completion Trend</p>
              <p className="text-[9px] text-gray-500 mb-2">{period==="Day"?"Today":period==="Week"?"This Week":"This Month"}</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cd.T1}>
                    <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.6}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="d" stroke="#94a3b8" fontSize={8}/>
                    <YAxis stroke="#94a3b8" fontSize={8}/>
                    <Tooltip contentStyle={{ backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"8px", fontSize:"10px" }}/>
                    <Area type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} fill="url(#tg)" dot={{ fill:"#7C3AED", r:2 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* ATTENDANCE TREND */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 card-hover">
              <p className="text-xs font-semibold mb-1">Attendance Trend</p>
              <p className="text-[9px] text-gray-500 mb-2">{period==="Day"?"Today":period==="Week"?"This Week":"This Month"}</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cd.T2}>
                    <defs><linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="d" stroke="#94a3b8" fontSize={8}/>
                    <YAxis stroke="#94a3b8" fontSize={8}/>
                    <Tooltip contentStyle={{ backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"8px", fontSize:"10px" }}/>
                    <Area type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2} fill="url(#ag2)" dot={{ fill:"#22c55e", r:2 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* INTERNSHIP PROGRESS */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 card-hover">
              <p className="text-xs font-semibold mb-2">Internship Progress</p>
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6" fill="none"/>
                    <circle cx="40" cy="40" r="32" stroke="url(#pg2)" strokeWidth="6" fill="none" strokeDasharray="201" strokeDashoffset="50" strokeLinecap="round"/>
                    <defs><linearGradient id="pg2"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold">75%</span>
                    <span className="text-[8px] text-gray-400">Done</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-[10px] text-gray-400">28 Days Left</p>
                  {[["#a855f7","Completed","75%"],["#22d3ee","In Progress","15%"],["#ec4899","Pending","10%"]].map(([c,t,v])=>(
                    <div key={t} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background:c }}/><span className="text-[10px] text-gray-400">{t}</span></div>
                      <span className="text-[10px] font-bold text-purple-400">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* TASK DISTRIBUTION */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 card-hover">
              <p className="text-xs font-semibold mb-2">Task Status Distribution</p>
              <div className="flex items-center gap-3">
                <div className="w-24 h-24 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={donut} cx="50%" cy="50%" innerRadius={24} outerRadius={42} dataKey="v" strokeWidth={0}>{donut.map((d,i)=><Cell key={i} fill={d.c}/>)}</Pie></PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="text-xl font-bold">{donut.reduce((s,d)=>s+d.v,0)}</div>
                  <div className="text-[9px] text-gray-400 mb-2">Total</div>
                  {donut.map(d=><div key={d.n} className="flex items-center gap-1.5 mb-1"><div className="w-2 h-2 rounded-full" style={{ background:d.c }}/><span className="text-[10px] text-gray-400">{d.n} ({d.v})</span></div>)}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-64 min-w-64 flex flex-col gap-3">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 flex-1 card-hover">
              <p className="text-xs font-semibold mb-2">Skills Progress</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={RD}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                    <PolarAngleAxis dataKey="s" tick={{ fill:"rgba(255,255,255,0.5)", fontSize:9 }}/>
                    <Radar dataKey="v" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.35}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 flex-1 card-hover">
              <p className="text-xs font-semibold mb-1">AI Insights</p>
              <p className="text-[9px] text-gray-500 mb-2">{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
              <div className="space-y-2">
                {insights.map((ins,i)=>(
                  <div key={i} className="bg-[#111827] rounded-xl p-2 flex gap-2 items-start">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background:ins.color+"22", color:ins.color }}>{ins.icon}</span>
                    <span className="text-[10px] text-gray-400 leading-relaxed">{ins.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>setShowReport(true)} className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-[11px] font-bold hover:opacity-90 transition">View Detailed Report</button>
            </div>
          </div>
        </div>
      </main>

      {/* DETAILED REPORT MODAL */}
      {showReport && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] sticky top-0 bg-[#0f172a] z-10">
              <div>
                <h2 className="text-sm font-bold">Detailed Performance Report</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Full breakdown of your internship progress</p>
              </div>
              <button onClick={()=>setShowReport(false)} className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:bg-red-900/30 transition">
                <X size={14} className="text-gray-400"/>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { l:"Overall Score", v:stats.score,      c:"#7C3AED" },
                  { l:"Tasks Done",    v:`${stats.completed}/${stats.total||24}`, c:"#22c55e" },
                  { l:"Attendance",    v:stats.attendance,  c:"#06B6D4" },
                  { l:"On-time",       v:stats.ontime,      c:"#f59e0b" },
                ].map((s,i)=>(
                  <div key={i} className="bg-[#111827] rounded-xl p-3 text-center card-hover">
                    <p className="text-[9px] text-gray-400 mb-1">{s.l}</p>
                    <p className="text-xl font-bold" style={{ color:s.c }}>{s.v}</p>
                  </div>
                ))}
              </div>

              {/* Weekly Progress Bar Chart */}
              <div className="bg-[#111827] rounded-xl p-4 card-hover">
                <p className="text-xs font-semibold mb-3">Weekly Progress — Tasks vs Attendance vs Score</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REPORT_BAR_DATA} barGap={4}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false}/>
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false}/>
                      <Tooltip contentStyle={{ backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"10px", fontSize:"10px" }} cursor={{ fill:"rgba(255,255,255,0.03)" }}/>
                      <Legend wrapperStyle={{ fontSize:"10px", paddingTop:"8px" }}/>
                      <Bar dataKey="tasks"      name="Tasks Completed" fill="#7C3AED" radius={[4,4,0,0]}/>
                      <Bar dataKey="attendance" name="Attendance Days"  fill="#06B6D4" radius={[4,4,0,0]}/>
                      <Bar dataKey="score"      name="Score %"          fill="#22c55e" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skills Bar Chart */}
              <div className="bg-[#111827] rounded-xl p-4 card-hover">
                <p className="text-xs font-semibold mb-3">Skills Assessment</p>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SKILL_BAR} layout="vertical" barSize={14}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                      <XAxis type="number" domain={[0,100]} stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false}/>
                      <YAxis type="category" dataKey="skill" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={72}/>
                      <Tooltip contentStyle={{ backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"10px", fontSize:"10px" }} cursor={{ fill:"rgba(255,255,255,0.03)" }}/>
                      <Bar dataKey="score" name="Score" radius={[0,4,4,0]}>
                        {SKILL_BAR.map((_,i)=>(
                          <Cell key={i} fill={["#7C3AED","#06B6D4","#ec4899","#22c55e","#f59e0b"][i]}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Task Status + Insights side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111827] rounded-xl p-4 card-hover">
                  <p className="text-xs font-semibold mb-3">Task Status Breakdown</p>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={donut.map(d=>({ name:d.n, value:d.v, fill:d.c }))}>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false}/>
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false}/>
                        <Tooltip contentStyle={{ backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"10px", fontSize:"10px" }} cursor={{ fill:"rgba(255,255,255,0.03)" }}/>
                        <Bar dataKey="value" name="Tasks" radius={[4,4,0,0]}>
                          {donut.map((d,i)=><Cell key={i} fill={d.c}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-[#111827] rounded-xl p-4 card-hover">
                  <p className="text-xs font-semibold mb-3">AI Recommendations</p>
                  <div className="space-y-2">
                    {insights.map((ins,i)=>(
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background:ins.color+"22", color:ins.color }}>{ins.icon}</span>
                        <span className="text-[10px] text-gray-400 leading-relaxed">{ins.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

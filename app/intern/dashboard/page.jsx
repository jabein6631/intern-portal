"use client"
import { ArrowUp, ArrowDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Bell, LayoutDashboard, ClipboardList, Calendar,
  MessageSquare, Settings, User, BarChart3, BookOpenCheck,
  CheckCircle2, FileText, UserCheck, GraduationCap, Bot,
  Send, X, LogOut, UserPlus, Mic, Paperclip, ChevronDown,
  Camera, FolderOpen,
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts"
import { getUser, getInternUser } from "../../../lib/api"

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY

const PERF_DATA = {
  Day:  [{ day:"9AM",value:3 },{ day:"11AM",value:5 },{ day:"1PM",value:7 },{ day:"3PM",value:6 },{ day:"5PM",value:8 }],
  Week: [{ day:"Mon",value:4 },{ day:"Tue",value:6 },{ day:"Wed",value:7 },{ day:"Thu",value:8 },{ day:"Fri",value:9 },{ day:"Sat",value:8 },{ day:"Sun",value:7 }],
  Month:[{ day:"W1",value:5 },{ day:"W2",value:6.5 },{ day:"W3",value:7.8 },{ day:"W4",value:8.9 }],
}

export default function InternDashboard() {
  const router = useRouter()
  const [openAI, setOpenAI] = useState(true)
  const [message, setMessage] = useState("")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [aiWidth, setAiWidth] = useState(33)
  const [loading, setLoading] = useState(false)
  const [perfPeriod, setPerfPeriod] = useState("Week")
  const [userName, setUserName] = useState("User")
  const [userRole, setUserRole] = useState("Intern")
  const [userPhoto, setUserPhoto] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [showAICamera, setShowAICamera] = useState(false)
  const [liveActivities, setLiveActivities] = useState([
    { type:"task",       text:"Task submitted — Login API",    time:"2h ago",  color:"bg-green-500",  icon:"task",       path:"/intern/tasks" },
    { type:"journal",    text:"Journal uploaded — May 20",     time:"5h ago",  color:"bg-blue-500",   icon:"journal",    path:"/intern/journals" },
    { type:"attendance", text:"Attendance marked — Present",   time:"9h ago",  color:"bg-orange-500", icon:"attendance", path:"/intern/attendance" },
  ])
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your AI Assistant. Ask me anything about your internship, coding, or any topic!" },
  ])
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const aiVideoRef = useRef(null)
  const aiStreamRef = useRef(null)

  // Poll localStorage for real username — use intern-specific key
  useEffect(() => {
    const load = () => {
      try {
        const u = getInternUser()
        if (u.fullName) setUserName(u.fullName)
        if (u.role) setUserRole(u.role)
        if (u.photo) setUserPhoto(u.photo)
      } catch {}
    }
    load()
    const id = setInterval(load, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  // Poll localStorage for attendance activities pushed from attendance page
  useEffect(() => {
    const loadActivities = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("recentActivities") || "[]")
        if (stored.length > 0) {
          const mapped = stored.map(a => ({
            type: a.type,
            text: a.text,
            time: a.time,
            color: a.type === "checkout" ? "bg-red-500" : a.type === "attendance" ? "bg-orange-500" : "bg-green-500",
            icon: a.type,
            path: "/intern/attendance",
            loc: a.loc,
          }))
          setLiveActivities(prev => {
            const defaults = prev.filter(p => p.type !== "attendance" && p.type !== "checkout")
            return [...mapped, ...defaults].slice(0, 5)
          })
        }
      } catch {}
    }
    loadActivities()
    const id = setInterval(loadActivities, 2000)
    return () => clearInterval(id)
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, title: "Dashboard",  path: "/intern/dashboard",  active: true },
    { icon: ClipboardList,   title: "Tasks",       path: "/intern/tasks" },
    { icon: BookOpenCheck,   title: "Attendance",  path: "/intern/attendance" },
    { icon: FileText,        title: "Journals",    path: "/intern/journals" },
    { icon: BarChart3,       title: "Analytics",   path: "/intern/analytics" },
    { icon: Calendar,        title: "Calendar",    path: "/intern/calendar" },
    { icon: MessageSquare,   title: "Messages",    path: "/intern/messages" },
    { icon: User,            title: "Mentor",      path: "/intern/mentor" },
    { icon: Settings,        title: "Settings",    path: "/intern/settings" },
  ]

  // Microphone
  const startMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert("Speech recognition not supported. Use Chrome."); return }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); setShowAttachMenu(false); return }
    const rec = new SR(); rec.lang="en-US"; rec.interimResults=false; rec.maxAlternatives=1
    rec.onresult = e => { setMessage(p => p + (p?" ":"") + e.results[0][0].transcript); setIsListening(false) }
    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec; rec.start(); setIsListening(true); setShowAttachMenu(false)
  }

  // AI Camera
  const openAICamera = async () => {
    setShowAICamera(true); setShowAttachMenu(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      aiStreamRef.current = stream
      setTimeout(() => { if (aiVideoRef.current) aiVideoRef.current.srcObject = stream }, 100)
    } catch { alert("Camera permission denied."); setShowAICamera(false) }
  }
  const captureAIPhoto = () => {
    if (!aiVideoRef.current) return
    const canvas = document.createElement("canvas")
    canvas.width = aiVideoRef.current.videoWidth; canvas.height = aiVideoRef.current.videoHeight
    canvas.getContext("2d").drawImage(aiVideoRef.current, 0, 0)
    aiStreamRef.current?.getTracks().forEach(t => t.stop()); setShowAICamera(false)
    setMessages(p => [...p, { role:"user", text:"[Photo captured]" }, { role:"ai", text:"Photo captured! Describe what's in it and I'll help you analyze it." }])
  }

  const sendMessage = async () => {
    if (!message.trim() || loading) return
    const userInput = message.trim()
    setMessages(p => [...p, { role: "user", text: userInput }])
    setMessage(""); setLoading(true); setShowAttachMenu(false)

    try {
      // Call Groq via backend — free tier, no quota issues
      const res = await fetch("http://localhost:5000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(p => [...p, { role: "ai", text: data.reply }])
        setLoading(false)
        return
      }
    } catch {}

    // Smart offline fallback
    const lower = userInput.toLowerCase()
    let reply = ""
    if (lower.includes("api")) reply = "**API** = Application Programming Interface — allows software to communicate.\n\n• REST API uses HTTP: GET, POST, PUT, DELETE\n• JSON is the most common data format\n• JWT tokens are used for authentication\n\nIn your project: Flask backend exposes APIs that Next.js calls to save data in MongoDB."
    else if (lower.match(/hi|hello|hey/)) reply = `Hello ${userName}! I'm your AI Assistant. Ask me anything about tasks, attendance, journals, coding, or your internship!`
    else if (lower.includes("task")) reply = "**Tasks:** Click + Add Task → fill details → save. Use the Kanban board to track progress. Click 'Take Task' for a coding exam mode!"
    else if (lower.includes("attendance")) reply = "**Attendance:** Auto check-in when you open the app, auto check-out when you close. Calendar shows Present/Absent/Late dots."
    else if (lower.includes("journal")) reply = "**Journals:** Write daily progress — what you worked on, learned, challenges faced, and tomorrow's plan. Mentor can add comments."
    else reply = `I understand: **"${userInput}"**\n\nTo enable full AI: Get a free Groq API key at https://console.groq.com/keys → add to backend .env as GROQ_API_KEY → restart backend.\n\nGroq is FREE and uses Llama3-70b — much better than Gemini free tier!`
    setMessages(p => [...p, { role: "ai", text: reply }])
    setLoading(false)
  }

  const startDragging = (e) => {
    e.preventDefault()
    document.onmousemove = (event) => {
      const newWidth = ((window.innerWidth - event.clientX) / window.innerWidth) * 100
      if (newWidth >= 25 && newWidth <= 45) setAiWidth(newWidth)
    }
    document.onmouseup = () => { document.onmousemove = null }
  }

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/login") }

  return (
     <div className="h-screen w-screen overflow-hidden text-white flex">
      {/* SIDEBAR */}
      <aside
  className="w-[175px] border-r border-white/10 px-2.5 py-2.5 flex flex-col justify-between backdrop-blur-xl"
  style={{
    background: "rgba(15,23,42,0.55)",
  }}
>
        <div>
          {/* LOGO */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <h1 className="text-lg font-bold">InternPortal</h1>
          </div>
          {/* MENU */}
          <div className="space-y-1.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button key={index} onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-2xl transition text-xs ${item.active ? "bg-gradient-to-r from-cyan-500 to-purple-600" : "hover:bg-[#111827]"}`}>
                  <Icon size={16} />{item.title}
                </button>
              )
            })}
          </div>
        </div>
        {/* PROFILE */}
        <div className="relative backdrop-blur-xl rounded-3xl p-2.5 border border-[#1e293b]"
        style={{
  background: "rgba(15,23,42,0.55)"
}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold overflow-hidden">
                {userPhoto ? <img src={userPhoto} className="w-full h-full object-cover" alt="profile"/> : userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-[11px]">{userName}</h2>
                <p className="text-gray-400 text-[10px] capitalize">{userRole}</p>
              </div>
            </div>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)}><ChevronDown size={16}/></button>
          </div>
          {showProfileMenu && (
            <div className="absolute bottom-20 left-2 right-2 bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden z-50">
              <button onClick={() => router.push("/login")} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1e293b] text-xs"><UserPlus size={14}/>Add Account</button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1e293b] text-red-400 text-xs"><LogOut size={14}/>Logout</button>
            </div>
          )}
          <div className="mt-4">
            <p className="text-[9px] text-gray-400">Internship Progress</p>
            <h1 className="text-xl font-bold mt-1">75%</h1>
            <div className="w-full h-2 bg-[#1e293b] rounded-full mt-2 overflow-hidden">
              <div className="w-[75%] h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
            </div>
            <p className="text-[9px] text-gray-400 mt-1">28 Days Left</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="p-2.5 overflow-hidden transition-all duration-300 bg-cover bg-center flex flex-col"
        style={{ width: openAI ? `${100 - aiWidth}%` : "100%", backgroundImage: "none", backgroundColor: "#020617" }}>
        {/* TOP */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userName.split(" ")[0]}</h1>
            <p className="text-gray-400 text-xs mt-1">Internship dashboard overview.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
              <input type="text" placeholder="Search..." className="w-[165px] bg-[#0f172a] border border-[#1e293b] rounded-2xl py-1.5 pl-9 pr-3 text-[11px] outline-none"/>
            </div>
            {!openAI && (
              <button onClick={() => setOpenAI(true)} className="w-10 h-10 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-center">
                <Bot size={16} />
              </button>
            )}
            <button className="w-10 h-10 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-center relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-[9px] flex items-center justify-center">3</span>
            </button>
            <img src="https://i.pravatar.cc/60" className="w-10 h-10 rounded-2xl" alt="avatar"/>
          </div>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-4 gap-2.5 mb-2.5">
          <StatCard title="Assigned"    value="24"  trend="+12%" trendType="up" subtitle="from last week" color1="#3b82f6" color2="#06b6d4" onClick={()=>router.push("/intern/tasks")}/>
          <StatCard title="Completed"   value="18"  trend="+18%" trendType="up" subtitle="from last week" color1="#10b981" color2="#14b8a6" onClick={()=>router.push("/intern/tasks")}/>
          <StatCard title="Attendance"  value="92%" trend="+5%"  trendType="up" subtitle="from last week" color1="#ec4899" color2="#d946ef" onClick={()=>router.push("/intern/attendance")}/>
          <StatCard title="Performance" value="8.9" trend="+8%"  trendType="up" subtitle="from last week" color1="#f97316" color2="#eab308" onClick={()=>router.push("/intern/analytics")}/>
        </div>

        {/* MIDDLE */}
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          {/* PROGRESS */}
          <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-2.5 card-hover">
            <h2 className="text-base font-semibold mb-2">Internship Progress</h2>
            <div className="flex items-center justify-between">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="56" stroke="#1e293b" strokeWidth="10" fill="none"/>
                  <circle cx="72" cy="72" r="56" stroke="url(#gradient)" strokeWidth="10" fill="none" strokeDasharray="350" strokeDashoffset="90" strokeLinecap="round"/>
                  <defs><linearGradient id="gradient"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h1 className="text-3xl font-bold">75%</h1>
                  <p className="text-[10px] text-gray-400">Completed</p>
                </div>
              </div>
              <div className="space-y-4">
                <Legend color="bg-purple-500" title="Completed" value="75%"/>
                <Legend color="bg-cyan-400" title="In Progress" value="15%"/>
                <Legend color="bg-pink-500" title="Pending" value="10%"/>
              </div>
            </div>
          </div>
          {/* CHART */}
          <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-2.5 card-hover">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">Performance</h2>
              <div className="flex bg-[#111827] border border-[#1e293b] rounded-xl p-0.5 gap-0.5">
                {["Day","Week","Month"].map(p=>(
                  <button key={p} onClick={()=>setPerfPeriod(p)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition ${perfPeriod===p?"bg-gradient-to-r from-cyan-500 to-purple-600 text-white":"text-gray-400 hover:text-white"}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-[145px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERF_DATA[perfPeriod]}>
                  <defs>
                    <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b"/>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10}/>
                  <YAxis stroke="#94a3b8" fontSize={10}/>
                  <Tooltip contentStyle={{ backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"12px" }} labelStyle={{ color:"#94a3b8" }} itemStyle={{ color:"#38bdf8" }} cursor={{ fill:"rgba(56,189,248,0.08)" }}/>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#blue)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-2.5 card-hover">
            <h2 className="text-base font-semibold mb-2.5">Recent Activities</h2>
            <div className="space-y-2">
              {liveActivities.slice(0,4).map((a,i) => {
                const iconEl = a.type==="attendance"||a.type==="checkout"
                  ? <UserCheck size={14}/>
                  : a.type==="task" ? <CheckCircle2 size={14}/>
                  : <FileText size={14}/>
                return (
                  <ActivityItem key={i} icon={iconEl} title={a.text} time={a.time} color={a.color} onClick={()=>router.push(a.path||"/intern/attendance")}/>
                )
              })}
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-2.5 card-hover">
            <h2 className="text-base font-semibold mb-2.5">Upcoming Deadlines</h2>
            <div className="space-y-2">
              <DeadlineItem title="UI Case Study" days="2 Days" onClick={()=>router.push("/intern/tasks")}/>
              <DeadlineItem title="API Integration" days="4 Days" onClick={()=>router.push("/intern/tasks")}/>
              <DeadlineItem title="Journal Submit" days="7 Days" onClick={()=>router.push("/intern/journals")}/>
            </div>
          </div>
        </div>
      </main>

      {/* AI PANEL */}
      {openAI && (
        <div className="h-screen border-l border-[#1e293b] flex flex-col relative bg-cover bg-center"
          style={{ width:`${aiWidth}%`, backgroundImage:"url('/dashboard.png')" }}>
          {/* DRAG */}
          <div onMouseDown={startDragging} className="absolute left-0 top-0 w-1.5 h-full bg-[#1e293b] hover:bg-cyan-500 cursor-col-resize z-10"/>
          {/* OVERLAY */}
          <div className="absolute inset-0 bg-[#020617]/60 pointer-events-none"/>
          {/* HEADER */}
          <div className="relative z-10 h-14 border-b border-[#1e293b] flex items-center justify-between px-3 bg-[#020617]/70 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                <Bot size={18}/>
              </div>
              <div>
                <h1 className="text-base font-bold">AI Assistant</h1>
                <p className="text-[10px] text-cyan-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>Gemini Powered</p>
              </div>
            </div>
            <button onClick={() => setOpenAI(false)} className="w-9 h-9 rounded-xl bg-[#111827] flex items-center justify-center hover:bg-red-900/30">
              <X size={16}/>
            </button>
          </div>
          {/* CHAT */}
          <div className="relative z-10 flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {messages.map((msg, index) => (
              <div key={index} className={`max-w-[88%] p-3 rounded-3xl text-xs leading-relaxed ${msg.role === "user" ? "ml-auto bg-gradient-to-r from-cyan-500 to-purple-600" : "bg-[#111827]/80 backdrop-blur-sm border border-[#1e293b]"}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="max-w-[88%] p-3 rounded-3xl text-xs bg-[#111827]/80 backdrop-blur-sm border border-[#1e293b]">
                <div className="flex gap-1 items-center">
                  {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400" style={{ animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>
          {/* INPUT */}
          <div className="relative z-10 border-t border-[#1e293b] p-2.5 bg-[#020617]/70 backdrop-blur-sm">
            <div className="bg-[#111827]/80 rounded-3xl flex items-center gap-2 px-2 py-2 border border-[#1e293b]">
              {/* Attachment menu */}
              <div className="relative">
                <button onClick={()=>setShowAttachMenu(!showAttachMenu)} className={`w-9 h-9 rounded-2xl flex items-center justify-center transition ${showAttachMenu?"bg-purple-600/40":"bg-[#1e293b] hover:bg-purple-900/30"}`}>
                  <Paperclip size={16}/>
                </button>
                {showAttachMenu && (
                  <div className="absolute bottom-12 left-0 bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden z-50 w-44 shadow-xl">
                    <label className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[#1e293b] text-xs border-b border-[#1e293b]">
                      <FolderOpen size={13} className="text-cyan-400"/> Open File Explorer
                      <input ref={fileInputRef} type="file" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]){ setMessages(p=>[...p,{role:"user",text:`📎 Attached: ${e.target.files[0].name}`},{role:"ai",text:`I see you attached **${e.target.files[0].name}**. Paste the content here and I'll analyze it!`}]); setShowAttachMenu(false) }}}/>
                    </label>
                    <button onClick={openAICamera} className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#1e293b] text-xs w-full text-left border-b border-[#1e293b]">
                      <Camera size={13} className="text-pink-400"/> Camera (Webcam)
                    </button>
                    <button onClick={startMic} className={`flex items-center gap-2 px-3 py-2.5 hover:bg-[#1e293b] text-xs w-full text-left ${isListening?"text-green-400":"text-white"}`}>
                      <Mic size={13} className={isListening?"text-green-400":"text-yellow-400"}/> {isListening?"🔴 Listening…":"Microphone"}
                    </button>
                  </div>
                )}
              </div>
              <input type="text" value={message} onChange={e=>setMessage(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") sendMessage() }}
                placeholder="Ask anything about your internship…"
                className="flex-1 bg-transparent outline-none text-xs"/>
              {/* Mic shortcut */}
              <button onClick={startMic} className={`w-8 h-8 rounded-2xl flex items-center justify-center transition ${isListening?"bg-green-500/30 border border-green-500/50":"bg-[#1e293b] hover:bg-purple-900/30"}`}>
                <Mic size={14} className={isListening?"text-green-400":"text-gray-400"}/>
              </button>
              <button onClick={()=>{ if(!loading&&message.trim()) sendMessage() }} className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                <Send size={16}/>
              </button>
            </div>
            <p className="text-[9px] text-gray-500 text-center mt-1">Enter to send • 📎 attach • 🎤 voice</p>
          </div>
        </div>
      )}

      {/* AI CAMERA MODAL */}
      {showAICamera && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-[440px] flex flex-col items-center gap-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-bold flex items-center gap-2"><Camera size={14}/> Camera</span>
              <button onClick={()=>{ aiStreamRef.current?.getTracks().forEach(t=>t.stop()); setShowAICamera(false) }}><X size={14} className="text-gray-400"/></button>
            </div>
            <video ref={aiVideoRef} autoPlay playsInline muted className="w-full rounded-xl bg-black max-h-64 object-cover"/>
            <div className="flex gap-3 w-full">
              <button onClick={()=>{ aiStreamRef.current?.getTracks().forEach(t=>t.stop()); setShowAICamera(false) }} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
              <button onClick={captureAIPhoto} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold flex items-center justify-center gap-1"><Camera size={12}/> Capture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CARD_DATA = {
  Assigned:    [{ day:"Mon",v:3 },{ day:"Tue",v:5 },{ day:"Wed",v:4 },{ day:"Thu",v:7 },{ day:"Fri",v:6 },{ day:"Sat",v:9 },{ day:"Sun",v:8 }],
  Completed:   [{ day:"Mon",v:2 },{ day:"Tue",v:4 },{ day:"Wed",v:6 },{ day:"Thu",v:5 },{ day:"Fri",v:8 },{ day:"Sat",v:9 },{ day:"Sun",v:10 }],
  Attendance:  [{ day:"Mon",v:70 },{ day:"Tue",v:80 },{ day:"Wed",v:88 },{ day:"Thu",v:75 },{ day:"Fri",v:92 },{ day:"Sat",v:85 },{ day:"Sun",v:95 }],
  Performance: [{ day:"Mon",v:4 },{ day:"Tue",v:5 },{ day:"Wed",v:6 },{ day:"Thu",v:7 },{ day:"Fri",v:7 },{ day:"Sat",v:8 },{ day:"Sun",v:9 }],
}

function StatCard({ title, value, trend, trendType, subtitle, color1, color2, onClick }) {
  const [hovered, setHovered] = useState(false)
  const data = CARD_DATA[title] || CARD_DATA.Assigned
  const gradId = `sc-${title.replace(/\s+/g,"")}`
  const unit = title === "Attendance" ? "%" : ""

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden bg-[#0f172a] border rounded-3xl flex flex-col cursor-pointer transition-all duration-300"
      style={{
        minHeight:"142px",
        borderColor: hovered ? color2 : "#1e293b",
        boxShadow: hovered ? `0 0 18px ${color2}40` : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* subtle colour tint */}
      <div className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300"
        style={{ background:`linear-gradient(160deg, ${color1}55, ${color2}22)`, opacity: hovered ? 0.18 : 0.10 }}/>

      {/* TEXT */}
      <div className="relative z-10 px-3 pt-2.5 pb-0 flex-shrink-0">
        <p className="text-[10px] font-medium tracking-wide uppercase transition-colors duration-200"
          style={{ color: hovered ? color2 : "#94a3b8" }}>
          {title}
        </p>
        <h1
          className="text-[1.7rem] font-bold leading-tight mt-0.5 transition-all duration-200"
          style={{
            color: hovered ? "#ffffff" : "#f1f5f9",
            textShadow: hovered ? `0 0 20px ${color2}99` : "none",
            animation: hovered ? "blink-in 0.35s ease" : "none",
          }}
        >
          {value}
        </h1>
        <div className="flex items-center gap-1 mt-0.5 text-[10px]" style={{ color: trendType==="up" ? "#4ade80" : "#f87171" }}>
          {trendType === "up" ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
          <span className="font-semibold">{trend}</span>
          <span className="text-gray-500 ml-0.5">{subtitle}</span>
        </div>
      </div>

      {/* REAL CHART */}
      <div className="relative z-10 flex-1 w-full" style={{ minHeight:"80px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top:8, right:8, bottom:0, left:-28 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color2} stopOpacity={hovered ? 0.7 : 0.5}/>
                <stop offset="100%" stopColor={color1} stopOpacity={0.03}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="day" stroke="#334155" tick={{ fill:"#64748b", fontSize:8 }} tickLine={false} axisLine={false}/>
            <YAxis stroke="#334155" tick={{ fill:"#64748b", fontSize:8 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}${unit}`}/>
            <Tooltip
              contentStyle={{ backgroundColor:"#0f172a", border:`1px solid ${color2}55`, borderRadius:"10px", padding:"6px 10px" }}
              labelStyle={{ color:"#94a3b8", fontSize:"10px", marginBottom:"2px" }}
              itemStyle={{ color:color2, fontSize:"11px", fontWeight:"bold" }}
              formatter={v => [`${v}${unit}`, title]}
              cursor={{ stroke:color2, strokeWidth:1, strokeDasharray:"4 2" }}
            />
            <Area type="monotone" dataKey="v" stroke={color2} strokeWidth={2.5} fill={`url(#${gradId})`}
              dot={false} activeDot={{ r:4, fill:color2, stroke:"#0f172a", strokeWidth:2 }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Legend({ color, title, value }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`}/>
        <span className="text-xs">{title}</span>
      </div>
      <span className="text-purple-400 text-xs font-bold">{value}</span>
    </div>
  )
}

function ActivityItem({ icon, title, time, color, onClick }) {
  const getTimeColor = (t) => {
    if (t.includes("2h")) return "text-red-400"
    if (t.includes("5h")) return "text-blue-400"
    return "text-green-400"
  }
  return (
    <div onClick={onClick} className="flex items-center gap-3 bg-[#111827] rounded-xl px-3 py-1.5 cursor-pointer hover:bg-[#1e293b] transition">
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
      <h3 className="text-[11px] font-medium text-white whitespace-nowrap flex-1">{title}</h3>
      <div className={`text-[10px] font-semibold whitespace-nowrap ${getTimeColor(time)}`}>{time}</div>
    </div>
  )
}

function DeadlineItem({ title, days, onClick }) {
  const num = parseInt(days)
  let percent = 0, barColor = "", textColor = ""
  if (num <= 2) { percent = 20; barColor = "bg-red-500"; textColor = "text-red-400" }
  else if (num <= 4) { percent = 50; barColor = "bg-blue-500"; textColor = "text-blue-400" }
  else { percent = 100; barColor = "bg-green-500"; textColor = "text-green-400" }
  return (
    <div onClick={onClick} className="flex items-center gap-3 bg-[#111827] rounded-xl px-3 py-1.5 cursor-pointer hover:bg-[#1e293b] transition">
      <h3 className="text-[11px] font-medium text-white whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width:`${percent}%` }}/>
      </div>
      <div className={`text-[10px] font-semibold whitespace-nowrap ${textColor}`}>{days}</div>
    </div>
  )
}

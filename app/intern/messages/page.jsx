"use client"
import { useState, useEffect, useRef } from "react"
import InternSidebar from "../../../lib/internSidebar"
import { Search, Send, Paperclip, Phone, Video, Info, Download, User, FileText, CheckSquare, CalendarDays } from "lucide-react"
import { api, getInternUser } from "../../../lib/api"
import {
  KEY_INTERN_TO_MENTOR,
  KEY_MENTOR_TO_INTERN,
  MENTOR_CHANNEL_PRIYA,
  appendChatMessage,
  canonicalInternId,
  messageMatchesIntern,
} from "../../../lib/chatSync"

const CONTACTS = [
  { id:"rahul", name:"Rahul Sharma", role:"Mentor", online:true, unread:2, time:"10:30 AM", lastMsg:"Please check the API documentation.", avatar:"R", color:"#7C3AED", about:"Backend Developer at CodeCraft Solutions. 8+ years in Node.js, Express and MongoDB.", email:"rahul@codecraft.io", dept:"Backend Engineering",
    files:[{name:"login_requirements.pdf",size:"1.2 MB",color:"#ef4444"},{name:"api_flow_diagram.png",size:"850 KB",color:"#22c55e"},{name:"auth_structure.docx",size:"2.4 MB",color:"#3b82f6"}],
    tasks:[{name:"Build Login API",status:"In Progress",due:"May 25"},{name:"Write API Docs",status:"Pending",due:"Jun 8"}],
    schedule:[{day:"Mon",time:"10:00 AM - 11:00 AM"},{day:"Wed",time:"2:00 PM - 3:00 PM"},{day:"Fri",time:"4:00 PM - 5:00 PM"}],
    messages:[{from:"them",text:"Hi Arjun, how's the progress on the Login API task?",time:"10:20 AM"},{from:"me",text:"Hi Rahul! I have completed the API. Please check the documentation.",time:"10:22 AM"},{from:"them",text:"Great! Please share the GitHub link and a short demo video.",time:"10:26 AM"},{from:"them",text:"Please check the API documentation.",time:"10:28 AM"}] },
  { id:"priya", name:"Priya Verma", role:"Mentor", online:false, unread:0, time:"Yesterday", lastMsg:"Thanks for the update.", avatar:"P", color:"#ec4899", about:"Frontend Developer at CodeCraft Solutions. 6+ years.", email:"priya@codecraft.io", dept:"Frontend Engineering",
    files:[], tasks:[{name:"Create Dashboard UI",status:"Submitted",due:"May 30"}],
    schedule:[{day:"Tue",time:"11:00 AM - 12:00 PM"},{day:"Thu",time:"3:00 PM - 4:00 PM"}],
    messages:[{from:"them",text:"How is the frontend coming along?",time:"Yesterday"},{from:"me",text:"Almost done with the dashboard UI!",time:"Yesterday"},{from:"them",text:"Thanks for the update.",time:"Yesterday"}] },
  { id:"amit", name:"Amit Patel", role:"Mentor", online:false, unread:1, time:"Yesterday", lastMsg:"Let's discuss your project.", avatar:"A", color:"#f59e0b", about:"Full Stack Developer at Tech Solutions. 7+ years.", email:"amit@techsolutions.io", dept:"Full Stack",
    files:[], tasks:[{name:"Integrate MongoDB",status:"In Progress",due:"Jun 5"}],
    schedule:[{day:"Mon",time:"11:00 AM - 12:00 PM"},{day:"Fri",time:"2:00 PM - 3:00 PM"}],
    messages:[{from:"them",text:"Let's discuss your project.",time:"Yesterday"}] },
  { id:"team", name:"Team Frontend", role:"Group", online:true, unread:0, time:"May 19", lastMsg:"Sure, I'll update it.", avatar:"TF", color:"#06B6D4", about:"Frontend team group chat.", email:"team@codecraft.io", dept:"Frontend",
    files:[], tasks:[], schedule:[],
    messages:[{from:"them",text:"Can someone review the PR?",time:"May 19"},{from:"me",text:"Sure, I'll update it.",time:"May 19"}] },
  { id:"sneha", name:"Sneha Iyer", role:"Mentor", online:false, unread:0, time:"May 18", lastMsg:"Good progress!", avatar:"S", color:"#22c55e", about:"DevOps Engineer at CloudTech. 5+ years.", email:"sneha@cloudtech.io", dept:"DevOps",
    files:[], tasks:[{name:"Deploy Application",status:"Pending",due:"Jun 12"}],
    schedule:[{day:"Wed",time:"10:00 AM - 11:00 AM"}],
    messages:[{from:"them",text:"Good progress!",time:"May 18"}] },
]

const STA = {"In Progress":{c:"#06B6D4",bg:"rgba(6,182,212,0.15)"},Completed:{c:"#22c55e",bg:"rgba(34,197,94,0.15)"},Pending:{c:"#ef4444",bg:"rgba(239,68,68,0.15)"},Submitted:{c:"#3b82f6",bg:"rgba(59,130,246,0.15)"}}

const TABS = [
  { id:"Profile",   icon:User,         label:"Profile" },
  { id:"Files",     icon:FileText,     label:"Files" },
  { id:"Tasks",     icon:CheckSquare,  label:"Tasks" },
  { id:"Schedule",  icon:CalendarDays, label:"Schedule" },
]

export default function MessagesPage() {
  const [sel, setSel] = useState(CONTACTS[1])
  const [contactList, setContactList] = useState(CONTACTS)
  const [input, setInput] = useState("")
  const [activeTab, setActiveTab] = useState("Profile")
  const [chats, setChats] = useState(CONTACTS.reduce((a,c)=>({...a,[c.id]:c.messages}),{}))
  const fileRef = useRef(null)
  const chatEndRef = useRef(null)
  const seenMentorIds = useRef(new Set())

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}) },[chats,sel])

  // Poll localStorage for messages sent by mentor to this intern
  useEffect(() => {
    const processMessages = () => {
      try {
        const raw = localStorage.getItem(KEY_MENTOR_TO_INTERN)
        if (!raw) return
        const mentorMsgs = JSON.parse(raw)
        if (!Array.isArray(mentorMsgs) || !mentorMsgs.length) return

        const user = getInternUser()
        const incoming = mentorMsgs.filter(m => messageMatchesIntern(m, user))
        if (!incoming.length) return

        let lastForPreview = null
        setChats(prev => {
          const updated = { ...prev }
          incoming.forEach(m => {
            const dedupeKey = m.id || `${m.text}|${m.time}|${m.fromName}`
            if (seenMentorIds.current.has(dedupeKey)) return
            seenMentorIds.current.add(dedupeKey)

            const contactId = m.mentorContactId || MENTOR_CHANNEL_PRIYA
            updated[contactId] = [...(updated[contactId] || []), {
              id: m.id,
              from: "them",
              text: m.text,
              time: m.time,
              senderName: m.fromName || "Mentor",
              image: m.image,
            }]
            lastForPreview = { contactId, text: m.text, time: m.time }
          })
          return updated
        })

        if (lastForPreview) {
          setContactList(prev =>
            prev.map(c =>
              c.id === lastForPreview.contactId
                ? { ...c, lastMsg: lastForPreview.text, time: lastForPreview.time }
                : c
            )
          )
        }
      } catch {}
    }

    processMessages()
    const pollId = setInterval(processMessages, 800)
    const onStorage = (e) => {
      if (e.key === KEY_MENTOR_TO_INTERN) processMessages()
    }
    const onCustom = () => processMessages()
    window.addEventListener("storage", onStorage)
    window.addEventListener(KEY_MENTOR_TO_INTERN, onCustom)

    return () => {
      clearInterval(pollId)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(KEY_MENTOR_TO_INTERN, onCustom)
    }
  }, [])

  const send = async () => {
    if(!input.trim()) return
    const text = input.trim(); setInput("")
    const now = new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})
    // Always read fresh from localStorage at send time — never stale
    const freshUser = getInternUser()
    const loginName = freshUser?.fullName || freshUser?.name || "Intern"
    const myInternId = canonicalInternId(loginName, freshUser?.id ? `intern-${freshUser.id}` : null)
    setChats(p=>({...p,[sel.id]:[...(p[sel.id]||[]),{from:"me",text,time:now,senderName:loginName}]}))
    setContactList(p=>p.map(c=>c.id===sel.id?{...c,lastMsg:text,time:now}:c))
    if(freshUser?.id) api.sendMsg({ senderId:freshUser.id, receiverId:sel.id, text }).catch(()=>{})

    appendChatMessage(KEY_INTERN_TO_MENTOR, {
      to: sel.id,
      toName: sel.name,
      fromInternId: myInternId,
      fromName: loginName,
      text,
      time: now,
      id: Date.now().toString(),
    })
  }

  const shareFile = (e) => {
    const f = e.target.files[0]; if(!f) return
    const now = new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})
    const freshUser = getInternUser()
    const loginName = freshUser?.fullName || freshUser?.name || "Intern"

    if (f.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const imgData = ev.target.result
        const msg = { from:"me", text:"", image:imgData, fileName:f.name, time:now, senderName:loginName }
        setChats(p=>({...p,[sel.id]:[...(p[sel.id]||[]),msg]}))
        appendChatMessage(KEY_INTERN_TO_MENTOR, {
          to: sel.id,
          toName: sel.name,
          fromInternId: canonicalInternId(loginName, freshUser?.id ? `intern-${freshUser.id}` : null),
          fromName: loginName,
          text: `Photo: ${f.name}`,
          image: imgData,
          time: now,
          id: Date.now().toString(),
        })
      }
      reader.readAsDataURL(f)
    } else {
      setChats(p=>({...p,[sel.id]:[...(p[sel.id]||[]),{from:"me",text:`Attachment: ${f.name} (${(f.size/1024).toFixed(0)} KB)`,time:now,senderName:loginName}]}))
    }
    if(fileRef.current) fileRef.current.value = ""
  }

  const downloadFile = (f) => {
    const blob = new Blob([`File: ${f.name}`],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=f.name; a.click(); URL.revokeObjectURL(url)
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
      <InternSidebar active="Messages"/>

      {/* CONTACTS */}
      <div className="w-52 min-w-52 bg-[#020617] border-r border-[#1e293b] flex flex-col">
        <div className="p-3 border-b border-[#1e293b]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-sm font-bold">Messages</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2 text-gray-400" size={11}/>
            <input placeholder="Search conversations..." className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl py-1.5 pl-7 pr-2 text-xs outline-none"/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contactList.map(c=>(
            <button key={c.id} onClick={()=>{setSel(c);setActiveTab("Profile")}}
              className={`w-full flex items-center gap-2 p-2.5 border-b border-[#1e293b] text-left transition card-hover ${sel?.id===c.id?"bg-purple-600/10 border-l-2 border-l-purple-500":"hover:bg-[#0f172a]"}`}>
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:c.color+"33", color:c.color }}>{c.avatar}</div>
                {c.online&&<div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-[#020617]"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-white truncate">{c.name}</span>
                  <span className="text-[9px] text-gray-500 flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-[9px] text-gray-500 truncate">{c.lastMsg}</p>
              </div>
              {c.unread>0&&<div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[8px] font-bold flex-shrink-0">{c.unread}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 flex items-center justify-between px-4 border-b border-[#1e293b] bg-[#020617]/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:sel.color+"33", color:sel.color }}>{sel.avatar}</div>
            <div>
              <p className="text-xs font-semibold">{sel.name}</p>
              <div className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${sel.online?"bg-green-400":"bg-gray-500"}`}/><span className="text-[9px] text-gray-400">{sel.role} - {sel.online?"Online":"Offline"}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400">You: <span className="text-purple-400 font-medium">{getInternUser()?.fullName||getInternUser()?.name||"Intern"}</span></span>
            <div className="flex gap-1">
              {[Phone,Video,Info].map((Icon,i)=>(
                <button key={i} className="w-7 h-7 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-center hover:bg-[#1e293b]"><Icon size={13} className="text-gray-400"/></button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-center text-[9px] text-gray-500 py-1">May 20, 2025</div>
          {(chats[sel.id]||[]).map((msg,i)=>{
            const isMe = msg.from==="me"
            return (
              <div key={i} className={`flex ${isMe?"justify-end":"justify-start"}`}>
                <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${isMe?"bg-gradient-to-r from-cyan-500 to-purple-600":"bg-[#0f172a] border border-[#1e293b]"}`}>
                  {isMe && <p className="text-[9px] text-white/70 mb-0.5 font-medium">{msg.senderName || getInternUser()?.fullName || "You"}</p>}
                  {!isMe && <p className="text-[9px] text-purple-300 mb-0.5 font-medium">{sel.name}</p>}
                  {msg.image ? (
                    <img src={msg.image} alt={msg.fileName||"photo"} className="rounded-xl max-w-full max-h-48 object-cover cursor-pointer" onClick={()=>window.open(msg.image,"_blank")}/>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                  <p className={`text-[9px] mt-1 text-right ${isMe?"text-white/60":"text-gray-500"}`}>{msg.time}{isMe&&" delivered"}</p>
                </div>
              </div>
            )
          })}
          <div ref={chatEndRef}/>
        </div>
        <div className="p-3 border-t border-[#1e293b] flex-shrink-0">
          <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.zip" style={{ display:"none" }} onChange={shareFile}/>
          <div className="flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] rounded-2xl px-3 py-2">
            <button onClick={()=>fileRef.current?.click()} className="w-7 h-7 rounded-xl bg-[#111827] flex items-center justify-center hover:bg-[#1e293b]" title="Attach photo or file"><Paperclip size={13} className="text-gray-400"/></button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-xs"/>
            <button onClick={send} className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center"><Send size={13}/></button>
          </div>
        </div>
      </div>

      {/* DETAILS PANEL */}
      <div className="w-52 min-w-52 bg-[#020617] border-l border-[#1e293b] flex flex-col overflow-hidden">
        <div className="p-3 border-b border-[#1e293b]">
          <p className="text-xs font-bold mb-2">Conversation Details</p>
          <div className="flex flex-col items-center gap-1 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background:sel.color+"33", color:sel.color }}>{sel.avatar}</div>
            <p className="text-xs font-semibold">{sel.name}</p>
            <div className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${sel.online?"bg-green-400":"bg-gray-500"}`}/><span className="text-[9px] text-gray-400">{sel.online?"Online":"Offline"}</span></div>
          </div>
          {/* TABS — using Lucide icons, no emojis */}
          <div className="grid grid-cols-4 gap-1">
            {TABS.map(tab=>{
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition ${activeTab===tab.id?"bg-purple-600/20":"hover:bg-[#0f172a]"}`}>
                  <Icon size={14} className={activeTab===tab.id?"text-purple-400":"text-gray-500"}/>
                  <span className={`text-[8px] ${activeTab===tab.id?"text-purple-400":"text-gray-500"}`}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab==="Profile" && (
            <div className="space-y-2">
              {[["Name",sel.name],["Role",sel.role],["Email",sel.email],["Department",sel.dept]].map(([l,v])=>(
                <div key={l} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-2 card-hover">
                  <p className="text-[9px] text-gray-500 mb-0.5">{l}</p>
                  <p className="text-[10px] text-white font-medium">{v}</p>
                </div>
              ))}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-2">
                <p className="text-[9px] text-gray-500 mb-0.5">About</p>
                <p className="text-[10px] text-gray-300 leading-relaxed">{sel.about}</p>
              </div>
            </div>
          )}
          {activeTab==="Files" && (
            <div className="space-y-1.5">
              {sel.files?.length>0 ? sel.files.map(f=>(
                <div key={f.name} className="flex items-center justify-between bg-[#0f172a] border border-[#1e293b] rounded-xl p-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold" style={{ background:f.color+"33", color:f.color }}>{f.name.split(".").pop().toUpperCase().slice(0,3)}</div>
                    <div><p className="text-[9px] text-white truncate max-w-[90px]">{f.name}</p><p className="text-[8px] text-gray-500">{f.size}</p></div>
                  </div>
                  <button onClick={()=>downloadFile(f)}><Download size={11} className="text-cyan-400"/></button>
                </div>
              )) : <p className="text-[10px] text-gray-500 text-center py-4">No shared files</p>}
            </div>
          )}
          {activeTab==="Tasks" && (
            <div className="space-y-1.5">
              {sel.tasks?.length>0 ? sel.tasks.map((t,i)=>(
                <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-2">
                  <p className="text-[10px] text-white font-medium mb-1">{t.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color:STA[t.status]?.c, background:STA[t.status]?.bg }}>{t.status}</span>
                    <span className="text-[9px] text-gray-500">Due {t.due}</span>
                  </div>
                </div>
              )) : <p className="text-[10px] text-gray-500 text-center py-4">No tasks</p>}
            </div>
          )}
          {activeTab==="Schedule" && (
            <div className="space-y-1.5">
              {sel.schedule?.length>0 ? sel.schedule.map((s,i)=>(
                <div key={i} className="bg-[#0f172a] border border-purple-600/20 rounded-xl p-2">
                  <p className="text-[10px] font-semibold text-purple-400">{s.day}</p>
                  <p className="text-[9px] text-gray-400">{s.time}</p>
                </div>
              )) : <p className="text-[10px] text-gray-500 text-center py-4">No schedule</p>}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

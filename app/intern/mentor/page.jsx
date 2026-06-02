"use client"
import React, { useState, useEffect } from "react"
import InternSidebar from "../../../lib/internSidebar"
import { Search, MessageSquare, Plus, X, Save, Users, Zap, Calendar, Clock } from "lucide-react"
import { api, getUser } from "../../../lib/api"

const MENTORS = [
  {id:1,name:"Rahul Sharma",role:"Backend Developer",company:"CodeCraft Solutions",expertise:["Node.js","Express","MongoDB"],availability:"Mon–Fri\n10:00 AM–5:00 PM",available:true,experience:"8+ Years",completed:8,upcoming:2,avatar:"R",color:"#7C3AED"},
  {id:2,name:"Priya Verma",role:"Frontend Developer",company:"CodeCraft Solutions",expertise:["React","Next.js","Tailwind"],availability:"Mon–Sat\n9:00 AM–6:00 PM",available:true,experience:"6+ Years",completed:6,upcoming:1,avatar:"P",color:"#ec4899"},
  {id:3,name:"Amit Patel",role:"Full Stack Developer",company:"Tech Solutions",expertise:["JavaScript","Node.js","React"],availability:"Mon–Fri\n11:00 AM–7:00 PM",available:false,experience:"7+ Years",completed:5,upcoming:1,avatar:"A",color:"#f59e0b"},
  {id:4,name:"Sneha Iyer",role:"DevOps Engineer",company:"CloudTech",expertise:["AWS","Docker","CI/CD"],availability:"Mon–Fri\n10:00 AM–4:00 PM",available:true,experience:"5+ Years",completed:4,upcoming:0,avatar:"S",color:"#22c55e"},
  {id:5,name:"Vikram Singh",role:"Data Scientist",company:"DataLabs Inc",expertise:["Python","ML","TensorFlow"],availability:"Mon–Thu\n9:00 AM–5:00 PM",available:true,experience:"4+ Years",completed:3,upcoming:1,avatar:"V",color:"#06B6D4"},
]

const EX_COLORS = { "Node.js":"#7C3AED","Express":"#06B6D4","MongoDB":"#22c55e","React":"#3b82f6","Next.js":"#7C3AED","Tailwind":"#06B6D4","JavaScript":"#f59e0b","AWS":"#f97316","Docker":"#3b82f6","CI/CD":"#22c55e","Python":"#3b82f6","ML":"#7C3AED","TensorFlow":"#f97316" }

export default function MentorPage() {
  const router_push = (path) => window.location.href = path
  const [search, setSearch] = useState("")
  const [connecting, setConnecting] = useState(null)
  const [mentors, setMentors] = useState(MENTORS)
  const [expandedId, setExpandedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [form, setForm] = useState({ name:"", role:"", company:"", experience:"", availability:"Mon–Fri\n9:00 AM–5:00 PM", expertise:[], available:true })

  useEffect(() => {
    api.getMentors().then(r=>{
      if(r.ok&&r.data?.length){
        setMentors(r.data.map((m,i)=>({ id:m._id||m.id||i, name:m.name, role:m.role, company:m.company, expertise:m.expertise||[], availability:m.availability||"Mon–Fri", available:m.available??true, experience:m.experience||"", completed:m.sessionsCompleted||0, upcoming:m.sessionsUpcoming||0, avatar:(m.name||"?").charAt(0), color:["#7C3AED","#ec4899","#f59e0b","#22c55e","#06B6D4"][i%5] })))
      }
    }).catch(()=>{})
  },[])

  const connect = async (id) => {
    setConnecting(id)
    const user = getUser()
    await api.connect(id,{ internId:user.id }).catch(()=>{})
    setMentors(p=>p.map(m=>m.id===id?{...m,upcoming:m.upcoming+1}:m))
    setConnecting(null)
  }

  const addMentor = async () => {
    if (!form.name.trim()||!form.role.trim()) return
    try { await fetch("https://intern-portal-backend-dw9j.onrender.com/mentors/add",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) }) } catch {}
    setMentors(p=>[...p,{ ...form, id:Date.now(), completed:0, upcoming:0, avatar:form.name.charAt(0).toUpperCase(), color:["#7C3AED","#ec4899","#f59e0b","#22c55e","#06B6D4"][p.length%5] }])
    setForm({ name:"", role:"", company:"", experience:"", availability:"Mon–Fri\n9:00 AM–5:00 PM", expertise:[], available:true }); setShowAdd(false)
  }

  const stats = { total:mentors.length, active:mentors.filter(m=>m.available).length, completed:mentors.reduce((s,m)=>s+m.completed,0), upcoming:mentors.reduce((s,m)=>s+m.upcoming,0) }
  const filtered = mentors.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())||m.expertise.some(e=>e.toLowerCase().includes(search.toLowerCase())))

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
      <InternSidebar active="Mentor"/>
      <main className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Mentor</h1>
            <p className="text-gray-400 text-xs mt-0.5">Connect with mentors and get guidance throughout your internship.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 text-gray-400" size={12}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search mentors or skills…" className="bg-[#0f172a] border border-[#1e293b] rounded-xl py-2 pl-7 pr-3 text-xs outline-none w-48"/>
            </div>
            <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-semibold">
              <Plus size={13}/> Add Mentor
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-3 flex-shrink-0">
          {[{l:"Total Mentors",v:stats.total,c:"#7C3AED",Icon:Users},{l:"Active Mentors",v:stats.active,c:"#06B6D4",Icon:Zap},{l:"Sessions Completed",v:stats.completed,c:"#22c55e",Icon:Calendar},{l:"Upcoming Sessions",v:stats.upcoming,c:"#f59e0b",Icon:Clock}].map((s,i)=>(
            <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3 card-hover">
              <div className="flex items-center gap-2 mb-2"><s.Icon size={14} style={{ color:s.c }}/><span className="text-[10px] text-gray-400">{s.l}</span></div>
              <div className="text-2xl font-bold" style={{ color:s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden flex-1 flex flex-col min-h-0">
          <table className="w-full border-collapse flex-shrink-0">
            <thead><tr className="border-b border-[#1e293b]">
              {["Mentor","Expertise","Availability","Experience","Sessions","Action"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] text-gray-400 font-medium">{h}</th>)}
            </tr></thead>
          </table>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse">
              <tbody>
                {filtered.map(m=>(
                  <React.Fragment key={m.id}>
                    <tr className="border-b border-[#1e293b] transition cursor-pointer row-hover" onClick={()=>setExpandedId(expandedId===m.id?null:m.id)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background:m.color+"33", color:m.color }}>{m.avatar}</div>
                          <div>
                            <p className="text-xs font-medium text-white">{m.name}</p>
                            <p className="text-[9px] text-gray-400">{m.role}</p>
                            <p className="text-[9px] text-gray-500">{m.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {m.expertise.map(e=><span key={e} className="px-1.5 py-0.5 rounded-lg text-[9px] font-medium" style={{ background:(EX_COLORS[e]||"#7C3AED")+"22", color:EX_COLORS[e]||"#7C3AED" }}>{e}</span>)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-white whitespace-pre-line">{m.availability}</p>
                        <p className={`text-[9px] mt-0.5 ${m.available?"text-green-400":"text-yellow-400"}`}>{m.available?"• Available":"• Busy"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-white">{m.experience}</td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-white">{m.completed} Completed</p>
                        <p className="text-[9px] text-gray-400">{m.upcoming} Upcoming</p>
                      </td>
                      <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                        <div className="flex gap-2 items-center">
                          <button onClick={()=>connect(m.id)} disabled={connecting===m.id}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-[10px] font-semibold disabled:opacity-60">
                            {connecting===m.id?"Connecting…":"Connect"}
                          </button>
                          <button onClick={()=>router_push("/intern/messages")} className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:bg-[#1e293b]">
                            <MessageSquare size={12} className="text-gray-400"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId===m.id && (
                      <tr className="border-b border-[#1e293b] bg-purple-600/5">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#111827] rounded-xl p-3">
                              <p className="text-[9px] text-gray-400 mb-1">About</p>
                              <p className="text-[10px] text-white">{m.name} is a {m.role} at {m.company} with {m.experience} of experience.</p>
                            </div>
                            <div className="bg-[#111827] rounded-xl p-3">
                              <p className="text-[9px] text-gray-400 mb-2">All Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {m.expertise.map(e=><span key={e} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background:(EX_COLORS[e]||"#7C3AED")+"22", color:EX_COLORS[e]||"#7C3AED" }}>{e}</span>)}
                              </div>
                            </div>
                            <div className="bg-[#111827] rounded-xl p-3">
                              <p className="text-[9px] text-gray-400 mb-1">Session Stats</p>
                              <p className="text-xl font-bold text-white">{m.completed+m.upcoming}</p>
                              <p className="text-[9px] text-gray-400">{m.completed} completed · {m.upcoming} upcoming</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ADD MENTOR MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-[440px] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold">➕ Add New Mentor</span>
              <button onClick={()=>setShowAdd(false)}><X size={14} className="text-gray-400"/></button>
            </div>
            <div className="space-y-3">
              {[{l:"Full Name *",k:"name",p:"e.g. Rahul Sharma"},{l:"Role *",k:"role",p:"e.g. Backend Developer"},{l:"Company",k:"company",p:"e.g. CodeCraft Solutions"},{l:"Experience",k:"experience",p:"e.g. 5+ Years"}].map(f=>(
                <div key={f.k}>
                  <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                  <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} className={inp}/>
                </div>
              ))}
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Availability</label>
                <textarea rows={2} value={form.availability} onChange={e=>setForm(p=>({...p,availability:e.target.value}))} className={`${inp} resize-none`}/>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-2">Skills / Expertise</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.expertise.map(s=>(
                    <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-600/20 border border-purple-600/30 text-purple-400 text-[10px]">
                      {s}<button onClick={()=>setForm(p=>({...p,expertise:p.expertise.filter(x=>x!==s)}))} className="ml-0.5"><X size={8}/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={e=>e.key==="Enter"&&newSkill.trim()&&(setForm(p=>({...p,expertise:[...p.expertise,newSkill.trim()]})),setNewSkill(""))} placeholder="Add skill…" className={`${inp} flex-1`}/>
                  <button onClick={()=>newSkill.trim()&&(setForm(p=>({...p,expertise:[...p.expertise,newSkill.trim()]})),setNewSkill(""))} className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs"><Plus size={12}/></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-[#111827] rounded-xl px-3 py-2">
                <span className="text-xs text-white">Currently Available</span>
                <button onClick={()=>setForm(p=>({...p,available:!p.available}))} className="w-9 h-5 rounded-full relative border-none cursor-pointer" style={{ background:form.available?"linear-gradient(135deg,#7C3AED,#06B6D4)":"rgba(255,255,255,0.1)" }}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left:form.available?"calc(100% - 18px)":"2px" }}/>
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowAdd(false)} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
              <button onClick={addMentor} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold flex items-center justify-center gap-1"><Save size={12}/> Add Mentor</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}


"use client"
import { useState, useRef, useEffect } from "react"
import InternSidebar from "../../../lib/internSidebar"
import { Camera, Save, LogOut, Bell, Shield, Eye, Palette, User, Trash2, Lock, Moon, Sun, Plus, X, FolderOpen } from "lucide-react"
import { api, getUser } from "../../../lib/api"
import { useRouter } from "next/navigation"

const MENU = [
  { icon:User,    label:"Profile",       desc:"Personal info & skills" },
  { icon:Shield,  label:"Security",      desc:"Password & 2FA" },
  { icon:Bell,    label:"Notifications", desc:"Alerts & reminders" },
  { icon:Palette, label:"Appearance",    desc:"Theme & display" },
  { icon:Eye,     label:"Privacy",       desc:"Data & visibility" },
  { icon:Trash2,  label:"Account",       desc:"Manage account" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [active, setActive] = useState("Profile")
  const [hov, setHov] = useState(null)
  const [theme, setTheme] = useState("dark")
  const [lang, setLang] = useState("en")
  const [notifs, setNotifs] = useState({ email:true, push:true, tasks:false, journal:true })
  const [privacy, setPrivacy] = useState({ profileVisible:true, activityVisible:false })
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState("")
  const [form, setForm] = useState({ name:"", email:"", role:"", bio:"", phone:"" })
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [photo, setPhoto] = useState(null)
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const photoRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  // Security
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [conf, setConf] = useState("")
  const [show, setShow] = useState({ cur:false, nw:false, conf:false })
  const [twoFA, setTwoFA] = useState(false)
  const [pwMsg, setPwMsg] = useState(""); const [pwErr, setPwErr] = useState("")

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem("user")||"{}"); if(u.fullName) setForm(f=>({...f,name:u.fullName,email:u.email||"",role:u.role||""})); if(u.photo) setPhoto(u.photo) } catch {}
    const user = getUser()
    if(!user.id) return
    api.profile(user.id).then(r=>{ if(r.ok&&r.data){ setForm({ name:r.data.fullName||"", email:r.data.email||"", role:r.data.role||"intern", bio:r.data.bio||"", phone:r.data.phone||"" }); if(r.data.skills?.length) setSkills(r.data.skills) } }).catch(()=>{})
    api.getSettings(user.id).then(r=>{ if(r.ok&&r.data) setNotifs({ email:r.data.emailNotifications??true, push:r.data.pushNotifications??true, tasks:r.data.taskReminders??false, journal:true }) }).catch(()=>{})
  },[])

  const handleSave = async () => {
    setSaveError("")
    const user = getUser()
    if(user.id){ const r = await api.updateProfile(user.id,{ fullName:form.name, bio:form.bio, role:form.role, skills, phone:form.phone }); if(!r.ok){ setSaveError("Save failed"); return } }
    const updated = { ...getUser(), fullName:form.name, role:form.role, ...(photo?{photo}:{}) }
    localStorage.setItem("user",JSON.stringify(updated)); window.dispatchEvent(new Event("storage"))
    setSaved(true); setTimeout(()=>setSaved(false),2500)
  }

  const handlePhoto = (e) => {
    const f = e.target.files[0]; if(!f) return
    const reader = new FileReader()
    reader.onload = ev => { const url=ev.target.result; setPhoto(url); const u=getUser(); localStorage.setItem("user",JSON.stringify({...u,photo:url})); window.dispatchEvent(new Event("storage")) }
    reader.readAsDataURL(f)
  }

  const openCamera = async () => {
    setShowCamera(true); setShowPhotoMenu(false)
    try { const stream = await navigator.mediaDevices.getUserMedia({video:true}); streamRef.current=stream; setTimeout(()=>{ if(videoRef.current) videoRef.current.srcObject=stream },100) }
    catch { alert("Camera permission denied."); setShowCamera(false) }
  }

  const capturePhoto = () => {
    if(!videoRef.current||!canvasRef.current) return
    const canvas=canvasRef.current; canvas.width=videoRef.current.videoWidth; canvas.height=videoRef.current.videoHeight
    canvas.getContext("2d").drawImage(videoRef.current,0,0)
    const url=canvas.toDataURL("image/jpeg"); setPhoto(url)
    const u=getUser(); localStorage.setItem("user",JSON.stringify({...u,photo:url})); window.dispatchEvent(new Event("storage"))
    streamRef.current?.getTracks().forEach(t=>t.stop()); setShowCamera(false)
  }

  const changePw = async () => {
    setPwMsg(""); setPwErr("")
    if(!cur){setPwErr("Enter current password");return}
    if(!nw||nw.length<6){setPwErr("New password must be at least 6 characters");return}
    if(nw!==conf){setPwErr("Passwords do not match");return}
    const user=getUser()
    try {
      const res = await fetch("https://intern-portal-backend-dw9j.onrender.com/auth/change-password",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId:user.id, currentPassword:cur, newPassword:nw }) })
      const data = await res.json()
      if(res.ok){ setPwMsg("Saved! Password updated!"); setCur(""); setNw(""); setConf("") } else setPwErr(data.error||"Update failed")
    } catch { setPwErr("Cannot connect to server.") }
  }

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/login") }

  const inp = "w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs outline-none text-white"
  const Toggle = ({ val, onChange }) => (
    <button onClick={()=>onChange(!val)} className="w-9 h-5 rounded-full relative border-none cursor-pointer flex-shrink-0" style={{ background:val?"linear-gradient(135deg,#7C3AED,#06B6D4)":"rgba(255,255,255,0.1)" }}>
      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left:val?"calc(100% - 18px)":"2px" }}/>
    </button>
  )

  const renderContent = () => {
    switch(active) {
      case "Profile": return (
        <div className="space-y-4">
          <p className="text-sm font-bold">Profile Settings</p>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-xl font-bold overflow-hidden border-2 border-purple-500/40">
                {photo?<img src={photo} className="w-full h-full object-cover" alt="profile"/>:form.name.charAt(0).toUpperCase()||"A"}
              </div>
              <button onClick={()=>setShowPhotoMenu(!showPhotoMenu)} className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-purple-600 border-2 border-[#020617] flex items-center justify-center">
                <Camera size={11} color="white"/>
              </button>
              {showPhotoMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden z-10 w-44">
                  <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#1e293b] text-xs border-b border-[#1e293b]">
                    <FolderOpen size={12}/> Choose from Files
                    <input ref={photoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{handlePhoto(e);setShowPhotoMenu(false)}}/>
                  </label>
                  <button onClick={openCamera} className="flex items-center gap-2 px-3 py-2 hover:bg-[#1e293b] text-xs w-full text-left"><Camera size={12}/> Take a Photo</button>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold">{form.name||"Your Name"}</p>
              <p className="text-[10px] text-gray-400 capitalize">{form.role||"intern"}</p>
              <button onClick={()=>setShowPhotoMenu(!showPhotoMenu)} className="mt-1 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-600/30 text-purple-400 text-[10px] flex items-center gap-1"><Camera size={10}/> Change Photo</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{l:"Full Name",k:"name"},{l:"Email",k:"email"},{l:"Role",k:"role"},{l:"Phone",k:"phone"}].map(f=>(
              <div key={f.k}><label className="text-[10px] text-gray-400 block mb-1">{f.l}</label><input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} className={inp}/></div>
            ))}
          </div>
          <div><label className="text-[10px] text-gray-400 block mb-1">Bio</label><textarea rows={2} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} className={`${inp} resize-none`}/></div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-2">Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map(s=><span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-600/20 border border-purple-600/30 text-purple-400 text-[10px]">{s}<button onClick={()=>setSkills(p=>p.filter(x=>x!==s))}><X size={8}/></button></span>)}
            </div>
            <div className="flex gap-2">
              <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={e=>e.key==="Enter"&&newSkill.trim()&&(setSkills(p=>[...p,newSkill.trim()]),setNewSkill(""))} placeholder="Add skill..." className={`${inp} flex-1`}/>
              <button onClick={()=>newSkill.trim()&&(setSkills(p=>[...p,newSkill.trim()]),setNewSkill(""))} className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs"><Plus size={12}/></button>
            </div>
          </div>
          {saveError && <p className="text-[10px] text-red-400"> {saveError}</p>}
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">
            <Save size={13}/> {saved?"Saved! Saved!":"Save Changes"}
          </button>
        </div>
      )
      case "Security": return (
        <div className="space-y-4 max-w-md">
          <p className="text-sm font-bold">Security Settings</p>
          {[{l:"Current Password",k:"cur",v:cur,set:setCur},{l:"New Password",k:"nw",v:nw,set:setNw},{l:"Confirm New Password",k:"conf",v:conf,set:setConf}].map(f=>(
            <div key={f.k}>
              <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
              <div className="relative">
                <Lock size={11} className="absolute left-3 top-2.5 text-gray-400"/>
                <input type={show[f.k]?"text":"password"} value={f.v} onChange={e=>f.set(e.target.value)} className={`${inp} pl-8 pr-8`}/>
                <button type="button" onClick={()=>setShow(p=>({...p,[f.k]:!p[f.k]}))} className="absolute right-3 top-2.5 text-gray-400">{show[f.k]?<Eye size={11}/>:<Lock size={11}/>}</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between bg-[#111827] rounded-xl px-3 py-2.5">
            <div><p className="text-xs font-medium">Two-Factor Authentication</p><p className="text-[9px] text-gray-400">Add extra security to your account</p></div>
            <Toggle val={twoFA} onChange={setTwoFA}/>
          </div>
          {pwErr && <p className="text-[10px] text-red-400"> {pwErr}</p>}
          {pwMsg && <p className="text-[10px] text-green-400">{pwMsg}</p>}
          <button onClick={changePw} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold"><Save size={13}/> Update Password</button>
        </div>
      )
      case "Notifications": return (
        <div className="space-y-3 max-w-md">
          <p className="text-sm font-bold">Notification Preferences</p>
          {[{k:"email",l:"Email Notifications",d:"Receive updates via email"},{k:"push",l:"Push Notifications",d:"Browser push notifications"},{k:"tasks",l:"Task Reminders",d:"Reminders for upcoming deadlines"},{k:"journal",l:"Journal Reminders",d:"Daily journal writing reminders"}].map(item=>(
            <div key={item.k} className="flex items-center justify-between bg-[#111827] rounded-xl px-3 py-2.5">
              <div><p className="text-xs font-medium">{item.l}</p><p className="text-[9px] text-gray-400">{item.d}</p></div>
              <Toggle val={notifs[item.k]} onChange={v=>{ const u={...notifs,[item.k]:v}; setNotifs(u); const user=getUser(); if(user.id) api.updateSettings(user.id,{ emailNotifications:u.email, pushNotifications:u.push, taskReminders:u.tasks }).catch(()=>{}) }}/>
            </div>
          ))}
        </div>
      )
      case "Appearance": return (
        <div className="space-y-4 max-w-md">
          <p className="text-sm font-bold">Appearance</p>
          <div>
            <p className="text-xs font-medium mb-2">Theme</p>
            <div className="grid grid-cols-2 gap-3">
              {[{v:"dark",label:"Dark Mode",icon:<Moon size={16}/>,desc:"Black & blue futuristic UI"},{v:"light",label:"Light Mode",icon:<Sun size={16}/>,desc:"Clean light interface"}].map(t=>(
                <button key={t.v} onClick={()=>setTheme(t.v)} className={`text-left p-3 rounded-xl border-2 transition ${theme===t.v?"border-purple-500 bg-purple-600/10":"border-[#1e293b] bg-[#111827]"}`}>
                  <div className={`mb-1.5 ${theme===t.v?"text-purple-400":"text-gray-400"}`}>{t.icon}</div>
                  <p className="text-xs font-medium">{t.label}</p>
                  <p className="text-[9px] text-gray-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-2">Language</p>
            <div className="flex gap-2">
              {[{v:"en",l:"English"},{v:"hi",l:"à¤¹à¤¿à¤‚à¤¦à¥€"},{v:"es",l:"EspaÃ±ol"}].map(l=>(
                <button key={l.v} onClick={()=>setLang(l.v)} className={`px-4 py-2 rounded-xl text-xs font-medium transition ${lang===l.v?"bg-gradient-to-r from-cyan-500 to-purple-600 text-white":"bg-[#111827] border border-[#1e293b] text-gray-400"}`}>{l.l}</button>
              ))}
            </div>
          </div>
        </div>
      )
      case "Privacy": return (
        <div className="space-y-3 max-w-md">
          <p className="text-sm font-bold">Privacy Settings</p>
          {[{k:"profileVisible",l:"Public Profile",d:"Allow others to see your profile"},{k:"activityVisible",l:"Activity Visibility",d:"Show your activity to mentors"}].map(item=>(
            <div key={item.k} className="flex items-center justify-between bg-[#111827] rounded-xl px-3 py-2.5">
              <div><p className="text-xs font-medium">{item.l}</p><p className="text-[9px] text-gray-400">{item.d}</p></div>
              <Toggle val={privacy[item.k]} onChange={v=>setPrivacy(p=>({...p,[item.k]:v}))}/>
            </div>
          ))}
          <div className="bg-[#111827] rounded-xl p-3">
            <p className="text-xs font-medium mb-1">Data Export</p>
            <p className="text-[9px] text-gray-400 mb-2">Download all your data as a JSON file</p>
            <button onClick={async()=>{ const user=getUser(); const tasks=await api.getTasks(user.id).then(r=>r.data||[]).catch(()=>[]); const journals=await api.getJournals(user.id).then(r=>r.data||[]).catch(()=>[]); const blob=new Blob([JSON.stringify({user,tasks,journals,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`internportal_data_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url) }} className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px]">â¬‡ Export My Data</button>
          </div>
        </div>
      )
      case "Account": return (
        <div className="space-y-3 max-w-md">
          <p className="text-sm font-bold">Account Management</p>
          {/* Add Account */}
          <div className="bg-[#111827] rounded-xl p-3">
            <p className="text-xs font-medium mb-1">Add Another Account</p>
            <p className="text-[9px] text-gray-400 mb-2">Sign in with a different account</p>
            <button onClick={()=>router.push("/login")} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-[10px] font-semibold text-white">
              + Add Account
            </button>
          </div>
          {/* Logout */}
          <div className="bg-[#111827] rounded-xl p-3">
            <p className="text-xs font-medium mb-1">Logout</p>
            <p className="text-[9px] text-gray-400 mb-2">Sign out from this device</p>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-[10px]">
              <LogOut size={11}/> Logout
            </button>
          </div>
          {/* Delete Account */}
          <div className="bg-[#111827] border border-red-500/20 rounded-xl p-3">
            <p className="text-xs font-medium text-red-400 mb-1">Delete Account</p>
            <p className="text-[9px] text-gray-400 mb-2">Permanently delete your account and all data. This cannot be undone.</p>
            <button onClick={async()=>{ if(!confirm("Are you sure? This will permanently delete your account.")) return; const user=getUser(); if(user.id) await fetch(`https://intern-portal-backend-dw9j.onrender.com/auth/profile/${user.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}}).catch(()=>{}); localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/signup") }} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-[10px]">
              <Trash2 size={11}/> Delete Account
            </button>
          </div>
        </div>
      )
      default: return null
    }
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
      <InternSidebar active="Settings"/>
      {/* SETTINGS LEFT MENU */}
      <div className="w-48 min-w-48 bg-[#020617] border-r border-[#1e293b] flex flex-col p-2 gap-1">
        <p className="text-[9px] font-semibold text-gray-500 px-2 py-2 tracking-widest">SETTINGS</p>
        {MENU.map(item=>{
          const Icon=item.icon; const isA=active===item.label
          return (
            <button key={item.label} onClick={()=>setActive(item.label)} onMouseEnter={()=>setHov(item.label)} onMouseLeave={()=>setHov(null)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition ${isA?"bg-purple-600/20 border border-purple-600/30":"hover:bg-[#0f172a]"}`}>
              <Icon size={13} className={isA?"text-purple-400":hov===item.label?"text-purple-300":"text-gray-400"}/>
              <div>
                <p className={`text-[11px] font-medium ${isA?"text-white":"text-gray-400"}`}>{item.label}</p>
                <p className="text-[9px] text-gray-500">{item.desc}</p>
              </div>
            </button>
          )
        })}
        <div className="mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px]">
            <LogOut size={12}/> Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

      {/* WEBCAM MODAL */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-[440px] flex flex-col items-center gap-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-bold flex items-center gap-2"><Camera size={14}/> Take a Photo</span>
              <button onClick={()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); setShowCamera(false) }}><X size={14} className="text-gray-400"/></button>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl bg-black max-h-64 object-cover"/>
            <canvas ref={canvasRef} style={{ display:"none" }}/>
            <div className="flex gap-3 w-full">
              <button onClick={()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); setShowCamera(false) }} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
              <button onClick={capturePhoto} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold flex items-center justify-center gap-1"><Camera size={12}/> Capture Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}


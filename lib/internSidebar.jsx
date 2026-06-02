"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  LayoutDashboard, ClipboardList, BookOpenCheck, FileText,
  BarChart3, Calendar, MessageSquare, User, Settings,
  GraduationCap, ChevronDown, LogOut, UserPlus, Star,
} from "lucide-react"
import { getInternUser } from "./api"

const menuItems = [
  { icon: LayoutDashboard, title: "Dashboard",  path: "/intern/dashboard" },
  { icon: ClipboardList,   title: "Tasks",       path: "/intern/tasks" },
  { icon: BookOpenCheck,   title: "Attendance",  path: "/intern/attendance" },
  { icon: FileText,        title: "Journals",    path: "/intern/journals" },
  { icon: Star,            title: "Evaluation",  path: "/intern/evaluation" },
  { icon: BarChart3,       title: "Analytics",   path: "/intern/analytics" },
  { icon: Calendar,        title: "Calendar",    path: "/intern/calendar" },
  { icon: MessageSquare,   title: "Messages",    path: "/intern/messages" },
  { icon: User,            title: "Mentor",      path: "/intern/mentor" },
  { icon: Settings,        title: "Settings",    path: "/intern/settings" },
]

export default function InternSidebar({ active }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [userName, setUserName] = useState("User")
  const [userRole, setUserRole] = useState("Intern")
  const [userPhoto, setUserPhoto] = useState(null)

  useEffect(() => {
    const load = () => {
      try {
        // Use intern-specific key — won't be overwritten by other portal logins
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

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Determine active page from prop or pathname
  const activePage = active || menuItems.find(m => pathname?.startsWith(m.path))?.title || "Dashboard"

  return (
    <aside style={{
      width: "190px", minWidth: "190px", height: "100vh",
      background: "#020617", borderRight: "1px solid #1e293b",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "12px 10px"
    }}>
      {/* LOGO */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"20px", padding:"0 4px" }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"12px", background:"linear-gradient(135deg,#22d3ee,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <GraduationCap size={18} color="white"/>
          </div>
          <span style={{ fontSize:"16px", fontWeight:700, color:"white" }}>InternPortal</span>
        </div>

        {/* MENU — scrollable */}
        <div style={{ display:"flex", flexDirection:"column", gap:"2px", overflowY:"auto", maxHeight:"calc(100vh - 200px)" }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.title
            return (
              <button key={item.title} onClick={() => router.push(item.path)}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:"10px",
                  padding:"10px 12px", borderRadius:"12px", border:"none", cursor:"pointer",
                  fontSize:"14px", fontWeight: isActive ? 600 : 400,
                  background: isActive ? "linear-gradient(135deg,#06b6d4,#a855f7)" : "transparent",
                  color: isActive ? "white" : "#94a3b8",
                  transition:"all 0.15s",
                }}
                onMouseEnter={e => { if(!isActive) e.currentTarget.style.background="#111827"; if(!isActive) e.currentTarget.style.color="white" }}
                onMouseLeave={e => { if(!isActive) e.currentTarget.style.background="transparent"; if(!isActive) e.currentTarget.style.color="#94a3b8" }}>
                <Icon size={18} style={{ flexShrink:0 }}/>
                <span>{item.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* PROFILE */}
      <div style={{ position:"relative", background:"#0f172a", borderRadius:"16px", padding:"12px", border:"1px solid #1e293b" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#a855f7,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:700, color:"white", flexShrink:0, overflow:"hidden" }}>
              {userPhoto ? <img src={userPhoto} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="p"/> : userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize:"13px", fontWeight:600, color:"white", lineHeight:1.2 }}>{userName}</p>
              <p style={{ fontSize:"11px", color:"#94a3b8", textTransform:"capitalize" }}>{userRole}</p>
            </div>
          </div>
          <button onClick={() => setShowMenu(!showMenu)} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}>
            <ChevronDown size={14}/>
          </button>
        </div>

        {showMenu && (
          <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"4px", right:"4px", background:"#111827", border:"1px solid #1e293b", borderRadius:"12px", overflow:"hidden", zIndex:50 }}>
            <button onClick={() => { setShowMenu(false); router.push("/login") }}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"10px 12px", background:"none", border:"none", cursor:"pointer", fontSize:"13px", color:"#e2e8f0" }}
              onMouseEnter={e=>e.currentTarget.style.background="#1e293b"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <UserPlus size={14}/> Add Account
            </button>
            <button onClick={handleLogout}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"10px 12px", background:"none", border:"none", cursor:"pointer", fontSize:"13px", color:"#f87171" }}
              onMouseEnter={e=>e.currentTarget.style.background="#1e293b"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <LogOut size={14}/> Logout
            </button>
          </div>
        )}

        <div style={{ marginTop:"12px" }}>
          <p style={{ fontSize:"11px", color:"#94a3b8" }}>Internship Progress</p>
          <p style={{ fontSize:"22px", fontWeight:700, color:"white", marginTop:"2px" }}>75%</p>
          <div style={{ width:"100%", height:"6px", background:"#1e293b", borderRadius:"999px", marginTop:"6px", overflow:"hidden" }}>
            <div style={{ width:"75%", height:"100%", background:"linear-gradient(90deg,#22d3ee,#a855f7)", borderRadius:"999px" }}/>
          </div>
          <p style={{ fontSize:"11px", color:"#94a3b8", marginTop:"4px" }}>28 Days Left</p>
        </div>
      </div>
    </aside>
  )
}

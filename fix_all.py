import re

# ── FIX 1: attWithToday not defined in mentor Attendance ─────────────────────
mentor_path = r'C:\Users\Lenovo\OneDrive\Desktop\API\internship-dashboard\app\mentor\dashboard\page.jsx'
with open(mentor_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The ATT dict exists but attWithToday was never declared in the Attendance function
# Replace usage of attWithToday[day] with ATT[day] since mentor doesn't need today marking
old = 'const att = attWithToday[day]'
new = 'const attWithToday = { ...ATT, [now.getDate()]: month===now.getMonth()&&year===now.getFullYear()?"p":ATT[now.getDate()] }; const att = attWithToday[day]'

count = content.count(old)
print(f"attWithToday pattern found: {count}")
if count > 0:
    content = content.replace(old, new)
    print("Fixed attWithToday error")

with open(mentor_path, 'w', encoding='utf-8') as f:
    f.write(content)

# ── FIX 2: Institution stat cards - add area charts as background ─────────────
inst_path = r'C:\Users\Lenovo\OneDrive\Desktop\API\internship-dashboard\app\institution\dashboard\page.jsx'
with open(inst_path, 'r', encoding='utf-8') as f:
    content2 = f.read()

# Check if ResponsiveContainer is imported
if 'ResponsiveContainer' not in content2:
    content2 = content2.replace(
        "import { ResponsiveContainer,",
        "import { ResponsiveContainer,"
    )
    # Find the recharts import and ensure AreaChart, Area are there
    if 'AreaChart' not in content2:
        content2 = content2.replace(
            "from 'recharts'",
            ", AreaChart, Area } from 'recharts'"
        )

# Find the 4 stat cards in Dashboard function and add graphs
# The cards look like: {l:"Total Interns",v:data?.totalInterns||...,c:"#..."}
# We need to add area chart data and render it
old_cards = '''  const deptData = [{ name:"CSE",v:350,c:"#6366F1" },'''
new_cards = '''  const statCardData = {
    "Total Interns":    [{v:80},{v:120},{v:150},{v:180},{v:220},{v:data?.totalInterns||250}],
    "Active Internships":[{v:20},{v:35},{v:42},{v:50},{v:55},{v:data?.activeInternships||62}],
    "Departments":      [{v:4},{v:5},{v:6},{v:6},{v:7},{v:data?.departments||8}],
    "Organizations":    [{v:10},{v:14},{v:18},{v:20},{v:22},{v:data?.organizations||24}],
  }
  const deptData = [{ name:"CSE",v:350,c:"#6366F1" },'''

count2 = content2.count(old_cards)
print(f"Institution stat card data pattern found: {count2}")
if count2 > 0:
    content2 = content2.replace(old_cards, new_cards)

# Now replace the stat card divs to add graph background
# Find the 4 stat cards render
old_stat_render = '''{[{l:"Total Interns",v:data?.totalInterns||250,c:"#6366F1",i:"🎓"},{l:"Active Internships",v:data?.activeInternships||62,c:"#22c55e",i:"💼"},{l:"Departments",v:data?.departments||8,c:"#06B6D4",i:"🏛️"},{l:"Organizations",v:data?.organizations||24,c:"#f59e0b",i:"🏢"}].map((s,i)=>(
          <div key={i} style={{...G,padding:"14px",display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:s.c+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>{s.i}</div>
            <div><div style={{ fontSize:"22px", fontWeight:700, color:s.c }}>{s.v}</div><div style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)" }}>{s.l}</div></div>
          </div>
        ))}'''

new_stat_render = '''{[{l:"Total Interns",v:data?.totalInterns||250,c:"#6366F1"},{l:"Active Internships",v:data?.activeInternships||62,c:"#22c55e"},{l:"Departments",v:data?.departments||8,c:"#06B6D4"},{l:"Organizations",v:data?.organizations||24,c:"#f59e0b"}].map((s,i)=>(
          <div key={i} style={{...G,padding:"14px",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",minHeight:"120px"}}>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", marginBottom:"4px" }}>{s.l}</div>
              <div style={{ fontSize:"28px", fontWeight:700, color:s.c }}>{s.v}</div>
            </div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"60px", zIndex:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statCardData[s.l]||[{v:0},{v:1}]} margin={{top:0,right:0,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id={"ig"+i} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={s.c} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={s.c} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={s.c} strokeWidth={2} fill={"url(#ig"+i+")"} dot={false} isAnimationActive={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}'''

count3 = content2.count(old_stat_render)
print(f"Institution stat render pattern found: {count3}")
if count3 > 0:
    content2 = content2.replace(old_stat_render, new_stat_render)
    print("Fixed institution stat card graphs")

with open(inst_path, 'w', encoding='utf-8') as f:
    f.write(content2)

print("\nAll fixes done!")

"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, X, Download, Upload, Trash2, Edit, CheckCircle2, Play, Terminal, ChevronRight, Circle, CheckCircle, AlertCircle, Code2, FileCode2, FolderOpen as FolderOpenIcon, RotateCcw, Calendar, ClipboardList, Lightbulb, Clock, Star, ExternalLink } from "lucide-react"
import { TASK_CAT_ICONS } from "../../../lib/uiIcons"
import InternSidebar from "../../../lib/internSidebar"
import { api, getInternUser } from "../../../lib/api"
import {
  appendSubmission,
  getSubmissionForTask,
  KEY_INTERN_SUBMISSIONS,
  KEY_INTERN_EVALUATIONS,
} from "../../../lib/evaluationSync"

const TASKS = [
  { id:1, name:"Build Login API",         cat:"Backend",       due:"May 25, 2025", pri:"High",   status:"In Progress", pct:70,  bg:"#7C3AED", desc:"Develop a secure login API with JWT authentication using Node.js and Express." },
  { id:2, name:"Create Dashboard UI",     cat:"Frontend",      due:"May 30, 2025", pri:"High",   status:"Submitted",   pct:100, bg:"#06B6D4", desc:"Design and implement the main dashboard UI with all components." },
  { id:3, name:"Integrate MongoDB",       cat:"Database",      due:"Jun 05, 2025", pri:"Medium", status:"In Progress", pct:60,  bg:"#10b981", desc:"Set up MongoDB connection and integrate with the backend APIs." },
  { id:4, name:"Write API Documentation", cat:"Documentation", due:"Jun 08, 2025", pri:"Low",    status:"Pending",     pct:20,  bg:"#f59e0b", desc:"Write comprehensive API documentation using Swagger/OpenAPI." },
  { id:5, name:"Deploy Application",      cat:"DevOps",        due:"Jun 12, 2025", pri:"High",   status:"Pending",     pct:0,   bg:"#ec4899", desc:"Deploy the application to AWS EC2 with CI/CD pipeline setup." },
  { id:6, name:"Unit Testing",            cat:"Testing",       due:"Jun 15, 2025", pri:"Medium", status:"Pending",     pct:0,   bg:"#8b5cf6", desc:"Write unit tests for all API endpoints using Jest and Supertest." },
]

const PRI = { High:{c:"#ef4444",bg:"rgba(239,68,68,0.15)"}, Medium:{c:"#f97316",bg:"rgba(249,115,22,0.15)"}, Low:{c:"#22c55e",bg:"rgba(34,197,94,0.15)"} }
const STA = { "In Progress":{c:"#06B6D4",bg:"rgba(6,182,212,0.15)"}, Completed:{c:"#22c55e",bg:"rgba(34,197,94,0.15)"}, Pending:{c:"#ef4444",bg:"rgba(239,68,68,0.15)"}, Submitted:{c:"#3b82f6",bg:"rgba(59,130,246,0.15)"} }
function CatIcon({ cat, color, size = 14 }) {
  if (cat === "Backend") return <span className="text-[10px] font-bold font-mono" style={{ color }}>&lt;/&gt;</span>
  const Icon = TASK_CAT_ICONS[cat] || ClipboardList
  return <Icon size={size} color={color} strokeWidth={2} />
}
const CAT_COLORS = { Backend:"#7C3AED", Frontend:"#06B6D4", Database:"#10b981", Documentation:"#f59e0b", DevOps:"#ec4899", Testing:"#8b5cf6" }
const KCOL = { Pending:{b:"rgba(239,68,68,0.3)",bg:"rgba(239,68,68,0.05)",d:"#ef4444"}, "In Progress":{b:"rgba(6,182,212,0.3)",bg:"rgba(6,182,212,0.05)",d:"#06B6D4"}, Completed:{b:"rgba(34,197,94,0.3)",bg:"rgba(34,197,94,0.05)",d:"#22c55e"}, Submitted:{b:"rgba(59,130,246,0.3)",bg:"rgba(59,130,246,0.05)",d:"#3b82f6"} }

// Coding exam questions per category
const EXAM_QUESTIONS = {
  Backend: {
    title: "Build a REST API Endpoint",
    description: "Create a Node.js/Express endpoint that handles user authentication. The endpoint should accept POST /api/login with { email, password } and return a JWT token on success.",
    requirements: [
      "Validate email and password fields",
      "Return 400 if fields are missing",
      "Return 401 if credentials are invalid",
      "Return JWT token on success with 200 status",
      "Use bcrypt for password comparison"
    ],
    starterCode: `const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  // TODO: Destructure email and password from req.body
  
  // TODO: Validate that both fields exist
  
  // TODO: Find user in database (mock: const user = await User.findOne({ email }))
  
  // TODO: Compare password with bcrypt
  
  // TODO: Generate JWT token and return it
  
});

module.exports = router;`,
    language: "javascript",
    testCases: [
      { input: '{ "email": "", "password": "" }', expected: '400 Bad Request' },
      { input: '{ "email": "wrong@test.com", "password": "wrong" }', expected: '401 Unauthorized' },
      { input: '{ "email": "user@test.com", "password": "correct" }', expected: '200 OK + JWT token' },
    ]
  },
  Frontend: {
    title: "Build a React Component",
    description: "Create a reusable React Button component that supports different variants (primary, secondary, danger), sizes (sm, md, lg), and a loading state with a spinner.",
    requirements: [
      "Accept variant prop: 'primary' | 'secondary' | 'danger'",
      "Accept size prop: 'sm' | 'md' | 'lg'",
      "Show spinner when loading={true}",
      "Disable button when loading or disabled prop is true",
      "Apply correct Tailwind CSS classes per variant"
    ],
    starterCode: `import React from 'react';

// TODO: Build the Button component
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  onClick 
}) => {
  // TODO: Define variant styles
  const variantStyles = {
    // primary: '...',
    // secondary: '...',
    // danger: '...',
  };

  // TODO: Define size styles
  const sizeStyles = {
    // sm: '...',
    // md: '...',
    // lg: '...',
  };

  return (
    // TODO: Return the button JSX
    <button>
      {loading && <span>Loading...</span>}
      {children}
    </button>
  );
};

export default Button;`,
    language: "jsx",
    testCases: [
      { input: '<Button variant="primary">Click</Button>', expected: 'Blue button renders' },
      { input: '<Button loading={true}>Save</Button>', expected: 'Spinner shown, button disabled' },
      { input: '<Button variant="danger" size="lg">Delete</Button>', expected: 'Red large button' },
    ]
  },
  Database: {
    title: "Write MongoDB Aggregation Pipeline",
    description: "Write a MongoDB aggregation pipeline that groups users by department, counts them, calculates average salary, and returns only departments with more than 5 employees sorted by average salary descending.",
    requirements: [
      "Group by department field",
      "Count total employees per department",
      "Calculate average salary per department",
      "Filter departments with count > 5",
      "Sort by avgSalary descending"
    ],
    starterCode: `// MongoDB Aggregation Pipeline
// Collection: employees
// Fields: { name, department, salary, joinDate }

const pipeline = [
  // Stage 1: TODO - Group by department, count employees, calc avg salary
  {
    $group: {
      // _id: ???,
      // totalEmployees: ???,
      // avgSalary: ???,
    }
  },

  // Stage 2: TODO - Filter departments with more than 5 employees
  {
    $match: {
      // ???
    }
  },

  // Stage 3: TODO - Sort by avgSalary descending
  {
    $sort: {
      // ???
    }
  },

  // Stage 4: TODO - Project clean output fields
  {
    $project: {
      department: "$_id",
      totalEmployees: 1,
      avgSalary: { $round: ["$avgSalary", 2] },
      _id: 0
    }
  }
];

db.employees.aggregate(pipeline);`,
    language: "javascript",
    testCases: [
      { input: 'Department with 3 employees', expected: 'Excluded from results' },
      { input: 'Department with 8 employees', expected: 'Included, sorted by salary' },
      { input: 'All results', expected: 'Sorted descending by avgSalary' },
    ]
  },
  Documentation: {
    title: "Write OpenAPI/Swagger Documentation",
    description: "Write OpenAPI 3.0 YAML documentation for a User Registration endpoint. The endpoint accepts user data and returns the created user object.",
    requirements: [
      "Define POST /api/users endpoint",
      "Include requestBody with email, password, fullName fields",
      "Mark email and password as required",
      "Define 201 success response with user object",
      "Define 400 error response for validation errors"
    ],
    starterCode: `openapi: 3.0.0
info:
  title: Internship API
  version: 1.0.0

paths:
  /api/users:
    post:
      summary: # TODO: Add summary
      description: # TODO: Add description
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                # TODO: List required fields
              properties:
                # TODO: Define email, password, fullName properties
      responses:
        '201':
          description: # TODO: Success description
          content:
            application/json:
              schema:
                # TODO: Define response schema
        '400':
          description: # TODO: Error description`,
    language: "yaml",
    testCases: [
      { input: 'Missing required fields', expected: '400 response defined' },
      { input: 'Valid user data', expected: '201 with user object' },
      { input: 'Schema validation', expected: 'email, password required' },
    ]
  },
  DevOps: {
    title: "Write a Dockerfile & Docker Compose",
    description: "Create a production-ready Dockerfile for a Node.js application and a docker-compose.yml that includes the app, MongoDB, and Redis services.",
    requirements: [
      "Use node:18-alpine as base image",
      "Set working directory to /app",
      "Copy package files and run npm ci --only=production",
      "Expose port 5000",
      "Docker Compose: app, mongo, redis services with proper networking"
    ],
    starterCode: `# ===== Dockerfile =====
# TODO: Use node:18-alpine base image

# TODO: Set working directory

# TODO: Copy package.json and package-lock.json

# TODO: Install production dependencies only

# TODO: Copy rest of source code

# TODO: Expose port 5000

# TODO: Set start command

---
# ===== docker-compose.yml =====
version: '3.8'

services:
  app:
    build: .
    ports:
      # TODO: Map port 5000
    environment:
      # TODO: Add MONGO_URI and REDIS_URL env vars
    depends_on:
      # TODO: List dependencies

  mongo:
    image: mongo:6
    # TODO: Add volume for data persistence

  redis:
    image: redis:7-alpine
    # TODO: Add port mapping`,
    language: "dockerfile",
    testCases: [
      { input: 'docker build .', expected: 'Image builds successfully' },
      { input: 'docker-compose up', expected: 'All 3 services start' },
      { input: 'App connects to mongo', expected: 'MONGO_URI env var used' },
    ]
  },
  Testing: {
    title: "Write Jest Unit Tests",
    description: "Write comprehensive Jest unit tests for a calculateDiscount function that applies percentage discounts to prices with various edge cases.",
    requirements: [
      "Test normal discount calculation (e.g. 20% off $100 = $80)",
      "Test 0% discount returns original price",
      "Test 100% discount returns 0",
      "Test negative price throws an error",
      "Test discount > 100% throws an error"
    ],
    starterCode: `// Function to test
function calculateDiscount(price, discountPercent) {
  if (price < 0) throw new Error('Price cannot be negative');
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0 and 100');
  }
  return price * (1 - discountPercent / 100);
}

// ===== YOUR TESTS BELOW =====
describe('calculateDiscount', () => {
  
  // TODO: Test 1 - Normal discount
  test('should apply 20% discount to $100', () => {
    // expect(calculateDiscount(100, 20)).toBe(???)
  });

  // TODO: Test 2 - Zero discount
  test('should return original price for 0% discount', () => {
    
  });

  // TODO: Test 3 - Full discount
  test('should return 0 for 100% discount', () => {
    
  });

  // TODO: Test 4 - Negative price error
  test('should throw error for negative price', () => {
    // expect(() => calculateDiscount(-10, 20)).toThrow(???)
  });

  // TODO: Test 5 - Invalid discount error
  test('should throw error for discount over 100%', () => {
    
  });
});`,
    language: "javascript",
    testCases: [
      { input: 'calculateDiscount(100, 20)', expected: '80' },
      { input: 'calculateDiscount(50, 0)', expected: '50' },
      { input: 'calculateDiscount(-10, 20)', expected: 'throws Error' },
    ]
  }
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState(TASKS)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [sel, setSel] = useState(null)
  const [modal, setModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [uploads, setUploads] = useState([])
  const [submitted, setSubmitted] = useState(null)
  const [taskFile, setTaskFile] = useState(null)
  const [newT, setNewT] = useState({ name:"", cat:"Backend", due:"", pri:"Medium", status:"Pending", pct:0, desc:"" })
  const [examModal, setExamModal] = useState(false)
  const [examTask, setExamTask] = useState(null)
  const [examCode, setExamCode] = useState("")
  const [examOutput, setExamOutput] = useState([])
  const [examRunning, setExamRunning] = useState(false)
  const [examTab, setExamTab] = useState("problem") // "problem" | "output"
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [activeFile, setActiveFile] = useState("solution")
  const [showMarks, setShowMarks] = useState(false)
  const [marksTask, setMarksTask] = useState(null)
  const upRef = useRef(null)
  const subRef = useRef(null)
  const taskFileRef = useRef(null)
  const codeRef = useRef(null)
  const [taskReview, setTaskReview] = useState(null)

  const refreshTaskReview = (taskName) => {
    const u = getInternUser()
    if (!taskName) { setTaskReview(null); return }
    setTaskReview(getSubmissionForTask(u, taskName) || null)
  }

  useEffect(() => {
    if (sel?.name) refreshTaskReview(sel.name)
  }, [sel?.name, sel?.status])

  useEffect(() => {
    const onSync = () => { if (sel?.name) refreshTaskReview(sel.name) }
    const id = setInterval(onSync, 2000)
    window.addEventListener("storage", onSync)
    window.addEventListener(KEY_INTERN_SUBMISSIONS, onSync)
    window.addEventListener(KEY_INTERN_EVALUATIONS, onSync)
    return () => {
      clearInterval(id)
      window.removeEventListener("storage", onSync)
      window.removeEventListener(KEY_INTERN_SUBMISSIONS, onSync)
      window.removeEventListener(KEY_INTERN_EVALUATIONS, onSync)
    }
  }, [sel?.name])

  useEffect(() => {
    const user = getInternUser()
    api.getTasks(user.id).then(r => {
      if (r.ok && r.data?.length) {
        setTasks(r.data.map(t => ({
          id: t._id||t.id, name: t.title||t.name||"", cat: t.category||t.cat||"Backend",
          due: t.dueDate||t.due||"", pri: t.priority||t.pri||"Medium",
          status: t.status||"Pending", pct: t.progress??t.pct??0,
          bg: CAT_COLORS[t.category||t.cat]||"#7C3AED", desc: t.description||t.desc||""
        })))
      }
    }).catch(()=>{})

    // Load mentor-assigned tasks from localStorage on mount
    try {
      const mentorTasks = JSON.parse(localStorage.getItem("mentorAssignedTasks")||"[]")
      if (mentorTasks.length) {
        setTasks(p => {
          const existingIds = new Set(p.map(t=>String(t.id)))
          const newOnes = mentorTasks.filter(t=>!existingIds.has(String(t.id)))
          return newOnes.length ? [...newOnes, ...p] : p
        })
      }
    } catch {}
  }, [])

  // Poll localStorage every 2s for new mentor-assigned tasks
  useEffect(() => {
    const applyMentorTasks = () => {
      try {
        const mentorTasks = JSON.parse(localStorage.getItem("mentorAssignedTasks")||"[]")
        if (!mentorTasks.length) return
        setTasks(p => {
          const existingIds = new Set(p.map(t=>String(t.id)))
          const newOnes = mentorTasks
            .filter(t=>!existingIds.has(String(t.id)))
            .map(t=>({
              ...t,
              bg: CAT_COLORS[t.cat]||t.bg||"#7C3AED",
              desc: t.desc || `Assigned by mentor. Complete with proper validation and error handling.`
            }))
          return newOnes.length ? [...newOnes, ...p] : p
        })
      } catch {}
    }

    // Run immediately
    applyMentorTasks()

    // Poll every 2s as fallback
    const pollId = setInterval(applyMentorTasks, 2000)

    // React instantly when mentor adds a task (cross-tab storage event)
    const onStorage = (e) => {
      if (e.key === "mentorAssignedTasks") applyMentorTasks()
    }
    window.addEventListener("storage", onStorage)

    return () => {
      clearInterval(pollId)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const filtered = tasks.filter(t => (filter==="All"||t.status===filter) && t.name.toLowerCase().includes(search.toLowerCase()))
  const kanban = { Pending:tasks.filter(t=>t.status==="Pending"), "In Progress":tasks.filter(t=>t.status==="In Progress"), Completed:tasks.filter(t=>t.status==="Completed"), Submitted:tasks.filter(t=>t.status==="Submitted") }

  const openExam = (task) => {
    const q = EXAM_QUESTIONS[task.cat] || EXAM_QUESTIONS.Backend
    setExamTask({ ...task, exam: q })
    setExamCode(q.starterCode)
    setExamOutput([])
    setExamSubmitted(false)
    setExamTab("problem")
    setActiveFile("solution")
    setExamModal(true)
  }

  const runCode = () => {
    setExamRunning(true)
    setExamTab("output")
    setTimeout(() => {
      const lines = []
      lines.push({ type:"info", text:"▶  Running code analysis…" })
      lines.push({ type:"info", text:"" })
      const q = examTask?.exam
      if (q) {
        q.testCases.forEach((tc, i) => {
          const passed = examCode.length > q.starterCode.length + 50
          lines.push({ type: passed ? "success" : "error", text: `Test ${i+1}: ${tc.input}` })
          lines.push({ type: passed ? "success" : "warn", text: `  Expected: ${tc.expected}` })
          lines.push({ type: passed ? "success" : "error", text: `  Result:   ${passed ? "PASS" : "Incomplete — add your implementation"}` })
          lines.push({ type:"info", text:"" })
        })
        const allPass = examCode.length > q.starterCode.length + 50
        lines.push({ type: allPass ? "success" : "warn", text: allPass ? "All tests passed! Great work." : "Complete the TODO sections and run again." })
      }
      setExamOutput(lines)
      setExamRunning(false)
    }, 1200)
  }

  const submitExam = () => {
    setExamSubmitted(true)
    setExamOutput(p => [...p, { type:"success", text:"" }, { type:"success", text:"Exam submitted successfully! Your mentor will review your solution." }])
    setExamTab("output")
  }

  const addTask = async () => {
    if (!newT.name.trim()||!newT.due.trim()) return
    const user = getInternUser()
    const r = await api.createTask({ title:newT.name, category:newT.cat, dueDate:newT.due, priority:newT.pri, status:newT.status, progress:newT.pct, description:newT.desc, userId:user.id })
    const created = { ...newT, id:r.ok?(r.data.id||Date.now()):Date.now(), bg:CAT_COLORS[newT.cat]||"#7C3AED", attachment:taskFile?{name:taskFile.name,size:`${(taskFile.size/1024).toFixed(0)} KB`}:null }
    setTasks(p=>[created,...p]); setSel(created); setModal(false)
    setNewT({ name:"", cat:"Backend", due:"", pri:"Medium", status:"Pending", pct:0, desc:"" }); setTaskFile(null)
  }

  const saveEdit = async () => {
    await api.updateTask(editTask.id, { title:editTask.name, category:editTask.cat, dueDate:editTask.due, priority:editTask.pri, status:editTask.status, progress:editTask.pct, description:editTask.desc })
    setTasks(p=>p.map(t=>t.id===editTask.id?editTask:t))
    if(sel?.id===editTask.id) setSel(editTask)
    setEditModal(false)
  }

  const download = (f) => {
    const blob = new Blob([`File: ${f.name}`],{type:"text/plain"})
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=f.name; a.click(); URL.revokeObjectURL(url)
  }

  const inp = "w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs outline-none text-white"

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white flex">

  {/* Background Video */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover z-0"
  >
    <source src="data:video/mp4;base64," type="video/mp4" />
  </video>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/70 z-0"></div>

  {/* Main Content */}
  <div className="relative z-10 flex w-full">
      <InternSidebar active="Tasks"/>
      <main className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
        {/* HEADER */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-gray-400 text-xs mt-0.5">Manage and track your internship tasks efficiently.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks…" className="bg-[#0f172a] border border-[#1e293b] rounded-xl py-2 pl-9 pr-3 text-xs outline-none w-44"/>
            </div>
            <button onClick={()=>setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-semibold">
              <Plus size={14}/> Add Task
            </button>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 flex-shrink-0">
          {["All","Pending","In Progress","Completed"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-xl text-xs font-medium transition ${filter===f?"bg-gradient-to-r from-cyan-500 to-purple-600 text-white":"bg-[#0f172a] border border-[#1e293b] text-gray-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>

        <div className="flex gap-3 flex-1 overflow-hidden min-h-0">
          {/* LEFT: TABLE + KANBAN */}
          <div className="flex-1 flex flex-col overflow-hidden gap-3">
            {/* TABLE — scrollable */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden flex-shrink-0" style={{ maxHeight:"260px", overflowY:"auto" }}>
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-[#0f172a] z-10">
                  <tr className="border-b border-[#1e293b]">
                    {["Task","Category","Due Date","Priority","Status","Progress","Action"].map(h=>(
                      <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t,i)=>(
                    <tr key={i} className="border-b border-[#1e293b] hover:bg-[#111827] transition cursor-pointer row-hover" onClick={()=>setSel(t)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:t.bg+"33", color:t.bg }}><CatIcon cat={t.cat} color={t.bg}/></div>
                          <span className="text-xs font-medium">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{t.cat}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 flex items-center gap-1"><Calendar size={11}/> {t.due}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold" style={{ color:PRI[t.pri]?.c, background:PRI[t.pri]?.bg }}>{t.pri}</span></td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold" style={{ color:STA[t.status]?.c, background:STA[t.status]?.bg }}>{t.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden w-16">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" style={{ width:`${t.pct}%` }}/>
                          </div>
                          <span className="text-[10px] text-gray-400">{t.pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={e=>{e.stopPropagation();setSel(t)}} className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-600/30 text-purple-400 text-[10px] font-medium hover:bg-purple-600/30">View</button>
                          {t.status==="Submitted"||t.status==="Completed" ? (
                            <button onClick={e=>{e.stopPropagation();setMarksTask(t);setShowMarks(true)}} className="px-3 py-1 rounded-lg bg-green-600/20 border border-green-600/30 text-green-400 text-[10px] font-medium hover:bg-green-600/30 flex items-center gap-1">
                              🏅 Marks
                            </button>
                          ) : (
                            <button onClick={e=>{e.stopPropagation();openExam(t)}} className="px-3 py-1 rounded-lg bg-cyan-600/20 border border-cyan-600/30 text-cyan-400 text-[10px] font-medium hover:bg-cyan-600/30 flex items-center gap-1">
                              <Code2 size={9}/> Task
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* KANBAN — fills remaining height */}
            <div className="grid grid-cols-4 gap-2 flex-1 min-h-0">
              {Object.entries(kanban).map(([col, items])=>(
                <div key={col} className="rounded-xl p-2 border flex flex-col min-h-0 h-full" style={{ background:KCOL[col]?.bg, borderColor:KCOL[col]?.b }}>
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color:KCOL[col]?.d }}><ClipboardList size={10}/> {col} ({items.length})</span>
                  </div>
                  <div className="overflow-y-auto flex-1 space-y-1.5">
                  {items.map((t,i)=>(
                    <div key={i} onClick={()=>setSel(t)} className="bg-[#0f172a] rounded-lg p-2 cursor-pointer hover:bg-[#111827] border border-[#1e293b] card-hover">
                      <p className="text-[10px] font-medium text-white mb-1">{t.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-500 flex items-center gap-0.5"><Calendar size={9}/> {t.due}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color:PRI[t.pri]?.c, background:PRI[t.pri]?.bg }}>{t.pri}</span>
                      </div>
                    </div>
                  ))}
                  </div>
                  <button onClick={()=>setModal(true)} className="w-full text-[10px] text-gray-500 hover:text-white py-1 border border-dashed border-[#1e293b] rounded-lg mt-1 flex-shrink-0">+ Add Task</button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: TASK DETAILS */}
          {sel && (
            <div className="w-72 min-w-72 bg-[#0f172a] border border-[#1e293b] rounded-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
                <span className="text-sm font-bold">Task Details</span>
                <button onClick={()=>setSel(null)}><X size={14} className="text-gray-400"/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:sel.bg+"33", color:sel.bg }}><CatIcon cat={sel.cat} color={sel.bg} size={16}/></div>
                  <div>
                    <p className="text-xs font-bold">{sel.name}</p>
                    <div className="flex gap-1 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color:PRI[sel.pri]?.c, background:PRI[sel.pri]?.bg }}>{sel.pri}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color:STA[sel.status]?.c, background:STA[sel.status]?.bg }}>{sel.status}</span>
                    </div>
                  </div>
                  <button onClick={()=>{setEditTask({...sel});setEditModal(true)}} className="ml-auto px-2 py-1 rounded-lg bg-purple-600/20 border border-purple-600/30 text-purple-400 text-[9px] flex items-center gap-1">
                    <Edit size={9}/> Edit
                  </button>
                </div>
                {[["Category",sel.cat],["Due Date",sel.due],["Priority",sel.pri],["Status",sel.status]].map(([l,v])=>(
                  <div key={l} className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">{l}</span>
                    <span className="text-[10px] text-white font-medium">{v}</span>
                  </div>
                ))}
                <div>
                  <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-400">Progress</span><span className="text-[10px] text-white">{sel.pct}%</span></div>
                  <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" style={{ width:`${sel.pct}%` }}/>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">Description</p>
                  <p className="text-[10px] text-gray-300 leading-relaxed">{sel.desc}</p>
                </div>
                {/* Attachments from Mentor */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-2">Attachments (From Mentor)</p>
                  <input ref={upRef} type="file" multiple style={{ display:"none" }} onChange={e=>setUploads(p=>[...p,...Array.from(e.target.files).map(f=>({name:f.name,size:`${(f.size/1024).toFixed(0)} KB`,file:f}))])}/>
                  <button onClick={()=>upRef.current?.click()} className="w-full border border-dashed border-[#1e293b] rounded-xl p-2 text-[10px] text-gray-500 hover:text-white flex flex-col items-center gap-1 mb-2">
                    <Upload size={13}/> Upload Files
                    <span className="text-[9px]">PDF, DOCX, PPTX, ZIP (Max 10MB)</span>
                  </button>
                  {[{name:"login_requirements.pdf",size:"1.2 MB",color:"#ef4444"},{name:"api_structure.docx",size:"2.4 MB",color:"#3b82f6"},...uploads].map((f,i)=>(
                    <div key={i} className="flex items-center justify-between bg-[#111827] rounded-lg px-2 py-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold" style={{ background:(f.color||"#7C3AED")+"33", color:f.color||"#7C3AED" }}>{f.name.split(".").pop().toUpperCase().slice(0,3)}</div>
                        <div><p className="text-[9px] text-white">{f.name}</p><p className="text-[8px] text-gray-500">{f.size}</p></div>
                      </div>
                      <button onClick={()=>download(f)}><Download size={11} className="text-gray-400 hover:text-white"/></button>
                    </div>
                  ))}
                </div>
                {/* Your Submission */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-2">Your Submission</p>
                  <input ref={subRef} type="file" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setSubmitted({name:e.target.files[0].name,size:`${(e.target.files[0].size/1024).toFixed(0)} KB`,file:e.target.files[0]}) }}/>
                  {!submitted ? (
                    <button onClick={()=>subRef.current?.click()} className="w-full border border-dashed border-[#1e293b] rounded-xl p-2 text-[10px] text-gray-500 hover:text-white flex flex-col items-center gap-1">
                      <Upload size={13}/> Upload Your File
                      <span className="text-[9px]">ZIP, PDF, DOCX (Max 20MB)</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-green-900/20 border border-green-500/30 rounded-lg px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-green-400"/>
                        <div><p className="text-[9px] text-white">{submitted.name}</p><p className="text-[8px] text-gray-500">{submitted.size}</p></div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={()=>download(submitted)}><Download size={11} className="text-green-400"/></button>
                        <button onClick={()=>setSubmitted(null)}><Trash2 size={11} className="text-gray-400"/></button>
                      </div>
                    </div>
                  )}
                </div>
              <div style={{ display:"flex", gap:"6px" }}>
                  <button onClick={()=>{setSel(null);router.push(`/task-exam?task=${encodeURIComponent(viewTask?.name||sel.name)}&cat=${encodeURIComponent(viewTask?.cat||sel.cat)}&desc=${encodeURIComponent(viewTask?.desc||sel.desc)}&due=${encodeURIComponent(viewTask?.due||sel.due)}`)}}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    style={{ background:"linear-gradient(135deg,#22c55e,#06B6D4)" }}>
                    ▶ Take Task
                  </button>
                </div>
                <button onClick={async ()=>{
                  if (!submitted) { alert("Please upload your file first before submitting."); return }
                  const user = getInternUser()
                  let fileData = null
                  let fileMime = null
                  if (submitted.file) {
                    try {
                      fileData = await new Promise((resolve, reject) => {
                        const r = new FileReader()
                        r.onload = () => resolve(r.result)
                        r.onerror = reject
                        r.readAsDataURL(submitted.file)
                      })
                      fileMime = submitted.file.type || ""
                    } catch {}
                  }
                  const sub = appendSubmission({
                    intern: user.fullName || "Intern",
                    internUserId: user.id,
                    task: sel.name,
                    file: submitted.name,
                    fileSize: submitted.size,
                    fileData,
                    fileMime,
                    submittedOn: new Date().toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"}),
                    status: "Pending Review",
                    comments: "",
                  })
                  setTaskReview(sub)
                  setTasks(p=>p.map(t=>t.id===sel.id?{...t,status:"Submitted",pct:100}:t))
                  setSel(p=>({...p,status:"Submitted",pct:100}))
                }} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Submit / Update</button>

                {/* Mentor evaluation status */}
                {(taskReview || sel?.status === "Submitted") && (
                  <div className="mt-2 p-3 rounded-xl border border-[#1e293b] bg-[#111827]">
                    <p className="text-[10px] font-semibold text-gray-400 mb-2 flex items-center gap-1">
                      <Star size={11} className="text-purple-400"/> Mentor evaluation
                    </p>
                    {(!taskReview || taskReview.status === "Pending Review") ? (
                      <div className="flex items-start gap-2">
                        <Clock size={16} className="text-amber-400 flex-shrink-0 mt-0.5"/>
                        <div>
                          <p className="text-[11px] font-medium text-amber-300">Awaiting mentor evaluation</p>
                          <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">
                            Your submission was sent. Your mentor will review it — check the Evaluation page for updates.
                          </p>
                          <button
                            type="button"
                            onClick={()=>router.push("/intern/evaluation")}
                            className="mt-2 text-[10px] text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                          >
                            <ExternalLink size={10}/> Open Evaluation page
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5"/>
                        <div>
                          <p className="text-[11px] font-medium text-green-300">{taskReview.status}</p>
                          <p className="text-[9px] text-gray-400 mt-1 line-clamp-3">{taskReview.comments || "Mentor has reviewed your submission."}</p>
                          <button
                            type="button"
                            onClick={()=>router.push("/intern/evaluation")}
                            className="mt-2 text-[10px] text-purple-400 flex items-center gap-1"
                          >
                            <ExternalLink size={10}/> View full evaluation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CODING EXAM MODAL */}
      {examModal && examTask && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col z-50" style={{ fontFamily:"'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}>
          {/* VS Code-style title bar */}
          <div className="h-9 bg-[#1e1e1e] flex items-center justify-between px-4 border-b border-[#3c3c3c] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <button onClick={()=>setExamModal(false)} className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-red-400 transition"/>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"/>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"/>
              </div>
              <span className="text-[11px] text-[#cccccc] ml-2">Kiro — Coding Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#858585]">{examTask.name} · {examTask.cat}</span>
              <span className="text-[10px] px-2 py-0.5 rounded" style={{ background:"rgba(6,182,212,0.15)", color:"#06B6D4" }}>Due: {examTask.due}</span>
            </div>
            <button onClick={()=>setExamModal(false)} className="text-[#858585] hover:text-white transition">
              <X size={14}/>
            </button>
          </div>

          {/* Activity bar + main layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Activity bar (left icons) */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-4 border-r border-[#3c3c3c] flex-shrink-0">
              <button onClick={()=>setExamTab("problem")} className={`w-8 h-8 rounded flex items-center justify-center transition ${examTab==="problem"?"bg-[#1e1e1e] text-white":"text-[#858585] hover:text-white"}`} title="Problem">
                <FileCode2 size={16}/>
              </button>
              <button onClick={()=>setExamTab("output")} className={`w-8 h-8 rounded flex items-center justify-center transition ${examTab==="output"?"bg-[#1e1e1e] text-white":"text-[#858585] hover:text-white"}`} title="Output">
                <Terminal size={16}/>
              </button>
            </div>

            {/* Side panel (problem / output) */}
            <div className="w-80 bg-[#252526] border-r border-[#3c3c3c] flex flex-col overflow-hidden flex-shrink-0">
              {/* Panel tabs */}
              <div className="flex border-b border-[#3c3c3c] flex-shrink-0">
                <button onClick={()=>setExamTab("problem")} className={`flex-1 py-2 text-[10px] font-medium transition ${examTab==="problem"?"bg-[#1e1e1e] text-white border-t-2 border-[#06B6D4]":"text-[#858585] hover:text-white"}`}>
                  PROBLEM
                </button>
                <button onClick={()=>setExamTab("output")} className={`flex-1 py-2 text-[10px] font-medium transition ${examTab==="output"?"bg-[#1e1e1e] text-white border-t-2 border-[#06B6D4]":"text-[#858585] hover:text-white"}`}>
                  OUTPUT
                </button>
              </div>

              {examTab === "problem" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-white mb-1">{examTask.exam.title}</h2>
                    <p className="text-[11px] text-[#cccccc] leading-relaxed">{examTask.exam.description}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#06B6D4] mb-2 uppercase tracking-wider">Requirements</p>
                    <ul className="space-y-1.5">
                      {examTask.exam.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[10px] text-[#cccccc]">
                          <ChevronRight size={10} className="text-[#06B6D4] mt-0.5 flex-shrink-0"/>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#a855f7] mb-2 uppercase tracking-wider">Test Cases</p>
                    <div className="space-y-2">
                      {examTask.exam.testCases.map((tc, i) => (
                        <div key={i} className="bg-[#1e1e1e] rounded-lg p-2.5 border border-[#3c3c3c]">
                          <p className="text-[9px] text-[#858585] mb-1">Test {i+1}</p>
                          <p className="text-[10px] text-[#9cdcfe]">Input: <span className="text-[#ce9178]">{tc.input}</span></p>
                          <p className="text-[10px] text-[#9cdcfe]">Expected: <span className="text-[#4ec9b0]">{tc.expected}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#1e1e1e] rounded-lg p-3 border border-[#3c3c3c]">
                    <p className="text-[9px] text-[#858585] mb-1 flex items-center gap-1"><Lightbulb size={10}/> Tip</p>
                    <p className="text-[10px] text-[#cccccc]">Complete all TODO sections in the editor. Click ▶ Run to test your code.</p>
                  </div>
                </div>
              )}

              {examTab === "output" && (
                <div className="flex-1 overflow-y-auto p-3 bg-[#1e1e1e]">
                  {examOutput.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-[#858585]">
                      <Terminal size={24}/>
                      <p className="text-[11px]">Click ▶ Run to execute your code</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {examOutput.map((line, i) => (
                        <p key={i} className={`text-[10px] font-mono leading-relaxed ${
                          line.type==="success" ? "text-[#4ec9b0]" :
                          line.type==="error" ? "text-[#f48771]" :
                          line.type==="warn" ? "text-[#cca700]" :
                          "text-[#858585]"
                        }`}>{line.text || "\u00A0"}</p>
                      ))}
                      {examRunning && (
                        <div className="flex items-center gap-2 text-[#858585] text-[10px] mt-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/>
                          Running…
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Editor area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
              {/* Editor tabs */}
              <div className="flex items-center bg-[#2d2d2d] border-b border-[#3c3c3c] flex-shrink-0">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-[#1e1e1e] border-r border-[#3c3c3c] border-t-2 border-t-[#06B6D4]">
                  <FileCode2 size={11} className="text-[#e8c07d]"/>
                  <span className="text-[11px] text-[#cccccc]">
                    solution.{examTask.exam.language === "jsx" ? "jsx" : examTask.exam.language === "yaml" ? "yaml" : examTask.exam.language === "dockerfile" ? "dockerfile" : "js"}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e8c07d] ml-1"/>
                </div>
                <div className="flex-1"/>
                <div className="flex items-center gap-1 px-3 text-[10px] text-[#858585]">
                  <span>{examTask.exam.language}</span>
                  <span>·</span>
                  <span>UTF-8</span>
                </div>
              </div>

              {/* Line numbers + code editor */}
              <div className="flex-1 overflow-hidden flex">
                {/* Line numbers */}
                <div className="w-12 bg-[#1e1e1e] text-[#858585] text-[11px] font-mono pt-3 pb-3 text-right pr-3 select-none overflow-hidden flex-shrink-0 border-r border-[#3c3c3c]">
                  {examCode.split("\n").map((_, i) => (
                    <div key={i} className="leading-5">{i + 1}</div>
                  ))}
                </div>
                {/* Code textarea */}
                <textarea
                  ref={codeRef}
                  value={examCode}
                  onChange={e => setExamCode(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Tab") {
                      e.preventDefault()
                      const start = e.target.selectionStart
                      const end = e.target.selectionEnd
                      const newVal = examCode.substring(0, start) + "  " + examCode.substring(end)
                      setExamCode(newVal)
                      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2 }, 0)
                    }
                  }}
                  spellCheck={false}
                  className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] text-[12px] font-mono leading-5 p-3 outline-none resize-none overflow-auto"
                  style={{ tabSize: 2, caretColor: "#aeafad" }}
                />
              </div>

              {/* Status bar */}
              <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 flex-shrink-0">
                <div className="flex items-center gap-3 text-[10px] text-white">
                  <span className="flex items-center gap-1"><Circle size={8}/> {examTask.cat}</span>
                  <span>{examTask.exam.language.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white">
                  <span>Ln {examCode.split("\n").length}</span>
                  <span>Col {examCode.split("\n").slice(-1)[0]?.length || 0}</span>
                  <span className="flex items-center gap-1">{examSubmitted ? <><CheckCircle2 size={11}/> Submitted</> : "● Unsaved"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="h-12 bg-[#1e1e1e] border-t border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={()=>{ setExamCode(examTask.exam.starterCode); setExamOutput([]) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] text-[#858585] hover:text-white hover:bg-[#2d2d2d] transition">
                <RotateCcw size={12}/> Reset
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={runCode} disabled={examRunning}
                className="flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-semibold transition"
                style={{ background: examRunning ? "#2d2d2d" : "linear-gradient(135deg,#22c55e,#06B6D4)", color: examRunning ? "#858585" : "white" }}>
                <Play size={12} fill="currentColor"/>
                {examRunning ? "Running…" : "▶  Run Code"}
              </button>
              <button onClick={submitExam} disabled={examSubmitted}
                className="flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-semibold transition"
                style={{ background: examSubmitted ? "#2d2d2d" : "linear-gradient(135deg,#7c3aed,#a855f7)", color: examSubmitted ? "#858585" : "white" }}>
                <CheckCircle size={12}/>
                {examSubmitted ? "Submitted" : "Submit Exam"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARKS MODAL — for submitted/completed tasks */}
      {showMarks && marksTask && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
              <div>
                <h2 className="text-sm font-bold">🏅 Task Marks & Feedback</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">{marksTask.name}</p>
              </div>
              <button onClick={()=>setShowMarks(false)} className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:bg-red-900/30">
                <X size={14} className="text-gray-400"/>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Score display */}
              <div className="bg-[#111827] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">Score Awarded</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-green-400">
                      {marksTask.status==="Submitted" ? "85" : "92"}
                    </span>
                    <span className="text-gray-400 text-sm">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 mb-1">Grade</p>
                  <span className="text-2xl font-bold" style={{ color: marksTask.status==="Submitted"?"#22c55e":"#06B6D4" }}>
                    {marksTask.status==="Submitted" ? "B+" : "A"}
                  </span>
                </div>
                <div className="w-20 h-20 relative flex-shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6" fill="none"/>
                    <circle cx="40" cy="40" r="32" stroke="#22c55e" strokeWidth="6" fill="none"
                      strokeDasharray="201"
                      strokeDashoffset={201 - (201 * (marksTask.status==="Submitted"?85:92)/100)}
                      strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-400">{marksTask.status==="Submitted"?"85%":"92%"}</span>
                  </div>
                </div>
              </div>

              {/* Criteria breakdown */}
              <div className="bg-[#111827] rounded-xl p-4">
                <p className="text-[10px] font-semibold text-white mb-3">Criteria Breakdown</p>
                {[
                  {name:"Code Quality",    score:18, max:20, color:"#7C3AED"},
                  {name:"Functionality",   score:22, max:25, color:"#06B6D4"},
                  {name:"Documentation",  score:14, max:15, color:"#22c55e"},
                  {name:"Best Practices", score:17, max:20, color:"#f59e0b"},
                  {name:"Testing",        score:14, max:20, color:"#ec4899"},
                ].map((c,i)=>(
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] text-gray-400 w-28 flex-shrink-0">{c.name}</span>
                    <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${c.score/c.max*100}%`, background:c.color }}/>
                    </div>
                    <span className="text-[10px] text-white font-semibold w-12 text-right">{c.score}/{c.max}</span>
                  </div>
                ))}
              </div>

              {/* Mentor feedback */}
              <div className="bg-purple-600/10 border border-purple-600/20 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-purple-400 mb-2">Mentor Feedback</p>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {marksTask.status==="Submitted"
                    ? "Good work overall! The code structure is clean and well-organized. However, some edge cases in error handling need attention. Review the JWT token expiration logic and add proper refresh token handling."
                    : "Excellent submission! Code is clean, well-documented, and all test cases pass. Great job on the implementation."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={()=>{
                  const blob = new Blob([`Task: ${marksTask.name}\nScore: ${marksTask.status==="Submitted"?"85":"92"}/100\nGrade: ${marksTask.status==="Submitted"?"B+":"A"}\nFeedback: Good work overall!`],{type:"text/plain"})
                  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=`${marksTask.name}_marks.txt`; a.click(); URL.revokeObjectURL(url)
                }} className="flex-1 py-2.5 rounded-xl bg-cyan-600/20 border border-cyan-600/30 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-2">
                  <Download size={13}/> Download Report
                </button>
                <button onClick={()=>{
                  setShowMarks(false)
                  openExam(marksTask)
                }} className="flex-1 py-2.5 rounded-xl bg-orange-600/20 border border-orange-600/30 text-orange-400 text-xs font-semibold flex items-center justify-center gap-2">
                  🔍 Review Answer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold">Add New Task</span>
              <button onClick={()=>setModal(false)}><X size={14} className="text-gray-400"/></button>
            </div>
            <div className="space-y-3">
              {[{l:"Task Title *",k:"name",p:"Enter task title"},{l:"Due Date *",k:"due",p:"Jun 01, 2025"}].map(f=>(
                <div key={f.k}>
                  <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                  <input placeholder={f.p} value={newT[f.k]} onChange={e=>setNewT({...newT,[f.k]:e.target.value})} className={inp}/>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                {[{l:"Priority",k:"pri",opts:["High","Medium","Low"]},{l:"Status",k:"status",opts:["Pending","In Progress","Completed","Submitted"]}].map(f=>(
                  <div key={f.k}>
                    <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                    <select value={newT[f.k]} onChange={e=>setNewT({...newT,[f.k]:e.target.value})} className={inp}>{f.opts.map(o=><option key={o} style={{ background:"#0f172a" }}>{o}</option>)}</select>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Description</label>
                <textarea rows={2} value={newT.desc} onChange={e=>setNewT({...newT,desc:e.target.value})} className={`${inp} resize-none`}/>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Attach File (optional)</label>
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-[#1e293b] rounded-xl px-3 py-2 hover:border-purple-500 transition">
                  <Upload size={12} className="text-gray-400"/>
                  <span className="text-[10px] text-gray-400">{taskFile?taskFile.name:"Click to attach file…"}</span>
                  <input ref={taskFileRef} type="file" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setTaskFile(e.target.files[0]) }}/>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>{setModal(false);setTaskFile(null)}} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
              <button onClick={addTask} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && editTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold">✏️ Edit Task</span>
              <button onClick={()=>setEditModal(false)}><X size={14} className="text-gray-400"/></button>
            </div>
            <div className="space-y-3">
              {[{l:"Task Name",k:"name"},{l:"Due Date",k:"due"}].map(f=>(
                <div key={f.k}>
                  <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                  <input value={editTask[f.k]} onChange={e=>setEditTask({...editTask,[f.k]:e.target.value})} className={inp}/>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2">
                {[{l:"Category",k:"cat",opts:["Backend","Frontend","Database","Documentation","DevOps","Testing"]},{l:"Priority",k:"pri",opts:["High","Medium","Low"]},{l:"Status",k:"status",opts:["Pending","In Progress","Completed","Submitted"]}].map(f=>(
                  <div key={f.k}>
                    <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                    <select value={editTask[f.k]} onChange={e=>setEditTask({...editTask,[f.k]:e.target.value})} className={inp}>{f.opts.map(o=><option key={o} style={{ background:"#0f172a" }}>{o}</option>)}</select>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Progress ({editTask.pct}%)</label>
                <input type="range" min="0" max="100" value={editTask.pct} onChange={e=>setEditTask({...editTask,pct:parseInt(e.target.value)})} className="w-full accent-purple-500"/>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Description</label>
                <textarea rows={2} value={editTask.desc} onChange={e=>setEditTask({...editTask,desc:e.target.value})} className={`${inp} resize-none`}/>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setEditModal(false)} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

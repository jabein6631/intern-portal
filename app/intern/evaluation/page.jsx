"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import InternSidebar from "../../../lib/internSidebar"
import { getInternUser } from "../../../lib/api"
import {
  getEvaluationsForIntern,
  getSubmissionsForIntern,
  gradeLabel,
  DEFAULT_RUBRICS,
  KEY_INTERN_EVALUATIONS,
  KEY_INTERN_SUBMISSIONS,
} from "../../../lib/evaluationSync"
import { Star, Clock, CheckCircle2, FileText, User } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const G = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px" }

export default function InternEvaluationPage() {
  const router = useRouter()
  const [user, setUser] = useState({})
  const [evaluations, setEvaluations] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [sel, setSel] = useState(null)

  const load = () => {
    const u = getInternUser()
    setUser(u)
    const ev = getEvaluationsForIntern(u)
    const subs = getSubmissionsForIntern(u)
    setEvaluations(ev)
    setSubmissions(subs)
    setSel((prev) => {
      if (prev) {
        const merged = [
          ...ev.map((e) => ({ ...e, _kind: "evaluation" })),
          ...subs.map((s) => ({ ...s, _kind: "submission" })),
        ]
        return merged.find((x) => x.id === prev.id && x._kind === prev._kind) || merged[0] || null
      }
      const first =
        ev[0] ? { ...ev[0], _kind: "evaluation" } : subs[0] ? { ...subs[0], _kind: "submission" } : null
      return first
    })
  }

  useEffect(() => {
    try {
      const u = getInternUser()
      const role = (u.role || "intern").toLowerCase()
      if (role !== "intern" && role !== "demo" && !u.isDemo) {
        router.replace("/login")
        return
      }
    } catch {}
    load()
    const onStorage = (e) => {
      if (e.key === KEY_INTERN_EVALUATIONS || e.key === KEY_INTERN_SUBMISSIONS) load()
    }
    const id = setInterval(load, 2000)
    window.addEventListener("storage", onStorage)
    window.addEventListener(KEY_INTERN_EVALUATIONS, load)
    window.addEventListener(KEY_INTERN_SUBMISSIONS, load)
    return () => {
      clearInterval(id)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(KEY_INTERN_EVALUATIONS, load)
      window.removeEventListener(KEY_INTERN_SUBMISSIONS, load)
    }
  }, [router])

  const items = useMemo(() => {
    const evalBySubmission = new Map()
    evaluations.forEach((e) => {
      if (e.submissionId) evalBySubmission.set(String(e.submissionId), e)
    })

    const evalItems = evaluations.map((e) => ({
      ...e,
      _kind: "evaluation",
      title: e.taskName
        ? e.taskName
        : e.period
          ? `Performance — ${e.period}`
          : `Evaluation by ${e.mentorName || "Mentor"}`,
      subtitle: e.feedback?.slice(0, 80) || "Mentor evaluation received",
      score: e.totalScore,
      pending: false,
    }))

    const subItems = submissions
      .filter((s) => !evalBySubmission.has(String(s.id)))
      .map((s) => ({
        ...s,
        _kind: "submission",
        title: s.task || "Submission",
        subtitle:
          s.status === "Pending Review"
            ? "Awaiting mentor evaluation"
            : s.comments || s.status,
        score: s.evaluationScore ?? null,
        pending: s.status === "Pending Review" && s.evaluationScore == null,
      }))

    return [...evalItems, ...subItems].sort(
      (a, b) =>
        new Date(b.submittedAt || b.submittedOn || 0) -
        new Date(a.submittedAt || a.submittedOn || 0)
    )
  }, [evaluations, submissions])

  const detail = sel
  const isPerf = detail?._kind === "evaluation"
  const total = isPerf ? detail?.totalScore || 0 : 0
  const pieData = [
    { name: "Score", v: total, c: "#7C3AED" },
    { name: "Remaining", v: Math.max(0, 100 - total), c: "rgba(255,255,255,0.08)" },
  ]
  const rubrics = detail?.rubrics || DEFAULT_RUBRICS
  const scores = detail?.scores || {}

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
      <InternSidebar active="Evaluation" />
      <main className="flex-1 flex flex-col overflow-hidden p-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Star size={20} className="text-purple-400" /> My Evaluations
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            View mentor feedback on your submissions and performance evaluations.
          </p>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* List */}
          <div className="w-72 min-w-72 flex flex-col gap-2 overflow-y-auto">
            {items.length === 0 ? (
              <div style={{ ...G, padding: 16 }} className="text-xs text-gray-400 text-center">
                No evaluations yet. Submit a task from the Tasks page — your mentor&apos;s feedback will appear here.
              </div>
            ) : (
              items.map((item) => {
                const active = sel?.id === item.id && sel?._kind === item._kind
                return (
                  <button
                    key={`${item._kind}-${item.id}`}
                    onClick={() => setSel(item)}
                    className="text-left w-full p-3 rounded-xl border transition"
                    style={{
                      background: active ? "rgba(124,58,237,0.15)" : "#0f172a",
                      borderColor: active ? "rgba(124,58,237,0.5)" : "#1e293b",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{item.subtitle}</p>
                      </div>
                      {item.pending ? (
                        <Clock size={14} className="text-amber-400 flex-shrink-0" />
                      ) : item.score != null ? (
                        <span className="text-xs font-bold text-purple-400">{item.score}</span>
                      ) : (
                        <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[9px] text-gray-600 mt-1">
                      {item.submittedAt
                        ? new Date(item.submittedAt).toLocaleDateString()
                        : item.submittedOn || ""}
                    </p>
                  </button>
                )
              })
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {!detail ? (
              <div style={{ ...G, padding: 24 }} className="text-sm text-gray-400 text-center">
                Select an item to view evaluation details
              </div>
            ) : detail.pending || (detail._kind === "submission" && detail.status === "Pending Review") ? (
              <div style={{ ...G, padding: 24 }} className="flex flex-col items-center justify-center gap-4 min-h-[280px]">
                <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <Clock size={32} className="text-amber-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold">Awaiting mentor evaluation</h2>
                  <p className="text-xs text-gray-400 mt-2 max-w-md">
                    You submitted <strong className="text-white">{detail.task}</strong> on{" "}
                    {detail.submittedOn || new Date(detail.submittedAt).toLocaleDateString()}. Your mentor will
                    review it and the results will show here automatically.
                  </p>
                </div>
                {detail.file && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#111827] px-3 py-2 rounded-lg">
                    <FileText size={14} /> {detail.file} ({detail.fileSize})
                  </div>
                )}
              </div>
            ) : isPerf ? (
              <div className="flex gap-4 flex-col lg:flex-row">
                <div className="flex-1" style={{ ...G, padding: 16 }}>
                  <h2 className="text-sm font-bold mb-3">
                    Performance evaluation — {detail.internName || user.fullName}
                  </h2>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1e293b] text-gray-500">
                        {["Criteria", "Weight", "Max", "Score", "Comments"].map((h) => (
                          <th key={h} className="text-left py-2 px-2 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rubrics.map((r) => (
                        <tr key={r.name} className="border-b border-[#1e293b]/50">
                          <td className="py-2 px-2 text-white">{r.name}</td>
                          <td className="py-2 px-2 text-gray-400">{r.weight}%</td>
                          <td className="py-2 px-2 text-gray-400">{r.max}</td>
                          <td className="py-2 px-2 font-bold text-purple-400">{scores[r.name] ?? 0}</td>
                          <td className="py-2 px-2 text-gray-500">
                            {detail.criteriaComments?.[r.name] || "—"}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="py-2 px-2 font-bold">
                          Total
                        </td>
                        <td className="py-2 px-2 font-bold text-purple-400">{total}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-4">
                    <p className="text-[10px] text-gray-500 mb-1">Mentor feedback</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{detail.feedback}</p>
                  </div>
                </div>
                <div className="w-full lg:w-56 flex flex-col gap-3">
                  <div style={{ ...G, padding: 14 }} className="flex flex-col items-center">
                    <p className="text-xs font-semibold mb-3">Evaluation summary</p>
                    <div className="w-28 h-28 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={50}
                            dataKey="v"
                            strokeWidth={0}
                            startAngle={90}
                            endAngle={-270}
                          >
                            {pieData.map((d, i) => (
                              <Cell key={i} fill={d.c} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">{total}</span>
                        <span className="text-[10px] text-gray-400">{detail.gradeLabel || gradeLabel(total)}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-3 text-center">Grade: {detail.grade || "—"}</p>
                  </div>
                  <div style={{ ...G, padding: 12 }} className="flex items-center gap-2">
                    <User size={14} className="text-purple-400" />
                    <div>
                      <p className="text-xs font-semibold">{detail.mentorName || "Mentor"}</p>
                      <p className="text-[10px] text-gray-500">Mentor</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ ...G, padding: 24 }}>
                <h2 className="text-sm font-bold mb-2">Review — {detail.task}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[10px] px-2 py-1 rounded-full"
                    style={{
                      color: detail.status === "Approved" ? "#22c55e" : "#f59e0b",
                      background:
                        detail.status === "Approved"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(245,158,11,0.15)",
                    }}
                  >
                    {detail.status}
                  </span>
                  {detail.evaluationScore != null && (
                    <span className="text-xs font-bold text-purple-400">
                      Score: {detail.evaluationScore}/100
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500">Submitted {detail.submittedOn}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">Mentor feedback</p>
                <p className="text-sm text-gray-200 leading-relaxed">{detail.comments || "No comment provided."}</p>
                {detail.mentor && (
                  <p className="text-[10px] text-gray-500 mt-4 flex items-center gap-1">
                    <User size={12} /> {detail.mentor}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )

}

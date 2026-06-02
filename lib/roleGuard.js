"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Role → home route mapping
export const ROLE_ROUTES = {
  intern:      "/intern/dashboard",
  mentor:      "/mentor/dashboard",
  evaluator:   "/mentor/dashboard",
  admin:       "/admin/dashboard",
  institution: "/institution/dashboard",
}

/**
 * getUser(expectedRole?) — reads role-specific key first, falls back to shared key.
 * This ensures each portal only shows its own logged-in user even when
 * multiple portals are open in different tabs.
 */
export function getUser(expectedRole) {
  try {
    if (expectedRole) {
      const specific = localStorage.getItem(`user_${expectedRole}`)
      if (specific) return JSON.parse(specific)
    }

    // AUTO detect from URL
    const path = window.location.pathname
    const roleFromPath =
      path.startsWith("/intern/") ? "intern" :
      path.startsWith("/mentor/") ? "mentor" :
      path.startsWith("/institution/") ? "institution" :
      path.startsWith("/admin/") ? "admin" :
      path.startsWith("/evaluation/") ? "evaluator" :
      null

    if (roleFromPath) {
      const specific = localStorage.getItem(`user_${roleFromPath}`)
      if (specific) return JSON.parse(specific)
    }

    // ❌ REMOVE shared fallback completely
    return {}
  } catch {
    return {}
  }
}
export function getToken() {
  try { return localStorage.getItem("token") || "" } catch { return "" }
}

// Hook — redirects if role doesn't match allowed list
export function useRoleGuard(allowedRoles) {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    const token = getToken()

    // FIX 1: don't depend on user.id
    if (!token || !user || !user.role) {
      router.replace("/login")
      return
    }

    const role = String(user.role).toLowerCase()

    // FIX 2: normalize allowedRoles too
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase())

    if (!normalizedAllowed.includes(role)) {
      router.replace(ROLE_ROUTES[role] || "/login")
    }
  }, [router, allowedRoles])
}

export function logout(router) {
  // Clear only the current portal's user key
  if (typeof window !== "undefined") {
    const path = window.location.pathname
    const roleFromPath =
      path.startsWith("/intern/")      ? "intern" :
      path.startsWith("/mentor/")      ? "mentor" :
      path.startsWith("/institution/") ? "institution" :
      path.startsWith("/admin/")       ? "admin" :
      path.startsWith("/evaluation/")  ? "evaluator" : null
    if (roleFromPath) localStorage.removeItem(`user_${roleFromPath}`)
  }
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  router.push("/login")
}

"use client"
import { ThemeProvider } from "../lib/theme"
import { useEffect } from "react"

export default function Providers({ children }) {
  useEffect(() => {
    const removeDebugOverlay = () => {
      const selectors = [
        "#react-scan-root",
        "[data-react-scan]",
        "[data-nextjs-dev-tools-button]",
        "[data-nextjs-toast]",
        "nextjs-portal",
      ]

      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => el.remove())
      })

      // Remove any floating badge that shows "Rendering..."
      document.querySelectorAll("div,span,button").forEach((el) => {
        const text = (el.textContent || "").trim().toLowerCase()
        const style = window.getComputedStyle(el)
        if (
          text.includes("rendering") &&
          (style.position === "fixed" || style.position === "sticky")
        ) {
          el.remove()
        }
      })
    }

    removeDebugOverlay()
    const id = setInterval(removeDebugOverlay, 800)
    const observer = new MutationObserver(removeDebugOverlay)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearInterval(id)
      observer.disconnect()
    }
  }, [])

  return <ThemeProvider>{children}</ThemeProvider>
}

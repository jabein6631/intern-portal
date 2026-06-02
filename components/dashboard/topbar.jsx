import { Search, Bell } from "lucide-react"

export function Topbar() {
  return (
    <div className="flex items-center justify-between mb-5">

      <div className="relative w-[350px]">

        <Search
          className="absolute left-3 top-3 text-gray-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-[#111827] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none"
        />

      </div>

      <div className="flex items-center gap-4">

        <button className="relative p-3 rounded-xl bg-[#111827] border border-gray-700">

          <Bell className="text-white" size={20} />

          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />

        </button>

        <div className="flex items-center gap-3 bg-[#111827] border border-gray-700 rounded-xl px-4 py-2">

          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-10 h-10 rounded-full"
          />

          <div>
            <h3 className="text-white text-sm font-semibold">
              Arjun
            </h3>

            <p className="text-gray-400 text-xs">
              Intern
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
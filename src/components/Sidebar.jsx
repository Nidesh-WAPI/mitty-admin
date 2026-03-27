import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/orders', icon: '📦', label: 'Orders' },
  { path: '/products', icon: '👕', label: 'Products' },
  { path: '/inventory', icon: '📋', label: 'Inventory' },
  { path: '/customers', icon: '👥', label: 'Customers' },
  { path: '/reviews', icon: '⭐', label: 'Reviews' },
  { path: '/abandoned-payments', icon: '💳', label: 'Abandoned Payments' },
  { path: '/contact-messages', icon: '💬', label: 'Messages' },
  { path: '/policies', icon: '📄', label: 'Policies' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-white">Mitty</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1">✕</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-800">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>🛒</span> View Store
          </a>
        </div>
      </aside>
    </>
  )
}

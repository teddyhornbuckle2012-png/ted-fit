import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={active ? '#DE7428' : 'none'}
      stroke={active ? '#DE7428' : '#6B7280'}
      strokeWidth="2"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
    </svg>
  );
}

function DumbbellIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#DE7428' : '#6B7280'}
      strokeWidth="2"
      className="w-6 h-6"
    >
      <rect x="2" y="10" width="4" height="4" rx="1" fill={active ? '#DE7428' : 'none'} />
      <rect x="18" y="10" width="4" height="4" rx="1" fill={active ? '#DE7428' : 'none'} />
      <rect x="5" y="8" width="3" height="8" rx="1" fill={active ? '#DE7428' : 'none'} />
      <rect x="16" y="8" width="3" height="8" rx="1" fill={active ? '#DE7428' : 'none'} />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2.5" />
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#DE7428' : '#6B7280'}
      strokeWidth="2"
      className="w-6 h-6"
    >
      <polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={active ? '#DE7428' : '#6B7280'}
      />
    </svg>
  );
}

function GearIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#DE7428' : '#6B7280'}
      strokeWidth="2"
      className="w-6 h-6"
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </svg>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  end?: boolean;
}

function NavItem({ to, label, icon, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors',
          isActive ? 'text-forge-orange' : 'text-forge-text-muted'
        )
      }
    >
      {({ isActive }) => (
        <>
          {icon(isActive)}
          <span className={clsx('text-xs font-medium', isActive ? 'text-forge-orange' : '')}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-forge-cream flex flex-col">
      <main className="flex-1 overflow-y-auto page-content">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 bottom-safe z-50">
        <div className="flex items-center justify-around px-2 pt-1 pb-1">
          <NavItem
            to="/"
            end
            label="Today"
            icon={(active) => <HomeIcon active={active} />}
          />
          <NavItem
            to="/workout"
            label="Workout"
            icon={(active) => <DumbbellIcon active={active} />}
          />
          <NavItem
            to="/progress"
            label="Progress"
            icon={(active) => <ChartIcon active={active} />}
          />
          <NavItem
            to="/settings"
            label="Settings"
            icon={(active) => <GearIcon active={active} />}
          />
        </div>
      </nav>
    </div>
  );
}

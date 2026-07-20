type IconProps = { className?: string };

export function IconDashboard({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="7" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="12" width="7" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="16" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function IconRequests({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 3.5V2h6v1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconUsers({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M18.5 20c0-2.6-1.6-4.5-3.8-5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconTruck({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2.5" y="7" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M13.5 10h4l3 3v3h-7v-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function IconSearch({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconLogOut({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15 8l4 4-4 4M19 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
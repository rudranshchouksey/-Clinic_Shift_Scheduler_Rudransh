import { LoginForm } from '@/features/auth/components/LoginForm'
import { CalendarDays } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Sign in — ClinicSync',
  description: 'Sign in to your ClinicSync account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary via-primary to-primary/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <CalendarDays className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">ClinicSync</span>
          </Link>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              Smarter scheduling for modern clinics
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Empower your team with effortless shift management. Managers create, staff claim —
              it&apos;s that simple.
            </p>
            <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-[10px] font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>Trusted by healthcare teams</span>
            </div>
          </div>

          <p className="text-sm text-primary-foreground/40">
            &copy; {new Date().getFullYear()} ClinicSync. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8 text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <CalendarDays className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">ClinicSync</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Sign in to your account to continue
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

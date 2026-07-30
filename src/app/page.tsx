import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays,
  Users,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export default async function Home() {
  const session = await getSession()

  if (session) {
    if (session.user.role === 'MANAGER') {
      redirect('/manager/dashboard')
    } else {
      redirect('/staff/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">ClinicSync</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 transform">
            <div className="h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors cursor-default"
            >
              ✨ The modern way to schedule
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-balance mx-auto max-w-4xl leading-tight">
              Smarter scheduling for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                modern clinics
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
              Empower your managers to effortlessly create shifts and allow staff to claim them in
              seconds. Say goodbye to spreadsheet chaos and hello to seamless coverage.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base group">
                  Start Scheduling Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 text-base"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section id="demo" className="py-12 bg-muted/30 border-y">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-5xl rounded-xl border bg-background shadow-2xl overflow-hidden transition-all hover:shadow-primary/5 duration-500">
              {/* Fake Browser Chrome */}
              <div className="flex items-center px-4 py-3 border-b bg-muted/50">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-400/80"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="mx-auto flex h-6 w-full max-w-md items-center justify-center rounded-md bg-background text-xs text-muted-foreground shadow-sm">
                  clinicsync.app/manager/dashboard
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-6 md:p-8 grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Upcoming Shifts</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage this week&apos;s coverage
                      </p>
                    </div>
                    <Button size="sm">Create Shift</Button>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-md ${i === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                          >
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Morning Shift - Triage</p>
                            <p className="text-sm text-muted-foreground">08:00 AM - 04:00 PM</p>
                          </div>
                        </div>
                        <Badge variant={i === 1 ? 'secondary' : 'default'}>
                          {i === 1 ? 'Open' : 'Covered'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Weekly Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">85%</div>
                      <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
                      <div className="mt-4 h-2 w-full bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[85%] rounded-full"></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start text-xs h-9">
                        <FileSpreadsheet className="mr-2 h-3.5 w-3.5" /> Import Roster CSV
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-xs h-9">
                        <Users className="mr-2 h-3.5 w-3.5" /> Manage Staff
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Everything you need to run your clinic
              </h2>
              <p className="text-lg text-muted-foreground text-balance">
                Powerful tools designed specifically for healthcare environments. Focus on patient
                care, not paperwork.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<CalendarDays />}
                title="Shift Management"
                description="Create, edit, and publish shifts with ease. Managers have full control over the schedule."
              />
              <FeatureCard
                icon={<Users />}
                title="Staff Scheduling"
                description="Staff can browse open shifts and claim them instantly based on their availability."
              />
              <FeatureCard
                icon={<FileSpreadsheet />}
                title="CSV Import"
                description="Bulk import your existing staff rosters and past schedules via simple CSV uploads."
              />
              <FeatureCard
                icon={<BarChart3 />}
                title="Coverage Dashboard"
                description="Get a bird's-eye view of your clinic's coverage rates and identify staffing gaps instantly."
              />
              <FeatureCard
                icon={<ShieldCheck />}
                title="Role-Based Access"
                description="Secure role-based authentication ensures managers and staff only see what they need to."
              />
              <FeatureCard
                icon={<CheckCircle2 />}
                title="Import Reports"
                description="Detailed reporting on imported data, ensuring your records are always accurate and up-to-date."
              />
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-16 bg-muted/30 border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Built with modern technology
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              {[
                'Next.js 15',
                'TypeScript',
                'Prisma ORM',
                'PostgreSQL',
                'Better Auth',
                'Tailwind CSS',
              ].map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">ClinicSync</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Clinic Shift Scheduler. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card/50 hover:bg-card">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

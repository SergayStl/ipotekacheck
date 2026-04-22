import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DashboardSidebar from '@/components/DashboardSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <DashboardSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  )
}

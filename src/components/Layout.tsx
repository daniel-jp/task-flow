import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          collapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

import React from 'react';
import { Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useData } from './context/DataContext';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Rentals from './components/Rentals';
import CreateRentalWizard from './components/NewRentalForm';
import CalendarView from './components/CalendarView';
import Settings from './components/Settings';
import ContractView from './components/ContractView';
import { DashboardIcon, FleetIcon, RentalsIcon, CalendarIcon, SettingsIcon } from './components/Icons';
import Login from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import CustomerFormPublic from './components/CustomerFormPublic';
import { Card } from './components/ui';

const NavLink: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to === '/rentals' && location.pathname.startsWith('/rentals/'));
    return (
        <Link to={to} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}>
            {icon}
            <span className="ml-3">{children}</span>
        </Link>
    );
};

const MainLayout: React.FC = () => {
    const { logout, loading } = useData();

    return (
        <div className="flex h-screen bg-background text-text-primary">
            <aside className="w-64 flex-shrink-0 bg-surface border-r border-border p-4 flex flex-col">
                <div className="text-2xl font-bold mb-8 text-primary">VanRent</div>
                <nav className="space-y-2">
                    <NavLink to="/" icon={<DashboardIcon className="h-5 w-5" />}>Dashboard</NavLink>
                    <NavLink to="/fleet" icon={<FleetIcon className="h-5 w-5" />}>Vozový park</NavLink>
                    <NavLink to="/rentals" icon={<RentalsIcon className="h-5 w-5" />}>Půjčovné</NavLink>
                    <NavLink to="/calendar" icon={<CalendarIcon className="h-5 w-5" />}>Kalendář</NavLink>
                </nav>
                <div className="mt-auto">
                    <NavLink to="/settings" icon={<SettingsIcon className="h-5 w-5" />}>Nastavení</NavLink>
                     <button onClick={logout} className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-text-secondary hover:bg-gray-100 w-full text-left mt-2">
                        Odhlásit se
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Card><p>Načítání dat...</p></Card>
                    </div>
                ) : <Outlet />}
            </main>
        </div>
    );
};

const App = () => {
  return (
    <Routes>
      {/* Public routes render without the MainLayout */}
      <Route path="/login" element={<Login />} />
      <Route path="/public/request" element={<CustomerFormPublic />} />
      
      {/* Protected routes are nested inside a route that renders the MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/new" element={<CreateRentalWizard />} />
          <Route path="/rentals/:id" element={<ContractView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Redirect any unknown paths */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

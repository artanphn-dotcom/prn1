import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Users, Wallet, FileText, Menu, X, Sun, Moon, Languages, Heart, ShoppingBag, Home, Download, Calendar } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { ExportService } from '../services/export';
import { Button, Modal, ToastContainer } from './UI';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme, language, setLanguage, t, toasts, removeToast, selectedYear, setSelectedYear } = useAppContext();

  const navItems = [
    { to: '/', icon: LayoutDashboard, labelKey: 'financialStatus' },
    { to: '/apartments', icon: Building, labelKey: 'apartments' },
    { to: '/tenants', icon: Users, labelKey: 'tenants' },
    { to: '/rent-payments', icon: Wallet, labelKey: 'rentPayments' },
    { to: '/family-support', icon: Heart, labelKey: 'familySupport' },
    { to: '/apartment-expenses', icon: Home, labelKey: 'aptExpenses' },
    { to: '/personal-expenses', icon: ShoppingBag, labelKey: 'personalExpenses' },
    { to: '/documents', icon: FileText, labelKey: 'documents' },
  ];

  const getPageTitle = () => {
    // @ts-ignore
    const current = navItems.find(item => item.to === location.pathname);
    // @ts-ignore
    return current ? t(current.labelKey) : t('financialStatus');
  };

  const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i + 1); // Future year + 4 past years

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-500 rounded-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">VIT Apartment</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg transition-colors group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {/* @ts-ignore */}
              <span className="font-medium">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4 px-2">
             <div className="flex space-x-1">
               <button 
                 onClick={toggleTheme} 
                 className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                 title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
               >
                 {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               <button 
                 onClick={() => setExportModalOpen(true)}
                 className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                 title={t('exportData')}
               >
                 <Download className="w-5 h-5" />
               </button>
             </div>
             <button 
               onClick={() => setLanguage(language === 'en' ? 'al' : 'en')}
               className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center font-bold text-sm"
               title="Switch Language"
             >
               <Languages className="w-5 h-5 mr-1" />
               {language.toUpperCase()}
             </button>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">AD</div>
            <div>
              <p className="text-sm font-medium text-white">{t('adminUser')}</p>
              <p className="text-xs text-slate-400">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 z-30 transition-colors">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center space-x-4">
               {/* Year Selector */}
               <div className="hidden sm:flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 rounded-md px-3 py-1.5">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium border-r border-gray-300 dark:border-slate-600 pr-2 mr-2">{t('year')}</span>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-transparent border-none text-sm font-semibold text-gray-900 dark:text-white focus:ring-0 cursor-pointer outline-none"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
               </div>
               <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block border-l border-gray-200 dark:border-slate-600 pl-4">{t('welcomeBack')}, Admin</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 transition-colors">
           <Outlet />
        </main>
      </div>

      {/* Export Modal */}
      <Modal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} title={t('exportData')}>
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('exportSubtitle')}</p>
            <div className="grid gap-3">
                <Button variant="secondary" onClick={ExportService.exportTransactions} className="w-full flex justify-start items-center">
                    <Wallet className="w-4 h-4 mr-3 text-indigo-500" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t('financialRecords')}</span>
                      <span className="text-xs text-gray-400">transactions.csv</span>
                    </div>
                </Button>
                <Button variant="secondary" onClick={ExportService.exportTenants} className="w-full flex justify-start items-center">
                    <Users className="w-4 h-4 mr-3 text-blue-500" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t('tenantList')}</span>
                      <span className="text-xs text-gray-400">tenants.csv</span>
                    </div>
                </Button>
                <Button variant="secondary" onClick={ExportService.exportApartments} className="w-full flex justify-start items-center">
                    <Building className="w-4 h-4 mr-3 text-green-500" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t('propertyList')}</span>
                      <span className="text-xs text-gray-400">apartments.csv</span>
                    </div>
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
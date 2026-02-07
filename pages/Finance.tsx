import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DB } from '../services/db';
import { Transaction, TransactionType, ExpenseCategory, Apartment } from '../types';
import { Button, Card, Input, Modal, Select, Badge } from '../components/UI';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const Finance = () => {
  const { t, selectedYear, showToast } = useAppContext();
  const location = useLocation();
  
  // State for data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    isPaid: true
  });

  // Determine current view mode based on path
  const getPageContext = () => {
    switch(location.pathname) {
      case '/rent-payments': 
        return { 
          title: t('rentPayments'), 
          filter: (t: Transaction) => t.type === TransactionType.INCOME && t.category === ExpenseCategory.RENT,
          defaultType: TransactionType.INCOME,
          defaultCat: ExpenseCategory.RENT
        };
      case '/family-support': 
        return { 
          title: t('familySupport'), 
          filter: (t: Transaction) => t.type === TransactionType.EXPENSE && t.category === ExpenseCategory.FAMILY_SUPPORT,
          defaultType: TransactionType.EXPENSE,
          defaultCat: ExpenseCategory.FAMILY_SUPPORT
        };
      case '/apartment-expenses':
        return { 
          title: t('aptExpenses'), 
          filter: (t: Transaction) => t.type === TransactionType.EXPENSE && t.category !== ExpenseCategory.FAMILY_SUPPORT && t.category !== ExpenseCategory.PERSONAL,
          defaultType: TransactionType.EXPENSE,
          defaultCat: ExpenseCategory.MAINTENANCE
        };
      case '/personal-expenses':
        return { 
          title: t('personalExpenses'), 
          filter: (t: Transaction) => t.type === TransactionType.EXPENSE && t.category === ExpenseCategory.PERSONAL,
          defaultType: TransactionType.EXPENSE,
          defaultCat: ExpenseCategory.PERSONAL
        };
      default:
        // Default View (fallback)
        return {
          title: t('trackFinance'),
          filter: () => true,
          defaultType: TransactionType.EXPENSE,
          defaultCat: ExpenseCategory.OTHER
        };
    }
  };

  const pageContext = getPageContext();

  useEffect(() => {
    loadData();
    // Reset form defaults when page changes
    setFormData({
      type: pageContext.defaultType,
      category: pageContext.defaultCat,
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      isPaid: true
    });
  }, [location.pathname, selectedYear]); // Reload when year changes

  const loadData = () => {
    setTransactions(DB.transactions.getAll());
    setApartments(DB.apartments.getAll());
  };

  // Filter by Page Type AND Selected Year AND Selected Apartment
  const filteredTransactions = transactions
    .filter(t => new Date(t.date).getFullYear() === selectedYear)
    .filter(pageContext.filter)
    .filter(t => selectedApartmentId === '' || t.apartmentId === selectedApartmentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate Summary Stats
  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    DB.transactions.add(formData as Omit<Transaction, 'id'>);
    showToast(t('savedSuccess'), 'success');
    
    setIsModalOpen(false);
    // Reset form to context defaults
    setFormData({ 
      type: pageContext.defaultType, 
      category: pageContext.defaultCat, 
      date: new Date().toISOString().split('T')[0], 
      isRecurring: false, 
      isPaid: true 
    });
    loadData();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent any row clicks
    if (window.confirm(t('deleteConfirmTrans'))) {
      DB.transactions.delete(id);
      showToast(t('deleteSuccess'), 'success');
      loadData();
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm(t('deleteAllConfirm'))) {
      const ids = filteredTransactions.map(t => t.id);
      DB.transactions.deleteMany(ids);
      showToast(t('deleteSuccess'), 'success');
      loadData();
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, transaction: Transaction) => {
    e.stopPropagation();
    const newStatus = !transaction.isPaid;
    
    DB.transactions.update(transaction.id, { isPaid: newStatus });

    // Auto-generate next recurring instance if marking as paid
    if (transaction.isRecurring && newStatus === true) {
      const current = new Date(transaction.date);
      // Logic to add 1 month safely
      const nextMonth = new Date(current);
      nextMonth.setMonth(current.getMonth() + 1);
      
      // Check for month rollover overshoot (e.g. Jan 31 -> Mar 3)
      if (nextMonth.getMonth() !== (current.getMonth() + 1) % 12) {
         nextMonth.setDate(0); // Set to last day of the intended month
      }
      
      const nextDateStr = nextMonth.toISOString().split('T')[0];

      // Check for duplicate to prevent creating it multiple times if toggled back and forth
      const allTrans = DB.transactions.getAll();
      const duplicate = allTrans.find(t => 
        t.date === nextDateStr &&
        t.amount === transaction.amount &&
        t.category === transaction.category &&
        t.apartmentId === transaction.apartmentId &&
        t.type === transaction.type &&
        t.description === transaction.description
      );

      if (!duplicate) {
         const newTrans: Omit<Transaction, 'id'> = {
           date: nextDateStr,
           amount: transaction.amount,
           type: transaction.type,
           category: transaction.category,
           description: transaction.description,
           apartmentId: transaction.apartmentId,
           isRecurring: true,
           isPaid: false
         };
         DB.transactions.add(newTrans);
         showToast('Generated next recurring entry', 'success');
      }
    }

    loadData();
  };

  const getApartmentName = (id?: string) => apartments.find(a => a.id === id)?.name || '-';

  const formatCategoryLabel = (cat: string) => {
     switch(cat) {
       case ExpenseCategory.RENT: return t('catRent');
       case ExpenseCategory.MAINTENANCE: return t('catMaintenance');
       case ExpenseCategory.FAMILY_SUPPORT: return t('catFamilySupport');
       case ExpenseCategory.ELECTRICITY: return t('catElectricity');
       case ExpenseCategory.WATER: return t('catWater');
       case ExpenseCategory.TRASH: return t('catTrash');
       case ExpenseCategory.TAX: return t('catTax');
       case ExpenseCategory.PERSONAL: return t('catPersonal');
       default: return t('catOther');
     }
  };

  // Determine available categories based on context
  const getCategoryOptions = () => {
    if (pageContext.defaultType === TransactionType.INCOME) {
      return [{ label: t('catRent'), value: ExpenseCategory.RENT }];
    }

    let allowedCats = Object.values(ExpenseCategory).filter(c => c !== ExpenseCategory.RENT);

    if (location.pathname === '/family-support') {
      allowedCats = [ExpenseCategory.FAMILY_SUPPORT];
    } else if (location.pathname === '/personal-expenses') {
      allowedCats = [ExpenseCategory.PERSONAL];
    } else if (location.pathname === '/apartment-expenses') {
      allowedCats = allowedCats.filter(c => c !== ExpenseCategory.FAMILY_SUPPORT && c !== ExpenseCategory.PERSONAL);
    }
    
    return allowedCats.map(c => ({ label: formatCategoryLabel(c), value: c }));
  };

  return (
    <div>
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{pageContext.title}</h2>
            <span className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{selectedYear}</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{t('trackFinance')}</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {filteredTransactions.length > 0 && (
            <Button variant="danger" onClick={handleDeleteAll} title={t('deleteAll')} className="px-3">
               <Trash2 className="w-4 h-4 md:mr-2" />
               <span className="hidden md:inline">{t('deleteAll')}</span>
            </Button>
          )}
          <select 
            className="flex-1 md:flex-none rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedApartmentId}
            onChange={(e) => setSelectedApartmentId(e.target.value)}
          >
            <option value="">{t('allApartments')}</option>
            {apartments.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addEntry')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('income')}</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome)}</h3>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('expenses')}</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</h3>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </Card>

        <Card className={`p-4 flex items-center justify-between border-l-4 ${netBalance >= 0 ? 'border-l-indigo-500' : 'border-l-orange-500'}`}>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('netProfit')}</p>
            <h3 className={`text-xl font-bold ${netBalance >= 0 ? 'text-gray-900 dark:text-white' : 'text-orange-600 dark:text-orange-400'}`}>
              {formatCurrency(netBalance)}
            </h3>
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('type')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('description')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('apartment')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('frequency')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('status')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('amount')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.type === TransactionType.INCOME ? (
                        <Badge color="green">{t('income')}</Badge>
                      ) : (
                        <Badge color="red">{t('expense')}</Badge>
                      )}
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{formatCategoryLabel(transaction.category)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getApartmentName(transaction.apartmentId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.isRecurring ? (
                        <Badge color="blue">{t('recurring')}</Badge>
                      ) : (
                        <Badge color="gray">{t('oneTime')}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => handleToggleStatus(e, transaction)} title="Click to toggle status">
                      {transaction.isPaid ? (
                        <Badge color="green">{t('paid')}</Badge>
                      ) : (
                        <Badge color="red">{t('unpaid')}</Badge>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${transaction.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.type === TransactionType.INCOME ? '+' : '-'}€{transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        onClick={(e) => handleDelete(e, transaction.id)} 
                        className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        title={t('deleteConfirmTrans')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('noTrans')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredTransactions.map(transaction => (
          <Card key={transaction.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-medium text-gray-400">{new Date(transaction.date).toLocaleDateString()}</span>
                <h4 className="font-semibold text-gray-900 dark:text-white mt-1">{transaction.description}</h4>
              </div>
              <div className={`text-lg font-bold ${transaction.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {transaction.type === TransactionType.INCOME ? '+' : '-'}€{transaction.amount}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
               {transaction.type === TransactionType.INCOME ? (
                  <Badge color="green">{t('income')}</Badge>
                ) : (
                  <Badge color="red">{t('expense')}</Badge>
                )}
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300">
                 {formatCategoryLabel(transaction.category)}
               </span>
               {transaction.apartmentId && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {getApartmentName(transaction.apartmentId)}
                  </span>
               )}
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-700 pt-3 mt-2">
              <div className="flex gap-2">
                 <div onClick={(e) => handleToggleStatus(e, transaction)} className="cursor-pointer active:opacity-70">
                   {transaction.isPaid ? (
                      <Badge color="green">{t('paid')}</Badge>
                    ) : (
                      <Badge color="red">{t('unpaid')}</Badge>
                    )}
                 </div>
                 {transaction.isRecurring && <Badge color="blue">{t('recurring')}</Badge>}
              </div>
              
              <button 
                onClick={(e) => handleDelete(e, transaction.id)} 
                className="p-2 -mr-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 active:bg-red-50 dark:active:bg-red-900/20 rounded-full transition-colors"
                title={t('deleteConfirmTrans')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </Card>
        ))}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-10 px-6 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 text-gray-500 dark:text-gray-400">
             {t('noTrans')}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('newTransaction')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Adding to: <span className="text-indigo-600 dark:text-indigo-400">{pageContext.title}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t('date')} type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <Input label={`${t('amount')} (€)`} type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
          </div>

          <Select 
            label={t('category')}
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
            options={getCategoryOptions()}
          />

          <Select 
            label={`${t('apartment')} (Optional)`}
            value={formData.apartmentId || ''}
            onChange={e => setFormData({...formData, apartmentId: e.target.value})}
            options={[
              { label: t('generalGlobal'), value: '' },
              ...apartments.map(a => ({ label: a.name, value: a.id }))
            ]}
          />

          <Input label={t('description')} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} required />

          <div className="flex flex-col space-y-2 pt-2">
             <div className="flex items-center space-x-2">
                <input type="checkbox" id="recurring" checked={formData.isRecurring} onChange={e => setFormData({...formData, isRecurring: e.target.checked})} className="rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">{t('recurringTrans')}</label>
             </div>
             <div className="flex items-center space-x-2">
                <input type="checkbox" id="isPaid" checked={formData.isPaid} onChange={e => setFormData({...formData, isPaid: e.target.checked})} className="rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="isPaid" className="text-sm text-gray-700 dark:text-gray-300">{t('markAsPaid')}</label>
             </div>
          </div>

           <div className="flex justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">{t('cancel')}</Button>
            <Button type="submit">{t('saveEntry')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
import { Tab } from '@headlessui/react'
import { classNames } from '../utils/classNames'
import KPICards from './KPICards'
import AssetsTable from './AssetsTable'
import LiabilitiesTable from './LiabilitiesTable'
import IncomeTable from './IncomeTable'
import ExpensesTable from './ExpensesTable'
import BillsTable from './BillsTable'

const tabs = [
  { name: 'Overview', component: KPICards, icon: '📊' },
  { name: 'Assets', component: AssetsTable, icon: '🏠' },
  { name: 'Liabilities', component: LiabilitiesTable, icon: '💳' },
  { name: 'Income', component: IncomeTable, icon: '💰' },
  { name: 'Expenses', component: ExpensesTable, icon: '📈' },
  { name: 'Bills', component: BillsTable, icon: '📋' },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-blue-600">
          Financial Overview
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your assets, liabilities, income, and expenses across different scenarios with our intuitive planning tools.
        </p>
      </div>

      {/* Tabbed interface */}
      <Tab.Group>
        <Tab.List className="tab-list">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'tab-button',
                  selected ? 'tab-button-active' : 'tab-button-inactive'
                )
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels className="mt-8">
          {tabs.map((tab, idx) => (
            <Tab.Panel key={idx} className="card">
              <tab.component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

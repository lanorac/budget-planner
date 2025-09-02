import { Tab } from '@headlessui/react'
import { useState } from 'react'
import { classNames } from '../utils/classNames'
import KPICards from './KPICards'
import AssetsTable from './AssetsTable'
import { LiabilitiesTable } from './LiabilitiesTable'
import { IncomeTable } from './IncomeTable'
import { ExpensesTable } from './ExpensesTable'
import BillsTable from './BillsTable'
import ScenarioManagementModal from './ScenarioManagementModal'
import { useScenarios } from '../hooks/useScenarios'

// Sample planner ID - in a real app, this would come from user context/authentication
const SAMPLE_PLANNER_ID = '550e8400-e29b-41d4-a716-446655440000'

const tabs = [
  { name: 'Overview', component: KPICards, icon: '📊', props: { isOverview: true } },
  { name: 'Assets', component: AssetsTable, icon: '🏠', props: { plannerId: SAMPLE_PLANNER_ID } },
  { name: 'Liabilities', component: LiabilitiesTable, icon: '💳', props: { plannerId: SAMPLE_PLANNER_ID } },
  { name: 'Income', component: IncomeTable, icon: '💰', props: { plannerId: SAMPLE_PLANNER_ID } },
  { name: 'Expenses', component: ExpensesTable, icon: '📈', props: { plannerId: SAMPLE_PLANNER_ID } },
  { name: 'Bills', component: BillsTable, icon: '📋', props: { plannerId: SAMPLE_PLANNER_ID } },
]

export default function Dashboard() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const [selectedScenario, setSelectedScenario] = useState<string>('ALL')
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false)

  const { data: scenarios = [] } = useScenarios(SAMPLE_PLANNER_ID)

  const handleTabChange = (index: number) => {
    setSelectedTabIndex(index)
  }

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
      <Tab.Group selectedIndex={selectedTabIndex} onChange={handleTabChange}>
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
              <tab.component 
                {...(tab.props || {})} 
                plannerId={tab.props?.plannerId || SAMPLE_PLANNER_ID}
                onNavigateToTab={handleTabChange} 
                scenarios={scenarios}
                {...(tab.props?.isOverview ? {
                  selectedScenario,
                  onScenarioChange: setSelectedScenario,
                  onOpenScenarioModal: () => setIsScenarioModalOpen(true)
                } : {})}
              />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>

      {/* Scenario Management Modal */}
      <ScenarioManagementModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        plannerId={SAMPLE_PLANNER_ID}
      />
    </div>
  )
}

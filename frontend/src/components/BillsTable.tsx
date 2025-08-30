export default function BillsTable() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Bills</h3>
          <p className="mt-2 text-sm text-gray-700">
            Track your recurring household bills and utilities.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button type="button" className="btn-primary">
            Add Bill
          </button>
        </div>
      </div>
      <div className="mt-8">
        <p className="text-gray-500">Bills table - to be implemented</p>
      </div>
    </div>
  )
}

type Props = {
  searchTerm: string
  statusFilter: string | null
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export default function EmployeeFilters({ searchTerm, statusFilter, onSearchChange, onStatusChange }: Props) {
  return (
      <div className="staff-employees-page__filters">
        <div className="staff-employees-page__search">
          <label
            htmlFor="employee-search"
            className="staff-employees-page__search-label"
          >
            Search Employees
          </label>

          <input
            id="employee-search"
            type="search"
            value={searchTerm}
            placeholder="Search by name, email or job title..."
            className="staff-employees-page__search-input"
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
          />
        </div>

        <div className="staff-employees-page__filter">
          <label
            htmlFor="employee-status-filter"
            className="staff-employees-page__search-label"
          >
            Status
          </label>

          <select
            id="employee-status-filter"
            className="staff-employees-page__filter-select"
            value={statusFilter ?? 'all'}
            onChange={(event) =>
              onStatusChange(
                event.target.value
              )
            }
          >
            <option value="all">
              All Employees
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>
  )
}

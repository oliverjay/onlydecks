import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ChevronDown } from 'lucide-react'

export default function FilterBar({ categories, locations, filters, onFilterChange, onPremiumFilterClick }) {
  const [openDropdown, setOpenDropdown] = useState(null)

  const fundingRanges = [
    { label: 'Under $50K', value: 'under-50k', min: 0, max: 5000000 },
    { label: '$50K — $250K', value: '50k-250k', min: 5000000, max: 25000000 },
    { label: '$250K — $1M', value: '250k-1m', min: 25000000, max: 100000000 },
    { label: '$1M — $5M', value: '1m-5m', min: 100000000, max: 500000000 },
    { label: '$5M — $10M', value: '5m-10m', min: 500000000, max: 1000000000 },
    { label: '$10M+', value: '10m-plus', min: 1000000000, max: null }
  ]

  // locations prop is passed in from parent component

  const dateRanges = [
    { label: '< 7 days', value: 'premium', isPremium: true },
    { label: '7+ days ago', value: '7' },
    { label: '30+ days ago', value: '30' },
    { label: 'All time', value: '' }
  ]

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const handleFilterSelect = (filterType, value, isPremium = false) => {
    if (isPremium) {
      onPremiumFilterClick()
      setOpenDropdown(null)
      return
    }
    onFilterChange({ [filterType]: value })
    setOpenDropdown(null)
  }

  const getFilterLabel = (filterType, value) => {
    switch (filterType) {
      case 'category':
        const category = categories.find(c => c.slug === value)
        return category ? category.name : 'Category'
      case 'fundingRange':
        const range = fundingRanges.find(r => r.value === value)
        return range ? range.label : 'Funding Needed'
      case 'location':
        const location = locations?.find(l => l.value === value)
        return location ? location.label : 'Location'
      case 'dateRange':
        const dateRange = dateRanges.find(d => d.value === value)
        return dateRange ? dateRange.label : 'Added'
      default:
        return 'Filter'
    }
  }

  const FilterDropdown = ({ type, label, options, value }) => (
    <div className="relative flex-shrink-0">
      <Button
        variant="outline"
        className={`rounded-lg border-gray-200 hover:border-gray-300 font-normal text-sm tracking-wide transition-all duration-200 px-6 py-3 ${
          value ? 'bg-gray-50 border-gray-300' : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => handleDropdownToggle(type)}
      >
        {getFilterLabel(type, value)}
        <ChevronDown className="ml-2 h-3 w-3" />
      </Button>
      
      {openDropdown === type && (
        <div className="absolute top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-10">
          <div className="py-2">
            <button
              className="w-full text-left px-4 py-3 text-sm font-normal hover:bg-gray-50 transition-colors duration-150"
              onClick={() => handleFilterSelect(type, '')}
            >
              All {label}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-4 py-3 text-sm font-normal hover:bg-gray-50 transition-colors duration-150 ${
                  option.isPremium ? 'text-gray-900 font-medium' : ''
                }`}
                onClick={() => handleFilterSelect(type, option.value, option.isPremium)}
              >
                {option.label || option.name}
                {option.isPremium && (
                  <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">PRO</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full mb-12">
      {/* Desktop - Centered */}
      <div className="hidden md:flex justify-center">
        <div className="flex gap-4">
          <FilterDropdown
            type="category"
            label="Categories"
            options={categories}
            value={filters.category}
          />
          
          <FilterDropdown
            type="fundingRange"
            label="Funding Ranges"
            options={fundingRanges}
            value={filters.fundingRange}
          />
          
          <FilterDropdown
            type="location"
            label="Locations"
            options={locations || []}
            value={filters.location}
          />
          
          <FilterDropdown
            type="dateRange"
            label="Date Ranges"
            options={dateRanges}
            value={filters.dateRange}
          />
        </div>
      </div>

      {/* Mobile - Horizontal scroll */}
      <div className="md:hidden overflow-x-auto">
        <div className="flex gap-3 px-6 pb-2" style={{ minWidth: 'max-content' }}>
          <FilterDropdown
            type="category"
            label="Categories"
            options={categories}
            value={filters.category}
          />
          
          <FilterDropdown
            type="fundingRange"
            label="Funding Ranges"
            options={fundingRanges}
            value={filters.fundingRange}
          />
          
          <FilterDropdown
            type="location"
            label="Locations"
            options={locations || []}
            value={filters.location}
          />
          
          <FilterDropdown
            type="dateRange"
            label="Date Ranges"
            options={dateRanges}
            value={filters.dateRange}
          />
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ChevronDown } from 'lucide-react'

export default function FilterBar({ categories, locations, filters, onFilterChange, decks = [] }) {
  const [openDropdown, setOpenDropdown] = useState(null)
  const filterBarRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Values are in cents (matching database storage format)
  const fundingRanges = [
    { label: 'Under $50K', value: 'under-50k', min: 0, max: 5000000 },
    { label: '$50K — $250K', value: '50k-250k', min: 5000000, max: 25000000 },
    { label: '$250K — $1M', value: '250k-1m', min: 25000000, max: 100000000 },
    { label: '$1M — $5M', value: '1m-5m', min: 100000000, max: 500000000 },
    { label: '$5M — $10M', value: '5m-10m', min: 500000000, max: 1000000000 },
    { label: '$10M+', value: '10m-plus', min: 1000000000, max: Infinity }
  ]

  // Map stored location labels to filter values
  const locationLabelToValue = {
    'North America': 'north-america',
    'UK': 'uk',
    'Europe': 'europe',
    'Asia Pacific': 'asia-pacific',
    'Other': 'other'
  }

  // Calculate counts for each filter option
  const counts = useMemo(() => {
    const categoryCounts = {}
    const fundingCounts = {}
    const locationCounts = {}

    decks.forEach(deck => {
      // Category counts
      const categorySlug = deck.categories?.slug
      if (categorySlug) {
        categoryCounts[categorySlug] = (categoryCounts[categorySlug] || 0) + 1
      }

      // Location counts - map label to value
      if (deck.location) {
        const locationValue = locationLabelToValue[deck.location] || deck.location
        locationCounts[locationValue] = (locationCounts[locationValue] || 0) + 1
      }

      // Funding range counts
      const fundingMin = deck.funding_min || 0
      const fundingMax = deck.funding_max || 0
      const avgFunding = (fundingMin + fundingMax) / 2

      fundingRanges.forEach(range => {
        if (avgFunding >= range.min && avgFunding < range.max) {
          fundingCounts[range.value] = (fundingCounts[range.value] || 0) + 1
        }
      })
    })

    return { categoryCounts, fundingCounts, locationCounts }
  }, [decks])

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const handleFilterSelect = (filterType, value) => {
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
      default:
        return 'Filter'
    }
  }

  const getOptionCount = (type, optionKey) => {
    switch (type) {
      case 'category':
        return counts.categoryCounts[optionKey] || 0
      case 'fundingRange':
        return counts.fundingCounts[optionKey] || 0
      case 'location':
        return counts.locationCounts[optionKey] || 0
      default:
        return 0
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
        <div className="absolute top-full mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-xl z-10">
          <div className="py-2">
            <button
              className="w-full text-left px-4 py-3 text-sm font-normal hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
              onClick={() => handleFilterSelect(type, '')}
            >
              <span>All {label}</span>
              <span className="text-gray-500 text-xs">({decks.length})</span>
            </button>
            {options
              .filter((option) => {
                // Only show options that have at least 1 result
                const optionKey = option.slug || option.value
                const count = getOptionCount(type, optionKey)
                return count > 0
              })
              .map((option) => {
                const optionKey = option.slug || option.value
                const count = getOptionCount(type, optionKey)
                return (
                  <button
                    key={optionKey || option.id}
                    className="w-full text-left px-4 py-3 text-sm font-normal hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
                    onClick={() => handleFilterSelect(type, optionKey)}
                  >
                    <span>{option.label || option.name}</span>
                    <span className="text-gray-500 text-xs">({count})</span>
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div ref={filterBarRef} className="w-full mb-12">
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
        </div>
      </div>
    </div>
  )
}

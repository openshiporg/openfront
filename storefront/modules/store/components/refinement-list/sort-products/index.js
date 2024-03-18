"use client";
import FilterRadioGroup from "@storefront/modules/common/components/filter-radio-group"

const sortOptions = [
  {
    value: "created_at",
    label: "Latest Arrivals",
  },
  {
    value: "price_asc",
    label: "Price: Low -> High",
  },
  {
    value: "price_desc",
    label: "Price: High -> Low",
  },
]

const SortProducts = ({
  sortBy,
  setQueryParams
}) => {
  const handleChange = (e) => {
    const newSortBy = e.target.value
    setQueryParams("sortBy", newSortBy)
  }

  return (
    <FilterRadioGroup
      title="Sort by"
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange} />
  );
}

export default SortProducts

# CLAUDE.md - Platform Pages Filter Fix

## 🚨 IMMEDIATE PRIORITY: Fix Platform Pages Filter Pattern

### Current Issue
12 platform pages are using an incorrect filter pattern with `getFiltered` functions that don't properly handle URL parameters from StatusTabs and other filters. They need to be updated to use `buildWhereClause` like the Orders and Users pages.

### ✅ Correct Pattern (Orders/Users)
```typescript
// In ListPage.tsx
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'

// Build filters from URL params using Keystone's approach
const filterWhere = buildWhereClause(list, searchParamsObj)

// Build search where clause
const searchParameters = searchString ? { search: searchString } : {}
const searchWhere = buildWhereClause(list, searchParameters)

// Combine search and filters
const whereConditions = []
if (Object.keys(searchWhere).length > 0) {
  whereConditions.push(searchWhere)
}
if (Object.keys(filterWhere).length > 0) {
  whereConditions.push(filterWhere)
}

const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

// Use generic getEntity function with where clause
const response = await getEntities(
  where,
  pageSize,
  (currentPage - 1) * pageSize,
  orderBy
)
```

### ❌ Incorrect Pattern (Currently in 12 pages)
```typescript
// Manual status parsing - WRONG!
const statusFilter = searchParamsObj['!status_matches']
let status = 'all'
if (statusFilter) {
  try {
    const parsed = JSON.parse(decodeURIComponent(statusFilter.toString()))
    if (Array.isArray(parsed) && parsed.length > 0) {
      status = typeof parsed[0] === 'string' ? parsed[0] : parsed[0].value
    }
  } catch (e) {
    // Invalid JSON, ignore
  }
}

// Using getFiltered function - WRONG!
const response = await getFilteredEntity(
  status === 'all' ? undefined : status,
  searchString || undefined,
  currentPage,
  pageSize,
  sortBy
)
```

### Pages to Fix (12 total)

1. **payment-providers** ❌
2. **shipping-providers** ❌
3. **stores** ❌
4. **products** ❌
5. **inventory** ❌
6. **discounts** ❌
7. **gift-cards** ❌
8. **price-lists** ❌
9. **product-categories** ❌
10. **product-collections** ❌
11. **claims** ❌
12. **regions** ❌

### Already Fixed
- **orders** ✅ (original correct implementation)
- **users** ✅ (just fixed)

### Key Changes Required

1. **Import buildWhereClause and buildOrderByClause**
2. **Remove manual status/filter parsing**
3. **Use buildWhereClause for all filtering**
4. **Call generic getEntity() instead of getFilteredEntity()**
5. **Pass where clause to actions**

### Why This Matters
- StatusTabs generate different URL parameters based on field type (e.g., `!hasAccount_is=true` for checkbox, `!status_matches=["pending"]` for select)
- buildWhereClause handles all field types correctly
- Manual parsing only handles one specific pattern
- This enables proper filtering for all field types, not just status

### Next Steps
Fix all 12 platform pages to use the correct pattern, ensuring StatusTabs and all other filters work properly across the platform.
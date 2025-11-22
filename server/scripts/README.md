# Server Scripts

This directory contains various utility scripts for database seeding, verification, and testing.

## Directory Structure

### `seed/`
Database seeding scripts to populate the application with initial or test data:

- **`seedEducation.js`** - Seeds educational content (courses, market insights)
- **`seed_complete.js`** - Complete database seeding with all data types
- **`seed_dashboard.js`** - Seeds dashboard-specific data
- **`seed_full_dashboard.js`** - Comprehensive dashboard data seeding

**Usage:**
```bash
cd server
node scripts/seed/seed_complete.js
```

### `verify/`
Verification scripts to test various API endpoints and functionality:

- **`verify_api.js`** - Verifies API endpoints
- **`verify_caching.js`** - Tests caching functionality
- **`verify_enhancements.js`** - Verifies feature enhancements
- **`verify_indices.js`** - Tests market indices functionality
- **`verify_ranges.js`** - Verifies date range functionality
- **`verify_search.js`** - Tests search functionality
- **`verify_seed.js`** - Verifies seeded data
- **`verify_social_trading.js`** - Tests social trading features
- **`verify_split_portfolios.js`** - Verifies portfolio splitting
- **`verify_stock_summary.js`** - Tests stock summary functionality

**Usage:**
```bash
cd server
node scripts/verify/verify_api.js
```

### `db/`
Database utility scripts:

- **`check_db.js`** - Checks database connection and status
- **`check_db_root.js`** - Alternative database check script

**Usage:**
```bash
cd server
node scripts/db/check_db.js
```

### `test/`
Testing and debugging scripts:

- **`test-imports.mjs`** - Tests ES module imports

**Usage:**
```bash
cd server
node scripts/test/test-imports.mjs
```

### Root Scripts
Legacy scripts (to be migrated):

- **`scrapeAndSave.js`** - Web scraping utility
- **`seedTenants.js`** - Multi-tenant seeding

## Notes

- All scripts should be run from the `server` directory
- Ensure environment variables are properly configured in `.env`
- Database connection is required for most scripts

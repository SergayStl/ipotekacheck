import { query } from './db'

export async function getBestOffers(
  bank: string, age: number, gender: string,
  propertyType: string, onDate?: string
) {
  const date = onDate || 'CURRENT_DATE'
  return query(`
    SELECT site, insurance_co, price, rank
    FROM prices
    WHERE collected_at::date = ${onDate ? '$5' : 'CURRENT_DATE'}
      AND bank = $1 AND insurance_type = 'life'
      AND gender = $2 AND age = $3
      AND property_type = $4 AND price IS NOT NULL
    ORDER BY price ASC
    LIMIT 30
  `, onDate ? [bank, gender, age, propertyType, date] : [bank, gender, age, propertyType])
}

export async function getCompanyVsMarket(
  company: string, bank: string, gender: string,
  age: number, propertyType: string, site?: string, onDate?: string
) {
  const siteFilter = site ? 'AND site = $7' : ''
  const params: unknown[] = [bank, gender, age, propertyType, company]
  if (onDate) params.push(onDate); else params.push(null)
  if (site) params.push(site)

  return query(`
    WITH market AS (
      SELECT site,
        MIN(price) AS price_min, ROUND(AVG(price)) AS price_avg,
        MAX(price) AS price_max, COUNT(*) AS company_count
      FROM prices
      WHERE collected_at::date = COALESCE($6::date, CURRENT_DATE)
        AND bank=$1 AND insurance_type='life'
        AND gender=$2 AND age=$3 AND property_type=$4 AND price IS NOT NULL
        ${siteFilter}
      GROUP BY site
    ),
    mine AS (
      SELECT site, price, rank FROM prices
      WHERE collected_at::date = COALESCE($6::date, CURRENT_DATE)
        AND bank=$1 AND insurance_type='life'
        AND gender=$2 AND age=$3 AND property_type=$4
        AND insurance_co=$5 ${siteFilter}
    )
    SELECT m.site, mine.price AS my_price, mine.rank AS my_rank,
      m.price_min, m.price_avg, m.price_max, m.company_count
    FROM market m LEFT JOIN mine USING (site)
    ORDER BY m.site
  `, params)
}

export async function getRankHistory(
  company: string, bank: string, gender: string,
  age: number, propertyType: string, site?: string, days = 30
) {
  const siteFilter = site ? 'AND site = $6' : ''
  const params: unknown[] = [bank, gender, age, propertyType, company]
  if (site) params.push(site)
  params.push(days)

  return query(`
    SELECT collected_at::date AS day, site, rank, price FROM prices
    WHERE collected_at::date >= CURRENT_DATE - $${params.length}
      AND bank=$1 AND insurance_type='life'
      AND gender=$2 AND age=$3 AND property_type=$4
      AND insurance_co=$5 ${siteFilter}
    ORDER BY day, site
  `, params)
}

export async function getHeatmapData(
  bank: string, gender: string, propertyType: string,
  site: string, onDate?: string
) {
  return query(`
    SELECT insurance_co, age, MIN(price) AS price FROM prices
    WHERE collected_at::date = COALESCE($5::date, CURRENT_DATE)
      AND bank=$1 AND insurance_type='life'
      AND gender=$2 AND property_type=$3 AND site=$4 AND price IS NOT NULL
    GROUP BY insurance_co, age
    ORDER BY insurance_co, age
  `, [bank, gender, propertyType, site, onDate || null])
}

export async function getPriceTrend(
  company: string, bank: string, gender: string,
  age: number, propertyType: string, site: string, days = 60
) {
  return query(`
    SELECT collected_at::date AS day, ROUND(AVG(price)) AS price FROM prices
    WHERE collected_at::date >= CURRENT_DATE - $7
      AND insurance_co=$1 AND bank=$2 AND insurance_type='life'
      AND gender=$3 AND age=$4 AND property_type=$5 AND site=$6 AND price IS NOT NULL
    GROUP BY day ORDER BY day
  `, [company, bank, gender, age, propertyType, site, days])
}

export async function getMarketEntrantsExits(days = 30) {
  return query(`
    WITH periods AS (
      SELECT insurance_co, site, bank,
        MIN(collected_at::date) AS first_seen,
        MAX(collected_at::date) AS last_seen
      FROM prices GROUP BY insurance_co, site, bank
    )
    SELECT *, CASE
      WHEN first_seen >= CURRENT_DATE - $1 THEN 'appeared'
      WHEN last_seen <= CURRENT_DATE - $1 THEN 'disappeared'
    END AS event FROM periods
    WHERE first_seen >= CURRENT_DATE - $1 OR last_seen <= CURRENT_DATE - $1
    ORDER BY first_seen DESC
  `, [days])
}

export async function getAvailableDates() {
  return query<{ day: string }>(
    'SELECT DISTINCT collected_at::date AS day FROM prices ORDER BY day DESC LIMIT 90'
  )
}

export async function getAllBanks() {
  return query<{ bank: string }>('SELECT DISTINCT bank FROM prices ORDER BY bank')
}

export async function getAllCompanies() {
  return query<{ insurance_co: string }>(
    'SELECT DISTINCT insurance_co FROM prices ORDER BY insurance_co'
  )
}

export async function getAllSites() {
  return query<{ site: string }>('SELECT DISTINCT site FROM prices ORDER BY site')
}

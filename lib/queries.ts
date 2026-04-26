import { query } from './db'

// For insurance_type='имущество': age and gender are NULL in DB (tariff doesn't depend on them).
// All queries use this helper clause to handle both cases.
const ageGenderClause = (insTypeParam: string, ageParam: string, genderParam: string) =>
  `AND (LOWER(${insTypeParam}) = 'имущество' OR (age = ${ageParam} AND gender = ANY(${genderParam})))`

export async function getOffersForCalculator(
  bank: string,
  ageBucket: number,
  gender: string,
  propertyType: string,
  insuranceType: string,
  loanAmount: number
) {
  const genderVariants = gender === 'Мужской' ? ['М', 'Мужской'] : ['Ж', 'Женский']
  return query<{ site: string; insurance_co: string; price: number; rank: number }>(`
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success'
      GROUP BY site
    )
    SELECT p.site, p.insurance_co,
           ROUND(p.tariff_coef * $6)::integer AS price,
           ROW_NUMBER() OVER (ORDER BY p.tariff_coef) AS rank
    FROM prices p
    JOIN latest l ON l.site = p.site AND p.collected_at::date = l.d
    WHERE p.bank = $1
      AND LOWER(p.property_type) = LOWER($4)
      AND LOWER(p.insurance_type) = LOWER($5)
      AND (LOWER($5) = 'имущество' OR (p.age = $2 AND p.gender = ANY($3)))
      AND p.tariff_coef IS NOT NULL
      AND p.source_status = 'success'
    ORDER BY price ASC
    LIMIT 50
  `, [bank, ageBucket, genderVariants, propertyType, insuranceType, loanAmount])
}

export async function getBestOffers(
  bank: string, age: number, gender: string,
  propertyType: string, insuranceType = 'жизнь', onDate?: string
) {
  return query(`
    SELECT site, insurance_co, price, rank
    FROM prices
    WHERE collected_at::date = ${onDate ? '$6' : '(SELECT MAX(collected_at::date) FROM prices WHERE source_status = \'success\')'}
      AND bank = $1 AND LOWER(insurance_type) = LOWER($5)
      AND property_type = $4 AND price IS NOT NULL
      AND source_status = 'success'
      AND (LOWER($5) = 'имущество' OR (gender = $2 AND age = $3))
    ORDER BY price ASC
    LIMIT 30
  `, onDate ? [bank, gender, age, propertyType, insuranceType, onDate] : [bank, gender, age, propertyType, insuranceType])
}

export async function getCompanyVsMarket(
  company: string, bank: string, gender: string,
  age: number, propertyType: string, insuranceType = 'жизнь', site?: string, onDate?: string
) {
  const params: unknown[] = [bank, gender, age, propertyType, company, insuranceType]
  params.push(onDate || null)
  const siteClause = site ? 'AND p.site = $8' : ''
  if (site) params.push(site)

  return query(`
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success'
      GROUP BY site
    ),
    all_prices AS (
      SELECT p.site, p.insurance_co, p.price
      FROM prices p
      JOIN latest l ON l.site = p.site
      WHERE p.collected_at::date = COALESCE($7::date, l.d)
        AND p.bank=$1 AND LOWER(p.insurance_type)=LOWER($6)
        AND p.property_type=$4 AND p.price IS NOT NULL
        AND p.source_status = 'success'
        AND (LOWER($6) = 'имущество' OR (p.gender=$2 AND p.age=$3))
        ${siteClause}
    ),
    market AS (
      SELECT site,
        MIN(price) AS price_min, ROUND(AVG(price)) AS price_avg,
        MAX(price) AS price_max, COUNT(*) AS company_count
      FROM all_prices GROUP BY site
    ),
    mine AS (
      SELECT p.site, p.price AS my_price, p.rank AS my_rank
      FROM prices p
      JOIN latest l ON l.site = p.site
      WHERE p.collected_at::date = COALESCE($7::date, l.d)
        AND p.bank=$1 AND LOWER(p.insurance_type)=LOWER($6)
        AND p.property_type=$4 AND p.insurance_co=$5
        AND p.source_status = 'success'
        AND (LOWER($6) = 'имущество' OR (p.gender=$2 AND p.age=$3))
        ${siteClause}
    ),
    ranked AS (
      SELECT ap.site,
        (COUNT(*) FILTER (WHERE ap.price < mine.my_price) + 1)::int AS my_price_rank,
        MAX(ap.price) FILTER (WHERE ap.price < mine.my_price) AS price_below,
        MIN(ap.price) FILTER (WHERE ap.price > mine.my_price) AS price_above
      FROM mine JOIN all_prices ap ON ap.site = mine.site
      GROUP BY ap.site
    )
    SELECT m.site, mine.my_price, mine.my_rank,
      ranked.my_price_rank, ranked.price_below, ranked.price_above,
      m.price_min, m.price_avg, m.price_max, m.company_count
    FROM market m
    LEFT JOIN mine ON mine.site = m.site
    LEFT JOIN ranked ON ranked.site = m.site
    ORDER BY m.site
  `, params)
}

export async function getRankHistory(
  company: string, bank: string, gender: string,
  age: number, propertyType: string, insuranceType = 'жизнь', site?: string, days = 30
) {
  // $1-$6: bank, gender, age, propertyType, company, insuranceType
  const params: unknown[] = [bank, gender, age, propertyType, company, insuranceType]
  const siteClause = site ? `AND site = $${params.length + 1}` : ''
  if (site) params.push(site)
  params.push(days)

  return query(`
    SELECT collected_at::date AS day, site, rank, price FROM prices
    WHERE collected_at::date >= CURRENT_DATE - $${params.length}
      AND bank=$1 AND LOWER(insurance_type)=LOWER($6)
      AND property_type=$4 AND insurance_co=$5
      AND source_status = 'success'
      AND (LOWER($6) = 'имущество' OR (gender=$2 AND age=$3))
      ${siteClause}
    ORDER BY day, site
  `, params)
}

export async function getHeatmapData(
  bank: string, gender: string, propertyType: string,
  site: string, insuranceType = 'жизнь', onDate?: string
) {
  const genderVariants = gender === 'Мужской' ? ['М', 'Мужской'] : ['Ж', 'Женский', 'Женская']
  return query(`
    SELECT insurance_co, COALESCE(age, 0) AS age, MIN(price) AS price FROM prices
    WHERE collected_at::date = COALESCE($6::date, (SELECT MAX(collected_at::date) FROM prices WHERE source_status = 'success' AND site = $4 AND bank = $1))
      AND bank=$1 AND LOWER(insurance_type)=LOWER($5)
      AND property_type=$3 AND site=$4
      AND price IS NOT NULL AND source_status = 'success'
      AND (LOWER($5) = 'имущество' OR gender = ANY($2))
    GROUP BY insurance_co, age
    ORDER BY insurance_co, age
  `, [bank, genderVariants, propertyType, site, insuranceType, onDate || null])
}

export async function getPriceTrend(
  company: string, bank: string, gender: string,
  age: number, propertyType: string, site: string, insuranceType = 'жизнь', days = 60
) {
  const genderVariants = gender === 'Мужской' ? ['М', 'Мужской'] : ['Ж', 'Женский', 'Женская']
  return query(`
    SELECT collected_at::date AS day, ROUND(AVG(price)) AS price FROM prices
    WHERE collected_at::date >= CURRENT_DATE - $8
      AND insurance_co=$1 AND bank=$2 AND LOWER(insurance_type)=LOWER($7)
      AND property_type=$5 AND site=$6
      AND price IS NOT NULL AND source_status = 'success'
      AND (LOWER($7) = 'имущество' OR (gender = ANY($3) AND age=$4))
    GROUP BY day ORDER BY day
  `, [company, bank, genderVariants, age, propertyType, site, insuranceType, days])
}

export async function getMarketEntrantsExits(days = 30) {
  return query(`
    WITH periods AS (
      SELECT insurance_co, site, bank,
        MIN(collected_at::date) AS first_seen,
        MAX(collected_at::date) AS last_seen
      FROM prices WHERE source_status = 'success'
      GROUP BY insurance_co, site, bank
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
    'SELECT DISTINCT collected_at::date AS day FROM prices WHERE source_status = \'success\' ORDER BY day DESC LIMIT 90'
  )
}

export async function getAllBanks() {
  return query<{ bank: string }>(
    "SELECT DISTINCT bank FROM prices WHERE bank IS NOT NULL AND bank <> '' AND source_status = 'success' ORDER BY bank"
  )
}

// Returns only banks/property types that have data on the latest scraped date —
// used by the calculator so the dropdowns never show options with no results.
export async function getCalcMeta() {
  // CTE computes per-site latest date once, then joins — avoids correlated subquery per row
  const cte = `
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success' AND tariff_coef IS NOT NULL
      GROUP BY site
    )
  `
  const [banks, propTypes, insTypes] = await Promise.all([
    query<{ bank: string }>(`
      ${cte}
      SELECT DISTINCT p.bank FROM prices p
      JOIN latest l ON l.site = p.site AND p.collected_at::date = l.d
      WHERE p.source_status = 'success' AND p.tariff_coef IS NOT NULL
        AND p.bank IS NOT NULL AND p.bank <> ''
      ORDER BY bank
    `),
    query<{ property_type: string }>(`
      ${cte}
      SELECT DISTINCT p.property_type FROM prices p
      JOIN latest l ON l.site = p.site AND p.collected_at::date = l.d
      WHERE p.source_status = 'success' AND p.tariff_coef IS NOT NULL
        AND p.property_type IS NOT NULL
      ORDER BY property_type
    `),
    query<{ insurance_type: string }>(`
      ${cte}
      SELECT DISTINCT p.insurance_type FROM prices p
      JOIN latest l ON l.site = p.site AND p.collected_at::date = l.d
      WHERE p.source_status = 'success' AND p.tariff_coef IS NOT NULL
        AND p.insurance_type IS NOT NULL
      ORDER BY insurance_type
    `),
  ])
  return {
    banks: banks.map(r => r.bank),
    propertyTypes: propTypes.map(r => r.property_type),
    insuranceTypes: insTypes.map(r => r.insurance_type),
  }
}

export async function getAllCompanies() {
  return query<{ insurance_co: string }>(
    "SELECT DISTINCT insurance_co FROM prices WHERE source_status = 'success' ORDER BY insurance_co"
  )
}

// Returns banks/companies/sites from each site's latest scraped date.
// Ensures defaults always yield results even when sites scrape on different days.
export async function getLatestMeta() {
  const cte = `
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success'
      GROUP BY site
    )
  `
  const [banks, companies, sites] = await Promise.all([
    query<{ bank: string }>(`
      ${cte}
      SELECT DISTINCT p.bank FROM prices p
      JOIN latest l ON l.site = p.site AND p.collected_at::date = l.d
      WHERE p.source_status = 'success' AND p.bank IS NOT NULL AND p.bank <> ''
      ORDER BY bank
    `),
    query<{ insurance_co: string }>(`
      ${cte}
      SELECT DISTINCT p.insurance_co FROM prices p
      JOIN latest l ON l.site = p.site AND p.collected_at::date = l.d
      WHERE p.source_status = 'success'
      ORDER BY insurance_co
    `),
    query<{ site: string }>(`
      SELECT DISTINCT site FROM prices WHERE source_status = 'success' ORDER BY site
    `),
  ])
  return {
    banks: banks.map(r => r.bank),
    companies: companies.map(r => r.insurance_co),
    sites: sites.map(r => r.site),
  }
}

export async function getAllSites() {
  return query<{ site: string }>("SELECT DISTINCT site FROM prices WHERE source_status = 'success' ORDER BY site")
}

export async function getBankPresence(
  company: string, site: string, insuranceType = 'жизнь', onDate?: string
) {
  return query<{ bank: string; present: boolean }>(`
    WITH all_banks AS (
      SELECT DISTINCT bank FROM prices WHERE source_status = 'success' AND bank IS NOT NULL AND bank <> ''
    ),
    my_banks AS (
      SELECT DISTINCT bank FROM prices
      WHERE insurance_co = $1 AND site = $2
        AND LOWER(insurance_type) = LOWER($3)
        AND collected_at::date = COALESCE($4::date, (SELECT MAX(collected_at::date) FROM prices WHERE source_status = 'success' AND site = $2))
        AND source_status = 'success'
    )
    SELECT ab.bank, (mb.bank IS NOT NULL) AS present
    FROM all_banks ab LEFT JOIN my_banks mb USING (bank)
    ORDER BY present DESC, bank
  `, [company, site, insuranceType, onDate || null])
}

export async function getMyRankTrend(
  company: string, bank: string, site: string, insuranceType = 'жизнь', days = 30
) {
  return query<{ day: string; avg_rank: number; segments: number }>(`
    SELECT collected_at::date AS day,
      ROUND(AVG(rank))::int AS avg_rank,
      COUNT(*)::int AS segments
    FROM prices
    WHERE insurance_co = $1 AND bank = $2 AND site = $3
      AND LOWER(insurance_type) = LOWER($4)
      AND source_status = 'success' AND rank IS NOT NULL
      AND collected_at::date >= CURRENT_DATE - $5
    GROUP BY day ORDER BY day
  `, [company, bank, site, insuranceType, days])
}

export async function getMyRankHistoryAll(
  company: string, bank: string, site: string, insuranceType = 'жизнь', days = 30
) {
  return query<{ day: string; property_type: string; gender: string | null; age: number | null; rank: number; price: number }>(`
    SELECT collected_at::date AS day, property_type, gender, age, rank::int, price::int
    FROM prices
    WHERE insurance_co = $1 AND bank = $2 AND site = $3
      AND LOWER(insurance_type) = LOWER($4)
      AND source_status = 'success' AND rank IS NOT NULL
      AND collected_at::date >= CURRENT_DATE - $5
    ORDER BY day, property_type, age
  `, [company, bank, site, insuranceType, days])
}

export async function getCompetitorRanking(
  site: string, bank: string, insuranceType = 'жизнь', onDate?: string
) {
  return query<{
    insurance_co: string; avg_rank: number; best_rank: number; worst_rank: number;
    segments: number; avg_price: number; top3_count: number
  }>(`
    SELECT insurance_co,
      ROUND(AVG(rank))::int AS avg_rank,
      MIN(rank)::int AS best_rank,
      MAX(rank)::int AS worst_rank,
      COUNT(*)::int AS segments,
      ROUND(AVG(price))::int AS avg_price,
      COUNT(*) FILTER (WHERE rank <= 3)::int AS top3_count
    FROM prices
    WHERE site = $1 AND bank = $2
      AND LOWER(insurance_type) = LOWER($3)
      AND collected_at::date = COALESCE($4::date, (SELECT MAX(collected_at::date) FROM prices WHERE source_status = 'success' AND site = $1 AND bank = $2))
      AND source_status = 'success' AND rank IS NOT NULL AND price IS NOT NULL
    GROUP BY insurance_co
    ORDER BY avg_rank
  `, [site, bank, insuranceType, onDate || null])
}

export async function getMySegmentDetail(
  company: string, site: string, bank: string, insuranceType = 'жизнь', onDate?: string
) {
  return query<{
    property_type: string; gender: string | null; age: number | null;
    rank: number; price: number; total_cos: number; market_min: number; market_avg: number
  }>(`
    WITH market AS (
      SELECT gender, property_type, age,
        COUNT(DISTINCT insurance_co)::int AS total_cos,
        MIN(price)::int AS market_min,
        ROUND(AVG(price))::int AS market_avg
      FROM prices
      WHERE site = $2 AND bank = $3 AND LOWER(insurance_type) = LOWER($4)
        AND collected_at::date = COALESCE($5::date, (SELECT MAX(collected_at::date) FROM prices WHERE source_status = 'success' AND site = $2 AND bank = $3))
        AND source_status = 'success' AND price IS NOT NULL
      GROUP BY gender, property_type, age
    )
    SELECT p.property_type, p.gender, p.age,
      p.rank::int, p.price::int,
      m.total_cos, m.market_min, m.market_avg
    FROM prices p
    JOIN market m ON m.gender IS NOT DISTINCT FROM p.gender
      AND m.property_type = p.property_type
      AND m.age IS NOT DISTINCT FROM p.age
    WHERE p.insurance_co = $1 AND p.site = $2 AND p.bank = $3
      AND LOWER(p.insurance_type) = LOWER($4)
      AND p.collected_at::date = COALESCE($5::date, (SELECT MAX(collected_at::date) FROM prices WHERE source_status = 'success' AND site = $2 AND bank = $3))
      AND p.source_status = 'success' AND p.rank IS NOT NULL
    ORDER BY p.rank, p.property_type, p.age
  `, [company, site, bank, insuranceType, onDate || null])
}

export async function getMyPositionSummary(
  company: string, insuranceType = 'жизнь', onDate?: string
) {
  return query<{ site: string; avg_rank: number; best_rank: number; segments: number; total_companies: number }>(`
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success'
      GROUP BY site
    ),
    my AS (
      SELECT p.site, p.rank FROM prices p
      JOIN latest l ON l.site = p.site
      WHERE p.insurance_co = $1
        AND p.collected_at::date = COALESCE($3::date, l.d)
        AND p.source_status = 'success' AND p.rank IS NOT NULL
        AND LOWER(p.insurance_type) = LOWER($2)
    ),
    mkt AS (
      SELECT p.site, COUNT(DISTINCT p.insurance_co)::int AS total_companies
      FROM prices p
      JOIN latest l ON l.site = p.site
      WHERE p.collected_at::date = COALESCE($3::date, l.d)
        AND p.source_status = 'success'
        AND LOWER(p.insurance_type) = LOWER($2)
      GROUP BY p.site
    )
    SELECT my.site,
      ROUND(AVG(my.rank))::int AS avg_rank,
      MIN(my.rank)::int AS best_rank,
      COUNT(*)::int AS segments,
      MAX(mkt.total_companies) AS total_companies
    FROM my JOIN mkt USING (site)
    GROUP BY my.site
    ORDER BY avg_rank
  `, [company, insuranceType, onDate || null])
}

export async function getMyPositionHeatmap(
  company: string, insuranceType = 'жизнь', onDate?: string
) {
  return query<{ bank: string; site: string; avg_rank: number; segments: number; total_companies: number }>(`
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success'
      GROUP BY site
    ),
    my AS (
      SELECT p.bank, p.site, p.rank FROM prices p
      JOIN latest l ON l.site = p.site
      WHERE p.insurance_co = $1
        AND p.collected_at::date = COALESCE($3::date, l.d)
        AND p.source_status = 'success' AND p.rank IS NOT NULL
        AND LOWER(p.insurance_type) = LOWER($2)
    ),
    mkt AS (
      SELECT p.bank, p.site, COUNT(DISTINCT p.insurance_co)::int AS total_companies
      FROM prices p
      JOIN latest l ON l.site = p.site
      WHERE p.collected_at::date = COALESCE($3::date, l.d)
        AND p.source_status = 'success'
        AND LOWER(p.insurance_type) = LOWER($2)
      GROUP BY p.bank, p.site
    )
    SELECT my.bank, my.site,
      ROUND(AVG(my.rank))::int AS avg_rank,
      COUNT(*)::int AS segments,
      mkt.total_companies
    FROM my JOIN mkt USING (bank, site)
    GROUP BY my.bank, my.site, mkt.total_companies
    ORDER BY my.bank, avg_rank
  `, [company, insuranceType, onDate || null])
}

export async function getMyPositionByAge(
  company: string, bank: string, site: string,
  insuranceType = 'жизнь', propertyType = 'Квартира', gender = 'Мужской', onDate?: string
) {
  return query<{ age: number; rank: number; price: number }>(`
    SELECT age, ROUND(AVG(rank))::int AS rank, ROUND(AVG(price))::int AS price
    FROM prices
    WHERE insurance_co = $1 AND bank = $2 AND site = $3
      AND LOWER(insurance_type) = LOWER($4)
      AND property_type = $5 AND gender = $6
      AND collected_at::date = COALESCE($7::date, (SELECT MAX(collected_at::date) FROM prices WHERE source_status = 'success' AND site = $3 AND bank = $2))
      AND source_status = 'success' AND rank IS NOT NULL AND age IS NOT NULL
    GROUP BY age ORDER BY age
  `, [company, bank, site, insuranceType, propertyType, gender, onDate || null])
}

export async function getMyPositionByPropType(
  company: string, bank: string, site: string,
  insuranceType = 'жизнь', gender = 'Мужской', age = 35, onDate?: string
) {
  return query<{ property_type: string; rank: number; price: number }>(`
    SELECT property_type, ROUND(AVG(rank))::int AS rank, ROUND(AVG(price))::int AS price
    FROM prices
    WHERE insurance_co = $1 AND bank = $2 AND site = $3
      AND LOWER(insurance_type) = LOWER($4)
      AND (LOWER($4) = 'имущество' OR (gender = $5 AND age = $6))
      AND collected_at::date = COALESCE($7::date, (SELECT MAX(collected_at::date) FROM prices WHERE source_status = 'success' AND site = $3 AND bank = $2))
      AND source_status = 'success' AND rank IS NOT NULL
    GROUP BY property_type ORDER BY rank
  `, [company, bank, site, insuranceType, gender, age, onDate || null])
}

export async function getCoverageBySite(bank: string, onDate?: string) {
  return query<{
    site: string; insurance_type: string; property_type: string;
    total: number; priced: number; rejected: number; no_price: number; success_rate: number
  }>(`
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success'
      GROUP BY site
    )
    SELECT p.site, p.insurance_type, p.property_type,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE p.source_status = 'success' AND p.price IS NOT NULL) AS priced,
      COUNT(*) FILTER (WHERE p.source_status = 'error') AS rejected,
      COUNT(*) FILTER (WHERE p.source_status = 'no_price') AS no_price,
      ROUND(100.0 * COUNT(*) FILTER (WHERE p.source_status = 'success' AND p.price IS NOT NULL)
        / NULLIF(COUNT(*), 0), 1) AS success_rate
    FROM prices p
    JOIN latest l ON l.site = p.site
    WHERE p.collected_at::date = COALESCE($2::date, l.d)
      AND p.bank = $1
    GROUP BY p.site, p.insurance_type, p.property_type
    ORDER BY p.site, p.insurance_type, success_rate ASC
  `, [bank, onDate || null])
}

export async function getCompanyRejectionRate(bank: string, onDate?: string) {
  return query<{
    insurance_co: string; total: number; priced: number; rejected: number; reject_rate: number
  }>(`
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success'
      GROUP BY site
    )
    SELECT p.insurance_co,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE p.source_status = 'success' AND p.price IS NOT NULL) AS priced,
      COUNT(*) FILTER (WHERE p.source_status != 'success' OR p.price IS NULL) AS rejected,
      ROUND(100.0 * COUNT(*) FILTER (WHERE p.source_status != 'success' OR p.price IS NULL)
        / NULLIF(COUNT(*), 0), 1) AS reject_rate
    FROM prices p
    JOIN latest l ON l.site = p.site
    WHERE p.collected_at::date = COALESCE($2::date, l.d)
      AND p.bank = $1
    GROUP BY p.insurance_co
    ORDER BY reject_rate DESC, total DESC
    LIMIT 30
  `, [bank, onDate || null])
}

export async function getOpportunityZones(bank: string, onDate?: string) {
  return query<{
    site: string; insurance_type: string; property_type: string;
    gender: string | null; age: number | null;
    total: number; priced: number; success_rate: number
  }>(`
    WITH latest AS (
      SELECT site, MAX(collected_at::date) AS d
      FROM prices WHERE source_status = 'success'
      GROUP BY site
    )
    SELECT p.site, p.insurance_type, p.property_type, p.gender, p.age,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE p.source_status = 'success' AND p.price IS NOT NULL) AS priced,
      ROUND(100.0 * COUNT(*) FILTER (WHERE p.source_status = 'success' AND p.price IS NOT NULL)
        / NULLIF(COUNT(*), 0), 1) AS success_rate
    FROM prices p
    JOIN latest l ON l.site = p.site
    WHERE p.collected_at::date = COALESCE($2::date, l.d)
      AND p.bank = $1
    GROUP BY p.site, p.insurance_type, p.property_type, p.gender, p.age
    HAVING COUNT(*) FILTER (WHERE p.source_status = 'success' AND p.price IS NOT NULL) <= 3
    ORDER BY priced ASC, success_rate ASC
    LIMIT 25
  `, [bank, onDate || null])
}

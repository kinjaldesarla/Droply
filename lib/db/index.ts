import {drizzle} from 'drizzle-orm/neon-http'
import {neon} from '@neondatabase/serverless'

import * as schema from './schema'

// Step 1: Create a SQL client using Neon's serverless driver
const sql=neon(process.env.DATABASE_URL!)

// Step 2: Initialize Drizzle ORM with our schema
export const db=drizzle(sql,{schema})

//Step 3: Export the SQL client for direct queries
export { sql}
import sql, { ConnectionPool } from 'mssql';
import { DatabaseConfig, QueryResult, DatabaseError, QueryParameters } from './types';

const config: DatabaseConfig = {
  user: process.env.DB_USERNAME || process.env.DB_USER || 'ZetaChatLogin',
  password: process.env.DB_PASSWORD || 'ZetaCAD2025Secure!Pass',
  server: process.env.DB_SERVER || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || "1433"),
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'ZetaCADChatDB',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true,
  },
};

// Global connection pool
let globalPool: ConnectionPool | null = null;

/**
 * Get MSSQL connection pool (reuses existing connection)
 */
export async function getMssqlConnection(): Promise<ConnectionPool> {
  try {
    // Reuse existing pool if available
    if (globalPool && globalPool.connected) {
      return globalPool;
    }

    // Validate required environment variables
    if (!config.user || !config.password || !config.server || !config.database) {
      throw new Error('Database configuration is incomplete. Please check your environment variables.');
    }

    console.log('Connecting to database:', {
      server: config.server,
      database: config.database,
      user: config.user,
      port: config.port
    });

    const pool = await sql.connect(config);
    globalPool = pool;
    
    console.log('Database connection established successfully');
    return pool;
  } catch (err) {
    console.error('MSSQL connection error:', err);
    throw err;
  }
}

/**
 * Execute a SQL query with optional parameters
 */
export async function executeQuery<T = Record<string, unknown>>(
  query: string, 
  params?: QueryParameters
): Promise<QueryResult<T>> {
  let pool: ConnectionPool;
  
  try {
    pool = await getMssqlConnection();
    const request = pool.request();
    
    // Add parameters if provided
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }
    
    const result = await request.query(query);
    return result as QueryResult<T>;
  } catch (err) {
    const dbError = err as DatabaseError;
    console.error('Query execution error:', {
      message: dbError.message,
      code: dbError.code,
      number: dbError.number,
      query: query,
      params: params
    });
    throw dbError;
  }
}

/**
 * Execute a stored procedure with optional parameters
 */
export async function executeStoredProcedure<T = Record<string, unknown>>(
  procedureName: string, 
  params?: QueryParameters
): Promise<QueryResult<T>> {
  let pool: ConnectionPool;
  
  try {
    pool = await getMssqlConnection();
    const request = pool.request();
    
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }
    
    const result = await request.execute(procedureName);
    return result as QueryResult<T>;
  } catch (err) {
    const dbError = err as DatabaseError;
    console.error('Stored procedure execution error:', {
      message: dbError.message,
      code: dbError.code,
      number: dbError.number,
      procedure: procedureName,
      params: params
    });
    throw dbError;
  }
}

/**
 * Close database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (globalPool) {
      await globalPool.close();
      globalPool = null;
      console.log('Database connection closed');
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const pool = await getMssqlConnection();
    const result = await pool.request().query('SELECT 1 as test');
    console.log('Database connection test: SUCCESS');
    return result.recordset.length > 0;
  } catch (err) {
    console.error('Database connection test: FAILED', err);
    return false;
  }
}

/**
 * Check if database tables exist
 */
export async function checkTablesExist(): Promise<{ chatBotLog: boolean; chatBotUserSession: boolean }> {
  try {
    const pool = await getMssqlConnection();
    
    const result = await pool.request().query(`
      SELECT 
        CASE WHEN EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ChatBotLog') THEN 1 ELSE 0 END as chatBotLogExists,
        CASE WHEN EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ChatBotUserSession') THEN 1 ELSE 0 END as chatBotUserSessionExists
    `);
    
    const row = result.recordset[0];
    return {
      chatBotLog: row.chatBotLogExists === 1,
      chatBotUserSession: row.chatBotUserSessionExists === 1
    };
  } catch (err) {
    console.error('Error checking table existence:', err);
    return {
      chatBotLog: false,
      chatBotUserSession: false
    };
  }
}
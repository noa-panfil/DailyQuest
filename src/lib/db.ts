import mysql from 'mysql2/promise';

// Cache the connection pool globally in development so it's not recreated on every HMR.
// eslint-disable-next-line no-var
declare global {
    var _mysqlPool: mysql.Pool | undefined;
}

let pool: mysql.Pool;

if (process.env.NODE_ENV === 'production') {
    pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dailyquest',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
} else {
    if (!global._mysqlPool) {
        global._mysqlPool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'dailyquest',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    pool = global._mysqlPool;
}

export async function getConnection() {
    return pool.getConnection();
}

export async function query(sql: string, values?: any[]) {
    const [results] = await pool.query(sql, values);
    return results;
}

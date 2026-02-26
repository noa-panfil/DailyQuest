import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

export async function getConnection() {
    if (connection) {
        return connection;
    }

    connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dailyquest',
    });

    return connection;
}

export async function query(sql: string, values?: any[]) {
    const db = await getConnection();
    const [results] = await db.query(sql, values);
    return results;
}

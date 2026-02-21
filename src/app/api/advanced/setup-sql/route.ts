import { NextRequest, NextResponse } from 'next/server';
import initSqlJs, { Database } from 'sql.js';
import { SQL_SCHEMA, SQL_INSERT_DATA } from '@/lib/sample-data';

// Module-level DB singleton for the server process
let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;
  const SQL = await initSqlJs();
  db = new SQL.Database();
  db.run(SQL_SCHEMA);
  db.run(SQL_INSERT_DATA);
  return db;
}

// Export for use by text-to-sql route
export { getDb };

export async function POST(request: NextRequest) {
  try {
    const { action, query } = await request.json();

    const database = await getDb();

    if (action === 'setup') {
      // Return table info
      const tables = database.exec(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      );
      const tableNames = tables[0]?.values.map((row) => String(row[0])) || [];

      const rowCounts: Record<string, number> = {};
      for (const table of tableNames) {
        const result = database.exec(`SELECT COUNT(*) FROM "${table.replace(/"/g, '""')}"`);
        rowCounts[table] = Number(result[0]?.values[0]?.[0] || 0);
      }

      return NextResponse.json({
        success: true,
        tables: tableNames,
        rowCounts,
      });
    }

    if (action === 'query' && query) {
      // SELECT 쿼리만 허용 (SQL 인젝션 방지)
      const trimmed = query.trim().toUpperCase();
      const FORBIDDEN = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'REPLACE', 'ATTACH', 'DETACH'];
      if (!trimmed.startsWith('SELECT') || FORBIDDEN.some((kw) => trimmed.includes(kw + ' '))) {
        return NextResponse.json({ error: 'SELECT 쿼리만 허용됩니다' }, { status: 403 });
      }
      const result = database.exec(query);
      if (result.length === 0) {
        return NextResponse.json({ columns: [], rows: [] });
      }

      const columns = result[0].columns;
      const rows = result[0].values.map((row) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });

      return NextResponse.json({ columns, rows });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'SQL setup failed' },
      { status: 500 }
    );
  }
}

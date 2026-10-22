import sqlite3

con = sqlite3.connect('etech.db')
cur = con.cursor()
tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tables:", tables)

for t in tables:
    name = t[0]
    cols = cur.execute(f"PRAGMA table_info({name})").fetchall()
    print(f"\nTable {name}:")
    for col in cols:
        print("  ", col)
    rows = cur.execute(f"SELECT * FROM {name} LIMIT 5").fetchall()
    print(f"  Sample rows ({len(rows)}):", rows)

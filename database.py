import sqlite3

def create_db():
    conn = sqlite3.connect('earncash.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                     user_id INTEGER PRIMARY KEY,
                     username TEXT,
                     balance REAL DEFAULT 0,
                     last_claim_time INTEGER,
                     referral_code TEXT,
                     referred_by INTEGER
                 )''')
    c.execute('''CREATE TABLE IF NOT EXISTS ads_watched (
                     user_id INTEGER,
                     timestamp INTEGER
                 )''')
    c.execute('''CREATE TABLE IF NOT EXISTS withdrawals (
                     user_id INTEGER,
                     amount REAL,
                     status TEXT
                 )''')
    conn.commit()
    conn.close()

create_db()

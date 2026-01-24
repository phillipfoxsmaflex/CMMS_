#!/usr/bin/env python3

import psycopg2
import sys
import os
from psycopg2 import sql

def check_table_exists(host, port, database, user, password, table_name):
    """Check if a specific table exists in the database."""
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )
        cursor = conn.cursor()
        
        # Check if table exists
        query = sql.SQL("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = %s
            )
        """)
        cursor.execute(query, (table_name,))
        exists = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return exists
        
    except Exception as e:
        print(f"Error checking table {table_name}: {e}")
        return False

def main():
    # Get database connection parameters from environment variables
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'mms')
    db_user = os.getenv('DB_USER', 'rootUser')
    db_password = os.getenv('DB_PASSWORD', 'rootPassword')
    
    # Table to check
    table_name = 'safety_instruction'
    
    print(f"Checking if table '{table_name}' exists in database '{db_name}'...")
    
    if check_table_exists(db_host, db_port, db_name, db_user, db_password, table_name):
        print(f"⚠ Table '{table_name}' already exists!")
        sys.exit(1)
    else:
        print(f"✓ Table '{table_name}' does not exist - safe to run migrations")
        sys.exit(0)

if __name__ == "__main__":
    main()
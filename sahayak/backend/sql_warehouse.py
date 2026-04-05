"""
SQL Warehouse Connection Helper for Databricks Apps
Replaces Spark queries with SQL Warehouse connector
"""
import os
from databricks.sql import connect
from contextlib import contextmanager

# SQL Warehouse connection parameters from environment
SQL_WAREHOUSE_HOST = os.getenv("DATABRICKS_HOST", "dbc-2a619a88-b174.cloud.databricks.com")
SQL_WAREHOUSE_HTTP_PATH = os.getenv("DATABRICKS_HTTP_PATH", "/sql/1.0/warehouses/2086b6113a0b5faf")
SQL_WAREHOUSE_TOKEN = os.getenv("DATABRICKS_TOKEN", "")  # Will be provided by Databricks Apps

SQL_AVAILABLE = False

@contextmanager
def get_sql_connection():
    """Context manager for SQL Warehouse connections"""
    global SQL_AVAILABLE
    
    if not SQL_WAREHOUSE_TOKEN:
        print("⚠️ No DATABRICKS_TOKEN found - using mock data")
        SQL_AVAILABLE = False
        yield None
        return
    
    try:
        connection = connect(
            server_hostname=SQL_WAREHOUSE_HOST,
            http_path=SQL_WAREHOUSE_HTTP_PATH,
            access_token=SQL_WAREHOUSE_TOKEN
        )
        SQL_AVAILABLE = True
        yield connection
        connection.close()
    except Exception as e:
        print(f"⚠️ SQL Warehouse connection failed: {e}")
        SQL_AVAILABLE = False
        yield None

def execute_query(sql_query):
    """
    Execute a SQL query and return results as list of dicts
    Returns None if SQL is unavailable
    """
    with get_sql_connection() as conn:
        if conn is None:
            return None
        
        try:
            cursor = conn.cursor()
            cursor.execute(sql_query)
            
            # Get column names
            columns = [desc[0] for desc in cursor.description]
            
            # Fetch all rows and convert to list of dicts
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            cursor.close()
            return results
        except Exception as e:
            print(f"⚠️ Query execution failed: {e}")
            return None

def execute_update(sql_query):
    """
    Execute an UPDATE/INSERT query
    Returns True on success, False on failure
    """
    with get_sql_connection() as conn:
        if conn is None:
            return False
        
        try:
            cursor = conn.cursor()
            cursor.execute(sql_query)
            cursor.close()
            return True
        except Exception as e:
            print(f"⚠️ Update execution failed: {e}")
            return False

print("✅ SQL Warehouse connector loaded")

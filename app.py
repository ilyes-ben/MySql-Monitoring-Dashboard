from flask import Flask, jsonify
from mysql.connector import pooling
import time
import json
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
}

pool = pooling.MySQLConnectionPool(
    pool_name="dashboard_pool",
    pool_size=10,
    **MYSQL_CONFIG
)

def get_db_connection():
    return pool.get_connection()

@app.route('/')
def index():
    print("index")  

@app.route('/metrics/realtime')
def realtime_metrics():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COUNT(*) AS active_connections FROM information_schema.processlist WHERE USER IS NOT NULL")
        active_connections = cursor.fetchone()

        cursor.execute("""SELECT AVG(AVG_TIMER_WAIT) / 1e12 AS avg_response_time
                       FROM performance_schema.events_statements_summary_by_digest WHERE LAST_SEEN > NOW() - INTERVAL 1 SECOND;
        """)
        avg_response_time = cursor.fetchone()

        cursor.execute("""
            SELECT SUM(COUNT_READ) AS total_reads, SUM(COUNT_WRITE) AS total_writes
            FROM performance_schema.file_summary_by_event_name;
        """)
        io_usage = cursor.fetchone()

        cursor.execute("""SELECT ROUND(VARIABLE_VALUE * 0.000001, 2) AS MBytes_received,
                       ROUND((SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Bytes_sent') * 0.000001, 2) AS MBytes_sent
                       FROM performance_schema.global_status
                       WHERE VARIABLE_NAME = 'Bytes_received';""")
        network_traffic = cursor.fetchone()

        cursor.execute("SHOW GLOBAL STATUS LIKE 'Uptime'")
        server_uptime = cursor.fetchone()

        return jsonify({
            "active_connections": active_connections["active_connections"],
            "avg_response_time": avg_response_time["avg_response_time"],
            "io_usage": io_usage,
            "network_traffic": network_traffic,
            "server_uptime": server_uptime["Value"]
        })

    finally:
        cursor.close()
        connection.close()

@app.route('/metrics/static')
def static_metrics():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT table_schema AS database_name,
                   ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
            FROM information_schema.tables
            GROUP BY table_schema;
        """)
        database_size = cursor.fetchall()

        cursor.execute(""" SHOW DATABASES WHERE `Database` NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys','phpmyadmin') """)
        databases = cursor.fetchall()
        db_structure = []
        for db in databases:
            db_name = db["Database"]
            cursor.execute(f"USE {db_name};")
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            tables = [table["Tables_in_" + db_name] for table in tables]

            db_structure.append({
            "name": db_name,
            "children": [{"name": table} for table in tables]
        })   

        return jsonify({
            "database_size": database_size,
            "databases": db_structure
        })
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    print("Flask app is starting...")
    app.run(debug=True, host='127.0.0.1', port=5008)
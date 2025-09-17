from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- Configuración de la base de datos ---
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '', 
    'database': 'energy_data'
}

def crear_reporte():
    try:
        conn = mysql.connector.connect(**db_config)
        query = "SELECT fecha, fuente, ubicacion, consumo_kwh FROM consumos"
        df = pd.read_sql(query, conn)

        if df.empty:
            print("No hay datos en la tabla consumos.")
            return

        df['fecha'] = pd.to_datetime(df['fecha'], format='mixed', errors='coerce')
        df['mes'] = df['fecha'].dt.to_period('M').astype(str)
        reporte = df.groupby(['mes', 'fuente', 'ubicacion'], as_index=False)['consumo_kwh'].sum()
        reporte.to_csv(r'c:\prueba_react\Backend\reporte_consumo_mensual.csv', index=False, encoding='utf-8-sig')
        print("Reporte generado correctamente en c:\\prueba_react\\Backend\\reporte_consumo_mensual.csv")
    except Exception as e:
        print(f"Error al crear el reporte: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route('/api/consumos', methods=['POST'])
def agregar_consumo():
    try:
        data = request.get_json()
        fecha = data['fecha']
        fuente = data['fuente']
        ubicacion = data['ubicacion']
        consumo_kwh = data['consumo_kwh']

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        sql = "INSERT INTO consumos (fecha, fuente, ubicacion, consumo_kwh) VALUES (%s, %s, %s, %s)"
        values = (fecha, fuente, ubicacion, consumo_kwh)
        
        cursor.execute(sql, values)
        conn.commit()

        # Generar el reporte automáticamente después de guardar el consumo
        crear_reporte()

        return jsonify({'message': 'Consumo registrado con éxito'}), 201

    except mysql.connector.Error as err:
        return jsonify({'error': f'Error de base de datos: {err}'}), 500
    
    except Exception as e:
        return jsonify({'error': f'Ocurrió un error inesperado: {e}'}), 500
    
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/reporte', methods=['GET'])
def generar_reporte():
    try:
        crear_reporte()
        return jsonify({'message': 'Reporte generado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
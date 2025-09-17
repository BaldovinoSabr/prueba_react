import React, { useState } from 'react';


const EnergyForm = () => {
  const [formData, setFormData] = useState({
    fecha: '',
    fuente: '',
    ubicacion: '',
    consumo_kwh: ''
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- Lógica de validación ---
    if (!formData.fecha || !formData.fuente || !formData.ubicacion || !formData.consumo_kwh) {
      setError('Por favor, complete todos los campos.');
      setSuccessMessage('');
      return;
    }

    const consumoNum = parseFloat(formData.consumo_kwh);
    if (isNaN(consumoNum) || consumoNum <= 0) {
      setError('El consumo debe ser un número positivo.');
      setSuccessMessage('');
      return;
    }

    setError('');
    setSuccessMessage('Enviando datos...');

    // --- Lógica de conexión con el backend ---
    try {
      const response = await fetch('http://localhost:5000/api/consumos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.message);
        console.log('Datos guardados en la base de datos:', result);
        
        // Restablecer el formulario
        setFormData({
          fecha: '',
          fuente: '',
          ubicacion: '',
          consumo_kwh: ''
        });
      } else {
        const errorData = await response.json();
        setError(`Error al enviar los datos: ${errorData.error}`);
        setSuccessMessage('');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
      setSuccessMessage('');
      console.error('Error:', err);
    }
  };

  return (
    <div className="energy-form-container">
      <h2>Formulario de Consumo Energético</h2>
      <form onSubmit={handleSubmit} className="energy-form">
        
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div>
          <label htmlFor="fecha">Fecha:</label>
          <input
            type="datetime-local"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="fuente">Fuente:</label>
          <select
            id="fuente"
            name="fuente"
            value={formData.fuente}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Seleccione una opción</option>
            <option value="electricidad">Electricidad</option>
            <option value="gas">Gas</option>
            <option value="solar">Solar</option>
          </select>
        </div>

        <div>
          <label htmlFor="ubicacion">Ubicación:</label>
          <select
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Seleccione una opción</option>
            <option value="Planta Norte">Planta Norte</option>
            <option value="Planta Sur">Planta Sur</option>
            <option value="Planta Oeste">Planta Oeste</option>
          </select>
        </div>

        <div>
          <label htmlFor="consumo_kwh">Consumo (kWh):</label>
          <input
            type="number"
            id="consumo_kwh"
            name="consumo_kwh"
            value={formData.consumo_kwh}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-button">
          Enviar Datos
        </button>
      </form>
    </div>
  );
};

export default EnergyForm;
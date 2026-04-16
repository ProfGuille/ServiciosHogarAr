import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';

export default function NewServiceRequest() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán',
  ];

  const citiesByProvince: Record<string, string[]> = {
    'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Zárate', 'San Nicolás', 'Pergamino', 'Junín', 'Olavarría', 'Azul', 'Luján', 'Campana'],
    'CABA': ['Buenos Aires'],
    'Córdoba': ['Córdoba', 'Río Cuarto', 'Villa María', 'San Francisco'],
    'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto'],
    'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Guaymallén', 'Las Heras'],
    'Tucumán': ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo'],
    'Salta': ['Salta', 'San Ramón de la Nueva Orán', 'Tartagal'],
    'San Juan': ['San Juan', 'Rawson', 'Chimbas'],
    'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú', 'Concepción del Uruguay'],
    'Chaco': ['Resistencia', 'Presidencia Roque Sáenz Peña', 'Barranqueras'],
    'Corrientes': ['Corrientes', 'Goya', 'Paso de los Libres', 'Mercedes'],
    'Misiones': ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú'],
    'Formosa': ['Formosa', 'Clorinda', 'Pirané'],
    'Jujuy': ['San Salvador de Jujuy', 'San Pedro de Jujuy', 'Libertador General San Martín'],
    'Santiago del Estero': ['Santiago del Estero', 'La Banda', 'Termas de Río Hondo'],
    'Catamarca': ['San Fernando del Valle de Catamarca', 'Andalgalá'],
    'La Rioja': ['La Rioja', 'Chilecito'],
    'San Luis': ['San Luis', 'Villa Mercedes'],
    'Neuquén': ['Neuquén', 'San Martín de los Andes', 'Zapala'],
    'Río Negro': ['San Carlos de Bariloche', 'Viedma', 'General Roca', 'Cipolletti'],
    'Chubut': ['Comodoro Rivadavia', 'Trelew', 'Puerto Madryn', 'Rawson', 'Esquel'],
    'Santa Cruz': ['Río Gallegos', 'Caleta Olivia', 'El Calafate'],
    'Tierra del Fuego': ['Ushuaia', 'Río Grande'],
    'La Pampa': ['Santa Rosa', 'General Pico'],
  };

  const availableCities = selectedProvince ? (citiesByProvince[selectedProvince] ?? []) : [];

  useEffect(() => {
    setSelectedCity('');
    setCustomCity('');
  }, [selectedProvince]);

  useEffect(() => {
    if (categories.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const catId = params.get('categoriaId');
    if (catId) setSelectedCategoryId(catId);
  }, [categories]);

  useEffect(() => {
    fetch(getApiUrl('/api/categories'))
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error cargando categorías:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const finalCity = selectedCity === 'OTRA' ? customCity : selectedCity;

    const contactMethods: string[] = [];
    if (formData.get('contact_phone'))    contactMethods.push('Llamada');
    if (formData.get('contact_whatsapp')) contactMethods.push('WhatsApp');
    if (formData.get('contact_telegram')) contactMethods.push('Telegram');
    if (formData.get('contact_email'))    contactMethods.push('Email');

    const requestData = {
      categoryId:              parseInt(formData.get('categoryId') as string),
      title:                   formData.get('title'),
      description:             formData.get('description'),
      address:                 formData.get('address'),
      neighborhood:            formData.get('neighborhood'),
      city:                    finalCity,
      province:                formData.get('province'),
      customerFirstName:       formData.get('firstName'),
      customerPhone:           formData.get('phone'),
      customerEmail:           formData.get('email') || null,
      preferredContactMethods: contactMethods.join(', '),
      preferredDate:           formData.get('preferredDate') || null,
      isUrgent:                formData.get('isUrgent') === 'on',
    };

    try {
      const response = await fetch(getApiUrl('/api/service-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'No se pudo enviar'));
        setLoading(false);
      }
    } catch (error) {
      alert('Error de conexión. Intentá de nuevo en unos segundos.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">¡Solicitud enviada!</h2>
          <p className="text-gray-600 mb-6">
            Los proveedores verán tu solicitud y te contactarán pronto.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2">Solicitar Servicio</h1>
        <p className="text-gray-600 mb-6">
          Proveedores de tu zona te contactarán con presupuestos.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de servicio *</label>
              <select name="categoryId" required className="w-full border rounded-lg px-4 py-2" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
                <option value="">Seleccioná un servicio</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Título *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Ej: Reparación de canilla"
                className="w-full border rounded-lg px-4 py-2"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción *</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Describe el trabajo..."
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Datos de contacto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tu nombre *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="Juan"
                    className="w-full border rounded-lg px-4 py-2"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+54 9 11 1234-5678"
                    className="w-full border rounded-lg px-4 py-2"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email (opcional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    className="w-full border rounded-lg px-4 py-2"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">¿Cómo preferís que te contacten?</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="contact_phone" className="w-4 h-4 mr-2" />
                      <span className="text-sm">Llamada telefónica</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="contact_whatsapp" className="w-4 h-4 mr-2" defaultChecked />
                      <span className="text-sm">WhatsApp</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="contact_telegram" className="w-4 h-4 mr-2" />
                      <span className="text-sm">Telegram</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="contact_email" className="w-4 h-4 mr-2" />
                      <span className="text-sm">Email</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Ubicación</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Provincia *</label>
                  <select
                    name="province"
                    required
                    value={selectedProvince}
                    onChange={e => setSelectedProvince(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="">Seleccioná tu provincia</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ciudad *</label>
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    required={!customCity}
                    disabled={!selectedProvince}
                    className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
                  >
                    <option value="">
                      {selectedProvince ? 'Seleccioná tu ciudad' : 'Primero seleccioná provincia'}
                    </option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    {selectedProvince && <option value="OTRA">Otra ciudad...</option>}
                  </select>
                </div>

                {selectedCity === 'OTRA' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">¿Cuál ciudad? *</label>
                    <input
                      type="text"
                      value={customCity}
                      onChange={e => setCustomCity(e.target.value)}
                      required
                      placeholder="Escribí tu ciudad"
                      className="w-full border rounded-lg px-4 py-2"
                      autoComplete="off"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Dirección *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Av. Santa Fe 1234"
                    className="w-full border rounded-lg px-4 py-2"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo vos verás la dirección. Los proveedores ven solo la zona.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Barrio / Zona *</label>
                  <input
                    type="text"
                    name="neighborhood"
                    required
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    placeholder="Centro, Palermo..."
                    className="w-full border rounded-lg px-4 py-2"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">¿Cuándo? (opcional)</label>
                <input type="date" name="preferredDate" className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="isUrgent" id="urgent" className="w-4 h-4" />
                <label htmlFor="urgent" className="ml-2 text-sm">Es urgente</label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                🔒 Los proveedores solo ven tu nombre, teléfono y zona.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

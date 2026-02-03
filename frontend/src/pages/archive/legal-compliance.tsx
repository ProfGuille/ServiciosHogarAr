import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle
} from "lucide-react";

interface UserLegalData {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  termsAcceptedAt: string;
  privacyPolicyAcceptedAt: string;
  legalDisclaimerAcceptedAt: string;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}

export default function LegalCompliance() {
  const [userData, setUserData] = useState<UserLegalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingConsent, setUpdatingConsent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Gestión de Datos Personales - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
    
    // Simulated user ID - in real implementation, get from auth context
    fetchUserLegalData(1);
  }, []);

  const fetchUserLegalData = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/legal-data/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setUserData(data.personalData);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching legal data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos personales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMarketingConsent = async (newConsent: boolean) => {
    if (!userData) return;
    
    setUpdatingConsent(true);
    try {
      const response = await fetch(`/api/users/marketing-consent/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ marketingConsent: newConsent }),
      });

      const result = await response.json();

      if (response.ok) {
        setUserData(prev => prev ? { ...prev, marketingConsent: newConsent } : null);
        toast({
          title: "Consentimiento actualizado",
          description: result.message,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el consentimiento",
        variant: "destructive",
      });
    } finally {
      setUpdatingConsent(false);
    }
  };

  const downloadPersonalData = () => {
    if (!userData) return;

    const dataToDownload = {
      ...userData,
      downloadedAt: new Date().toISOString(),
      legalRights: {
        access: 'Derecho de acceso a datos personales',
        rectification: 'Derecho de rectificación de datos erróneos', 
        cancellation: 'Derecho de supresión/cancelación de datos',
        opposition: 'Derecho de oposición al tratamiento'
      }
    };

    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos-personales-${userData.email}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Descarga iniciada",
      description: "Sus datos personales se han descargado exitosamente",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="space-y-3">
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Gestión de Datos Personales
          </h1>
          <p className="text-slate-600">
            Conforme a la Ley 25.326 de Protección de Datos Personales - Derechos ARCO
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Sus Derechos</h3>
              <p className="text-blue-700 text-sm">
                Bajo la Ley 25.326, usted tiene derecho a acceder, rectificar, cancelar y 
                oponerse al tratamiento de sus datos personales. Use esta página para 
                gestionar sus datos y consentimientos.
              </p>
            </div>
          </div>
        </div>

        {userData && (
          <div className="space-y-6">
            {/* Personal Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <span>Datos Personales (Derecho de Acceso)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nombre</label>
                    <p className="mt-1 text-slate-900">{userData.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <p className="mt-1 text-slate-900">{userData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Fecha de registro</label>
                    <p className="mt-1 text-slate-900">
                      {new Date(userData.createdAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button onClick={downloadPersonalData} variant="outline" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Descargar todos mis datos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Legal Acceptances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Términos Legales Aceptados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Términos y Condiciones</p>
                        <p className="text-sm text-slate-600">
                          Aceptado el {new Date(userData.termsAcceptedAt).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Política de Privacidad (Ley 25.326)</p>
                        <p className="text-sm text-slate-600">
                          Aceptado el {new Date(userData.privacyPolicyAcceptedAt).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Aviso Legal y Descargo de Responsabilidad</p>
                        <p className="text-sm text-slate-600">
                          Aceptado el {new Date(userData.legalDisclaimerAcceptedAt).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  <span>Gestión de Consentimientos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {userData.dataProcessingConsent ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">Procesamiento de Datos (Obligatorio)</p>
                        <p className="text-sm text-slate-600">
                          Necesario para el funcionamiento de la plataforma
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">No modificable</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Comunicaciones de Marketing</p>
                        <p className="text-sm text-slate-600">
                          Emails promocionales y ofertas especiales
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={userData.marketingConsent}
                        onCheckedChange={(checked) => updateMarketingConsent(!!checked)}
                        disabled={updatingConsent}
                      />
                      {updatingConsent && (
                        <div className="h-4 w-4 animate-spin border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact for Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>Ejercer sus Derechos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Para ejercer sus derechos de rectificación, cancelación u oposición al 
                  tratamiento de datos, contáctenos:
                </p>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="font-medium">Contacto de Privacidad</p>
                  <p className="text-blue-600">
                    <a href="mailto:privacidad@servicioshogar.com.ar">
                      privacidad@servicioshogar.com.ar
                    </a>
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Responderemos a su solicitud dentro de 10 días hábiles conforme a la ley.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
      <Toaster />
    </div>
  );
}
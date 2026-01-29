import axios from 'axios';

const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
  accountId: process.env.ZOHO_ACCOUNT_ID!,
};

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        refresh_token: ZOHO_CONFIG.refreshToken,
        client_id: ZOHO_CONFIG.clientId,
        client_secret: ZOHO_CONFIG.clientSecret,
        grant_type: 'refresh_token',
      },
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    
    console.log('✅ Access token renovado exitosamente');
    return accessToken;
  } catch (error: any) {
    console.error('❌ Error renovando token Zoho:', error.response?.data || error.message);
    throw new Error('No se pudo renovar el access token de Zoho');
  }
}

export async function sendEmailViaZohoAPI(
  to: string,
  subject: string,
  htmlContent: string,
  fromAddress: string = 'administrador@servicioshogar.com.ar'
): Promise<boolean> {
  try {
    const token = await getAccessToken();

    // Formato correcto según Zoho Mail API
    const emailData = {
      fromAddress: fromAddress,
      toAddress: to,
      ccAddress: '',
      bccAddress: '',
      subject: subject,
      content: htmlContent,
      mailFormat: 'html',
      askReceipt: 'no'
    };

    console.log(`📤 Enviando email a ${to} con subject: ${subject}`);

    const response = await axios.post(
      `https://mail.zoho.com/api/accounts/${ZOHO_CONFIG.accountId}/messages`,
      emailData,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Email enviado vía Zoho API a ${to}:`, response.data);
    return true;
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Error Zoho API Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error('❌ Error enviando email:', error.message);
    }
    return false;
  }
}

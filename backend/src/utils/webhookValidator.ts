import * as crypto from "crypto";

const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;

if (!MP_WEBHOOK_SECRET) {
  console.error("❌ MP_WEBHOOK_SECRET no está definido en el entorno");
}

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida la firma HMAC de un webhook de Mercado Pago
 * 
 * Mercado Pago envía la firma en el header x-signature con formato:
 * "ts=timestamp,v1=hash_hmac_sha256"
 * 
 * @param xSignature - Header x-signature completo
 * @param xRequestId - Header x-request-id (ID único del webhook)
 * @param dataId - El data.id del body del webhook
 * @returns Resultado de validación con isValid y error opcional
 */
export function validateMercadoPagoWebhook(
  xSignature: string | undefined,
  xRequestId: string | undefined,
  dataId: string | undefined
): WebhookValidationResult {
  // 1. Validar que existan los headers requeridos
  if (!xSignature) {
    return {
      isValid: false,
      error: "Header x-signature faltante"
    };
  }

  if (!xRequestId) {
    return {
      isValid: false,
      error: "Header x-request-id faltante"
    };
  }

  if (!dataId) {
    return {
      isValid: false,
      error: "data.id faltante en el body"
    };
  }

  if (!MP_WEBHOOK_SECRET) {
    return {
      isValid: false,
      error: "MP_WEBHOOK_SECRET no configurado"
    };
  }

  // 2. Parsear el header x-signature
  // Formato: "ts=1704910000,v1=abc123def456..."
  const parts = xSignature.split(',');
  let ts: string | null = null;
  let hash: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') {
      ts = value;
    } else if (key === 'v1') {
      hash = value;
    }
  }

  if (!ts || !hash) {
    return {
      isValid: false,
      error: "Formato de x-signature inválido"
    };
  }

  // 3. Construir el manifest según documentación de MP
  // manifest = "id:{data.id};request-id:{x-request-id};ts:{ts};"
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // 4. Calcular el HMAC SHA256
  const expectedHash = crypto
    .createHmac('sha256', MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex');

  // 5. Comparar de forma segura contra timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(hash)
  );

  if (!isValid) {
    return {
      isValid: false,
      error: "Firma HMAC inválida - webhook potencialmente falso"
    };
  }

  // 6. Validar timestamp (opcional pero recomendado)
  // Rechazar webhooks con más de 5 minutos de antigüedad
  const webhookTime = parseInt(ts, 10) * 1000; // Convertir a milisegundos
  const currentTime = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutos

  if (currentTime - webhookTime > maxAge) {
    return {
      isValid: false,
      error: "Webhook expirado (más de 5 minutos de antigüedad)"
    };
  }

  // 7. Todo OK
  return {
    isValid: true
  };
}

/**
 * Helper para extraer headers de Express request
 */
export function extractWebhookHeaders(req: any) {
  return {
    xSignature: req.headers['x-signature'] as string | undefined,
    xRequestId: req.headers['x-request-id'] as string | undefined,
  };
}

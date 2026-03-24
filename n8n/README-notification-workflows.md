# Notification Service Workflows

Workflows generados para vender un servicio de notificaciones sobre n8n.

## Archivos

- `notification-service-sales-chat.json`
  - Webhook `POST /notification-service-sales-chat`
  - Califica la intención comercial y recomienda un plan.

- `notification-service-demo-intake.json`
  - Webhook `POST /notification-demo-intake`
  - Registra pedidos de demo, calcula segmento y arma un brief comercial.

## Credenciales

No dependen de credenciales externas para poder importarlos y probarlos.
Usan `staticData` de n8n para guardar leads y requests de forma simple.

## Payload mínimo sugerido

### Sales Chat

```json
{
  "text": "Quiero automatizar recordatorios de pago por WhatsApp y email",
  "channels": ["whatsapp", "email"],
  "monthlyContacts": 12000,
  "lead": {
    "name": "Julian",
    "email": "julian@empresa.com",
    "company": "Empresa Demo"
  }
}
```

### Demo Intake

```json
{
  "name": "Julian",
  "email": "julian@empresa.com",
  "company": "Empresa Demo",
  "monthlyContacts": 12000,
  "channels": ["whatsapp", "email"],
  "useCase": "recordatorios de pago y avisos operativos",
  "currentTools": ["HubSpot", "Shopify"],
  "urgency": "alta"
}
```

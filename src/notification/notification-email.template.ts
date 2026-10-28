interface NotificationEmailData {
    message: string;
    type: string;
    appName: string;
}

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');


export function notificationEmailTemplate({ message, type, appName }: NotificationEmailData) {
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
    const subject = `${appName}: tenés una nueva notificación`;

    const html = `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
                <h1 style="margin:0;font-size:20px;color:#18181b;">${escapeHtml(appName)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#71717a;">
                  ${escapeHtml(type)}
                </p>
                <p style="margin:0;font-size:16px;line-height:1.5;color:#27272a;">${safeMessage}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;">
                Recibiste este mail porque tenés una cuenta en ${escapeHtml(appName)}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const text = `${appName}\n\n${message}\n\nRecibiste este mail porque tenés una cuenta en ${appName}.`;

    return { subject, html, text };
}
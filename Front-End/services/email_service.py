"""
services/email_service.py
Serviço de envio de e-mails transacionais (fatura de compra, etc.)
Reutiliza a mesma infra SMTP usada em /forgot-password.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASS = os.getenv("GMAIL_APP_PASS")
SITE_NAME  = "Duria"
SITE_URL   = os.getenv("SITE_URL", "http://localhost:3000")


def _enviar_email_sync(destinatario: str, assunto: str, html: str):
    """Envio síncrono — deve ser chamado dentro de asyncio.to_thread()."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = assunto
    msg["From"]    = f"{SITE_NAME} <{GMAIL_USER}>"
    msg["To"]      = destinatario
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_PASS)
        server.sendmail(GMAIL_USER, destinatario, msg.as_string())


def _montar_html_fatura(
    nome_cliente: str,
    nome_planta: str,
    valor: float,
    compra_id: str,
    data_compra: datetime,
    imagem_url: str | None,
) -> str:
    data_fmt = data_compra.strftime("%d/%m/%Y às %H:%M")
    preco_fmt = f"${valor:,.2f}"

    imagem_html = (
        f'<img src="{imagem_url}" width="64" height="64" '
        f'style="border-radius:8px;object-fit:cover;" />'
        if imagem_url else
        '<div style="width:64px;height:64px;border-radius:8px;background:#2a2a2e;"></div>'
    )

    return f"""
    <html>
    <body style="margin:0;padding:0;background-color:#0e0e10;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0e0e10;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0"
                   style="background-color:#1b1b1f;border-radius:12px;overflow:hidden;border:1px solid #2a2a2e;">

              <!-- Header -->
              <tr>
                <td style="background-color:#15151a;padding:28px 32px;border-bottom:1px solid #2a2a2e;">
                  <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
                    DURIA
                  </span>
                </td>
              </tr>

              <!-- Confirmação -->
              <tr>
                <td style="padding:32px 32px 8px 32px;">
                  <p style="color:#8ad26a;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 0;">
                    Pagamento confirmado
                  </p>
                  <h1 style="color:#ffffff;font-size:22px;margin:0 0 4px 0;">
                    Obrigado pela compra, {nome_cliente}!
                  </h1>
                  <p style="color:#9a9aa0;font-size:14px;margin:0;">
                    Este é o recibo da sua encomenda em {data_fmt}.
                  </p>
                </td>
              </tr>

              <!-- Item -->
              <tr>
                <td style="padding:24px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                         style="background-color:#222226;border-radius:10px;padding:16px;">
                    <tr>
                      <td width="64" style="padding-right:14px;">{imagem_html}</td>
                      <td>
                        <p style="color:#ffffff;font-size:15px;font-weight:600;margin:0 0 4px 0;">
                          {nome_planta}
                        </p>
                        <p style="color:#7a7a82;font-size:12px;margin:0;">
                          Pedido #{compra_id[:8]}
                        </p>
                      </td>
                      <td align="right" style="color:#ffffff;font-size:15px;font-weight:600;white-space:nowrap;">
                        {preco_fmt}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Total -->
              <tr>
                <td style="padding:0 32px 24px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-top:1px solid #2a2a2e;padding-top:16px;color:#9a9aa0;font-size:14px;">
                        Total pago
                      </td>
                      <td align="right" style="border-top:1px solid #2a2a2e;padding-top:16px;color:#8ad26a;font-size:18px;font-weight:700;">
                        {preco_fmt}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td style="padding:0 32px 32px 32px;">
                  <a href="{SITE_URL}/dashboard/historico"
                     style="display:block;text-align:center;background-color:#1f8b3a;color:#ffffff;
                            text-decoration:none;font-weight:600;font-size:14px;padding:14px 0;
                            border-radius:8px;">
                    Ver detalhes da compra
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;border-top:1px solid #2a2a2e;">
                  <p style="color:#5f5f66;font-size:11px;margin:0;line-height:1.6;">
                    Este e-mail foi enviado automaticamente pela Duria após a confirmação do pagamento.
                    Se não reconhece esta compra, contacte o nosso suporte.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


def enviar_fatura_compra(
    destinatario: str,
    nome_cliente: str,
    nome_planta: str,
    valor: float,
    compra_id: str,
    imagem_url: str | None = None,
):
    """
    Envia a fatura/recibo de compra por e-mail.
    Síncrono por natureza (smtplib) — chamar via asyncio.to_thread() nas rotas async.
    """
    if not destinatario:
        print("[email_service] Sem destinatário, fatura não enviada.")
        return

    html = _montar_html_fatura(
        nome_cliente=nome_cliente or "Cliente",
        nome_planta=nome_planta or "Planta",
        valor=valor or 0,
        compra_id=compra_id,
        data_compra=datetime.utcnow(),
        imagem_url=imagem_url,
    )
    assunto = f"O seu recibo — {nome_planta}"

    try:
        _enviar_email_sync(destinatario, assunto, html)
        print(f"[email_service] Fatura enviada para {destinatario}")
    except Exception as e:
        print(f"[email_service][ERRO] Falha ao enviar fatura: {e}")
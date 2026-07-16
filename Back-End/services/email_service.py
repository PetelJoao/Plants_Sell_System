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
    email_cliente: str,
    nome_arquiteto: str = "Duria",
) -> str:
    data_fmt = data_compra.strftime("%d de %B de %Y")
    # Traduz o mês para português (strftime dá em inglês por default)
    meses = {
        "January": "Janeiro", "February": "Fevereiro", "March": "Março",
        "April": "Abril", "May": "Maio", "June": "Junho",
        "July": "Julho", "August": "Agosto", "September": "Setembro",
        "October": "Outubro", "November": "Novembro", "December": "Dezembro",
    }
    for en, pt in meses.items():
        data_fmt = data_fmt.replace(en, pt)

    preco_fmt = f"${valor:,.2f} USD"

    # ID da fatura legível: prefixo + parte do UUID em maiúsculas
    id_fatura = f"F{compra_id.replace('-', '')[:10].upper()}"

    return f"""
    <html>
    <body style="margin:0;padding:0;background-color:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0">

              <!-- Título fora do cartão -->
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <span style="color:#1a1a1a;font-size:38px;font-weight:800;letter-spacing:-0.5px;">
                    Obrigado.
                  </span>
                </td>
              </tr>

              <!-- Cartão principal -->
              <tr>
                <td style="background-color:#ffffff;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                  <table width="100%" cellpadding="0" cellspacing="0">

                    <!-- Saudação -->
                    <tr>
                      <td align="center" style="padding:40px 40px 0 40px;">
                        <p style="color:#1a1a1a;font-size:16px;font-weight:700;margin:0 0 4px 0;">
                          Olá {nome_cliente},
                        </p>
                        <p style="color:#666666;font-size:14px;margin:0;">
                          Agradecemos a sua compra!
                        </p>
                      </td>
                    </tr>

                    <!-- ID da fatura -->
                    <tr>
                      <td align="center" style="padding:28px 40px;">
                        <p style="color:#999999;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px 0;">
                          ID da fatura:
                        </p>
                        <p style="color:#1a1a1a;font-size:24px;font-weight:800;letter-spacing:0.5px;margin:0;">
                          {id_fatura}
                        </p>
                      </td>
                    </tr>

                    <!-- Informação do pedido -->
                    <tr>
                      <td style="padding:0 40px;">
                        <p style="color:#999999;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px 0;border-bottom:1px solid #e5e5e5;padding-bottom:10px;">
                          Informação do seu pedido:
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 40px 24px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="50%" style="vertical-align:top;">
                              <p style="color:#1a1a1a;font-size:13px;font-weight:700;margin:0 0 4px 0;">ID do pedido:</p>
                              <p style="color:#444444;font-size:13px;margin:0;">{compra_id}</p>
                            </td>
                            <td width="50%" style="vertical-align:top;">
                              <p style="color:#1a1a1a;font-size:13px;font-weight:700;margin:0 0 4px 0;">Enviar cobrança para:</p>
                              <p style="margin:0;"><a href="mailto:{email_cliente}" style="color:#2563eb;font-size:13px;text-decoration:none;">{email_cliente}</a></p>
                            </td>
                          </tr>
                          <tr><td colspan="2" style="height:16px;"></td></tr>
                          <tr>
                            <td width="50%" style="vertical-align:top;">
                              <p style="color:#1a1a1a;font-size:13px;font-weight:700;margin:0 0 4px 0;">Data do pedido:</p>
                              <p style="color:#444444;font-size:13px;margin:0;">{data_fmt}</p>
                            </td>
                            <td width="50%" style="vertical-align:top;">
                              <p style="color:#1a1a1a;font-size:13px;font-weight:700;margin:0 0 4px 0;">Fonte:</p>
                              <p style="color:#444444;font-size:13px;margin:0;">
                                <span style="background-color:#fde68a;padding:1px 5px;border-radius:3px;font-weight:700;">Duria</span> Plantas
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Tabela do pedido -->
                    <tr>
                      <td style="padding:0 40px;">
                        <p style="color:#999999;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 0 0;">
                          Aqui está o seu pedido:
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 40px 0 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr style="background-color:#f5f5f5;">
                            <td style="padding:10px 12px;color:#1a1a1a;font-size:12px;font-weight:700;">Descrição:</td>
                            <td style="padding:10px 12px;color:#1a1a1a;font-size:12px;font-weight:700;">Arquiteto:</td>
                            <td align="right" style="padding:10px 12px;color:#1a1a1a;font-size:12px;font-weight:700;">Preço:</td>
                          </tr>
                          <tr>
                            <td style="padding:12px;color:#444444;font-size:13px;border-bottom:1px solid #eeeeee;">{nome_planta}</td>
                            <td style="padding:12px;color:#444444;font-size:13px;border-bottom:1px solid #eeeeee;">{nome_arquiteto}</td>
                            <td align="right" style="padding:12px;color:#1a1a1a;font-size:13px;font-weight:600;border-bottom:1px solid #eeeeee;">{preco_fmt}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Total -->
                    <tr>
                      <td style="padding:16px 40px 0 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="border-top:1px solid #e5e5e5;padding-top:14px;color:#999999;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                              Total:
                            </td>
                            <td align="right" style="border-top:1px solid #e5e5e5;padding-top:14px;color:#1a1a1a;font-size:15px;font-weight:800;">
                              {preco_fmt}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding:32px 40px 40px 40px;">
                        <p style="color:#666666;font-size:12px;margin:0 0 18px 0;">
                          Guarde uma cópia deste recibo.
                        </p>
                        <p style="margin:0 0 10px 0;">
                          <a href="{SITE_URL}/dashboard/historico" style="color:#2563eb;font-size:13px;text-decoration:none;">
                            Ver todo o seu histórico de compras
                          </a>
                        </p>
                      </td>
                    </tr>

                  </table>
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
    nome_arquiteto: str = "Duria",
):
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
        email_cliente=destinatario,
        nome_arquiteto=nome_arquiteto,
    )
    assunto = f"O seu recibo — {nome_planta}"

    try:
        _enviar_email_sync(destinatario, assunto, html)
        print(f"[email_service] Fatura enviada para {destinatario}")
    except Exception as e:
        print(f"[email_service][ERRO] Falha ao enviar fatura: {e}")

def _montar_html_codigo(nome_cliente: str, codigo: str) -> str:
    return f"""
    <html>
    <body style="margin:0;padding:0;background-color:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <span style="color:#1a1a1a;font-size:32px;font-weight:800;letter-spacing:-0.5px;">
                    Confirme a sua conta
                  </span>
                </td>
              </tr>
              <tr>
                <td style="background-color:#ffffff;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:40px 40px 8px 40px;">
                        <p style="color:#1a1a1a;font-size:16px;font-weight:700;margin:0 0 4px 0;">
                          Olá {nome_cliente},
                        </p>
                        <p style="color:#666666;font-size:14px;margin:0;">
                          Use o código abaixo para confirmar o seu e-mail na {SITE_NAME}.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:28px 40px;">
                        <span style="display:inline-block;background-color:#f5f5f5;border-radius:6px;
                                      padding:16px 32px;color:#1a1a1a;font-size:32px;font-weight:800;
                                      letter-spacing:8px;">
                          {codigo}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:0 40px 40px 40px;">
                        <p style="color:#999999;font-size:12px;margin:0;">
                          Este código expira em 15 minutos. Se não foi você quem se registou,
                          pode ignorar este e-mail.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


def enviar_codigo_verificacao(destinatario: str, nome_cliente: str, codigo: str):
    if not destinatario:
        print("[email_service] Sem destinatário, código não enviado.")
        return

    html = _montar_html_codigo(nome_cliente=nome_cliente or "Cliente", codigo=codigo)
    assunto = f"O seu código de verificação — {SITE_NAME}"

    try:
        _enviar_email_sync(destinatario, assunto, html)
        print(f"[email_service] Código de verificação enviado para {destinatario}")
    except Exception as e:
        print(f"[email_service][ERRO] Falha ao enviar código: {e}")
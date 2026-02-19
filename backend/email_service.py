import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

GMAIL_USER = os.getenv('GMAIL_USER', '')
GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD', '')

async def send_order_confirmation_email(order_data: dict):
    if not GMAIL_USER or not GMAIL_APP_PASSWORD or GMAIL_APP_PASSWORD == 'your_app_password':
        print('Email not configured. Skipping email send.')
        print(f'Order confirmation for: {order_data["email"]}')
        return {'status': 'skipped', 'message': 'Email service not configured'}
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Order Confirmation - {order_data["order_number"]} | Samruddhi Organics'
        msg['From'] = GMAIL_USER
        msg['To'] = order_data['email']
        
        items_html = ''
        for item in order_data['items']:
            items_html += f'''
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{item['product_name']}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{item['quantity']}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹{item['price']:.2f}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹{item['subtotal']:.2f}</td>
            </tr>
            '''
        
        html_body = f'''
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D342C;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #F5F1E8; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #4A7C59; margin: 0;">Samruddhi Organics</h1>
                    <p style="color: #7FB539; margin: 5px 0;">Organic Farming Supplies</p>
                </div>
                
                <div style="padding: 30px 0;">
                    <h2 style="color: #4A7C59;">Thank You for Your Order!</h2>
                    <p>Dear {order_data['customer_name']},</p>
                    <p>Your order has been successfully received. We will contact you shortly to confirm your order.</p>
                    
                    <div style="background: #F5F1E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Order Number:</strong> {order_data['order_number']}</p>
                        <p style="margin: 5px 0;"><strong>Order Date:</strong> {order_data['created_at']}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> {order_data['status'].title()}</p>
                    </div>
                    
                    <h3 style="color: #4A7C59;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                        <thead>
                            <tr style="background: #4A7C59; color: white;">
                                <th style="padding: 10px; text-align: left;">Product</th>
                                <th style="padding: 10px; text-align: center;">Qty</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                                <th style="padding: 10px; text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                                <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #4A7C59; font-size: 18px;">₹{order_data['total_amount']:.2f}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <h3 style="color: #4A7C59;">Delivery Address</h3>
                    <div style="background: #F5F1E8; padding: 15px; border-radius: 8px;">
                        <p style="margin: 5px 0;">{order_data['address']}</p>
                        <p style="margin: 5px 0;">{order_data['city']}, {order_data['state']} - {order_data['pincode']}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> {order_data['phone']}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #F5F1E8; border-radius: 8px; text-align: center;">
                        <p style="margin: 5px 0; color: #4A7C59; font-weight: bold;">Thank you for choosing organic!</p>
                        <p style="margin: 5px 0; font-size: 14px;">For any queries, feel free to contact us.</p>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                    <p>© 2026 Samruddhi Organics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        '''
        
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        await aiosmtplib.send(
            msg,
            hostname='smtp.gmail.com',
            port=587,
            start_tls=True,
            username=GMAIL_USER,
            password=GMAIL_APP_PASSWORD
        )
        
        return {'status': 'sent', 'message': 'Email sent successfully'}
    except Exception as e:
        print(f'Email error: {str(e)}')
        return {'status': 'error', 'message': str(e)}

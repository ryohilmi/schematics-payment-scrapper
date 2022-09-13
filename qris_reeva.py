import pandas as pd
from datetime import datetime
import locale

locale.setlocale(locale.LC_ALL, 'id_ID')

df = pd.read_csv('qris_reeva.csv')

df['Tanggal Pembayaran'] = df['Transaction time'].apply(lambda x: datetime.fromisoformat(x).strftime("%d %B %Y"))
df['Jam'] = df['Transaction time'].apply(lambda x: datetime.fromisoformat(x).strftime("%H:%M"))
df['Jenis Pembayaran'] = 'QRIS'
df['Nominal'] = df['Amount']
df['Bank Pengirim'] = df['QRIS Issuer']
df['Keterangan'] = df['Order ID']

df = df[['Tanggal Pembayaran', 'Jam', 'Jenis Pembayaran', 'Nominal', 'Bank Pengirim', 'Keterangan']]
df = df.iloc[::-1]

reeva = df
reeva.to_csv('filtered/reeva.csv', index=False)
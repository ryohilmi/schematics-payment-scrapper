import pandas as pd
from datetime import datetime
import locale

locale.setlocale(locale.LC_ALL, 'id_ID')

df = pd.read_csv('qris.csv')

df['Tanggal Pembayaran'] = df['Transaction time'].apply(lambda x: datetime.fromisoformat(x).strftime("%d %B %Y"))
df['Jam'] = df['Transaction time'].apply(lambda x: datetime.fromisoformat(x).strftime("%H:%M"))
df['Jenis Pembayaran'] = 'QRIS'
df['Nominal'] = df['Amount']
df['Bank Pengirim'] = ""
df['Keterangan'] = df['Order ID']

df = df[['Tanggal Pembayaran', 'Jam', 'Jenis Pembayaran', 'Nominal', 'Bank Pengirim', 'Keterangan']]
df = df.iloc[::-1]

npc_senior = df.query('120000 <= Nominal <= 123000')
npc_senior.to_csv('filtered/npc_senior.csv', index=False)

npc_junior = df.query('50000 <= Nominal <= 53000')
npc_junior.to_csv('filtered/npc_junior.csv', index=False)

nlc = df.query('150000 <= Nominal <= 152000' or '135000 <= Nominal <= 138000')
nlc.to_csv('filtered/nlc.csv', index=False)

nst = df.query('Nominal >= 60000 and Nominal % 60000 <= 2000')
nst.to_csv('filtered/nst.csv', index=False)

reeva = df.query('Nominal >= 125000 and Nominal % 125000 <= 2000')
reeva.to_csv('filtered/reeva.csv', index=False)
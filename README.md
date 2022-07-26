# schematics-payment-scrapper

## How to run (Mandiri Scrapper)

- Clone the repo
  `git clone https://github.com/ryohilmi/schematics-payment-scrapper.git`
- `cd schematics-payment-scrapper`
- Install dependencies `npm install`
- Create `.env` file
  ```
  USERID="[userid]"
  PASSWORD="[password]"
  ```
- Run the program `node app.js [category]`

| Category   | Val              |
| ---------- | ---------------- |
| npc senior | 120.000          |
| npc junior | 50.000           |
| nlc        | 150.000          |
| nst        | kelipatan 60.000 |

## How to run (Gobiz)

- Download the csv from Gobiz and rename it to `qris.csv`
- Install pandas `pip install pandas`
- Create `filtered` folder
- Run `qris.py`

## How to run (Buat akun)

- Create account list csv file
  ![format csv](https://cdn.discordapp.com/attachments/978272595214475276/1013148631152480326/unknown.png)
- Run the program
  ```
  node buat-akun.js [namafile.csv]
  ```

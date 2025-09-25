<div align="center">

<img alt="Polypore" src="https://em-content.zobj.net/source/microsoft-teams/363/card-file-box_1f5c3-fe0f.png" width="96" />


## Polypore

### Inventory & Loan Management for Film Gear (MVP)

</div>

---

## 🌟 What is Polypore?

Polypore is a tiny web app to manage your gear inventory for shoots. Declare items, create shoots, book loans with availability checks, and see what’s available right now.

## ✅ Features (MVP)

| Feature | Description |
|:--|:--|
| Inventory | Add items with name, type (camera/light/cable/other), total stock |
| Shoots | Create shoots with name, location, start/end dates |
| Loans | Reserve items for a shoot; prevents overbooking |
| Dashboard | Availability “now” per item (total vs available) |

## 🚀 Quickstart

- Prerequisites: Docker + Docker Compose

```bash
cd app
make setup   # installs deps + creates .env files (front/back)
make up      # builds & starts front+back
```

- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8000/docs`

---

### 🙌 Contributing
Issues and ideas welcome. This is a POC—keep it simple, ship often. 
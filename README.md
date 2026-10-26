# Cricketer CRUD REST API

A RESTful API built with **Node.js**, **Express**, and **MongoDB (Mongoose)** for managing cricketers' records, created for Software Quality Engineering (SQE) PBL project. Tested with Postman for integration testing.

---

## 🚀 Features

- **Full CRUD operations** for cricketer records:
  - `POST /api/cricketers` - Create a new cricketer
  - `GET /api/cricketers` - Get all cricketers
  - `GET /api/cricketers/:id` - Get a cricketer by ID
  - `PUT /api/cricketers/:id` - Update cricketer details
  - `DELETE /api/cricketers/:id` - Remove a cricketer
- Data validation and error handling (unique jersey numbers, required fields, enum roles).
- Pre-configured Postman test collection (`Cricketer_API.postman_collection.json`).

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB / Mongoose ODM
- **Testing:** Postman API Testing Collection

---

## 📦 Installation & Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/raqeebmemon0/Cricketer_crud_api.git
   cd Cricketer_crud_api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017` or supply a `MONGO_URI` environment variable.

4. **Run the server:**
   ```bash
   npm start
   # or
   node server.js
   ```
   The API will be accessible at `http://localhost:3000/api/cricketers`.

---

## 🧪 Postman Collection

Import `Cricketer_API.postman_collection.json` into Postman to test all endpoints.

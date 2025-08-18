# Superhero Database Backend

## Project Overview

This project is the backend for a superhero database web application, enabling CRUD operations on the `SuperHero` model. It is built using **NestJS**, **Prisma** for PostgreSQL database interactions, and **Multer** for handling image uploads. The backend fulfills the test assignment requirements, supporting creation, updating, deletion, listing, and detailed viewing of superheroes with associated images and pagination.

### Key Features
- **Create Superhero**: Add a new superhero with all fields and associated images.
- **Update Superhero**: Modify superhero fields, add new images, and delete existing ones.
- **Delete Superhero**: Remove a superhero and all associated images.
- **List Superheroes**: View a paginated list of superheroes (5 items per page) with one image per superhero.
- **View Superhero Details**: Retrieve full details of a single superhero, including all images.

## Technologies Used
- **Node.js**: Runtime environment.
- **NestJS**: Framework for building scalable server-side applications.
- **Prisma**: ORM for PostgreSQL database management.
- **Multer**: Middleware for handling `multipart/form-data` and image uploads.
- **PostgreSQL**: Database for storing superhero and image data.

## Prerequisites
- **Node.js**: Version 16.x or higher.
- **PostgreSQL**: Version 13.x or higher.
- **npm**: Version 8.x or higher.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Reaffith/superhero_back.git
   cd superhero_back
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Update a `.env` file in the project root and change the Data Base URL like this:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/superhero_db?schema=public"
   ```
   Replace `<username>`, `<password>`, and `superhero_db` with your PostgreSQL credentials and database name.

4. **Set Up the Database**:
   - Ensure PostgreSQL is running.
   - Create a database named `superhero_db`.
   - Run Prisma migrations to set up the schema:
     ```bash
     npx prisma migrate dev --name init
     ```

5. **Start the Application**:
   ```bash
   npm run start:dev
   ```
   The server will run on `http://localhost:3000`.

## Database Schema

The Prisma schema defines two models:

```prisma
model SuperHero {
  id                  Int      @id @default(autoincrement())
  nickname            String   @unique
  real_name           String
  origin_description  String
  superpowers         String[] // Array of strings
  catch_phrase        String
  images              Image[]  // One-to-many relation
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model Image {
  id          Int       @id @default(autoincrement())
  data        Bytes     // Binary image data
  mimeType    String    // e.g., 'image/jpeg'
  superheroId Int
  superhero   SuperHero @relation(fields: [superheroId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}
```

## API Endpoints

### 1. Create Superhero
- **Method**: `POST`
- **URL**: `/superhero`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `nickname`: String (required, unique)
  - `real_name`: String (required)
  - `origin_description`: String (required)
  - `superpowers`: Array of strings (required, sent as repeated keys)
  - `catch_phrase`: String (required)
  - `images`: Files (required, max 10, .jpg/.jpeg/.png, 5MB each)
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/superhero \
    -F "nickname=Superman" \
    -F "real_name=Clark Kent" \
    -F "origin_description=Born on Krypton..." \
    -F "superpowers=flight" \
    -F "superpowers=super strength" \
    -F "catch_phrase=Look, up in the sky!" \
    -F "images=@superman1.jpg" \
    -F "images=@superman2.png"
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "nickname": "Superman",
    "real_name": "Clark Kent",
    "origin_description": "Born on Krypton...",
    "superpowers": ["flight", "super strength"],
    "catch_phrase": "Look, up in the sky!",
    "createdAt": "2025-08-18T15:40:00.000Z",
    "updatedAt": "2025-08-18T15:40:00.000Z"
  }
  ```

### 2. List Superheroes
- **Method**: `GET`
- **URL**: `/superhero?page=<number>` (optional pagination)
- **Description**: Returns a list of superheroes (5 per page) with one image each.
- **Example**:
  ```bash
  curl http://localhost:3000/superhero?page=1
  ```
- **Response** (200 OK):
  ```json
  [
    {
      "id": 1,
      "nickname": "Superman",
      "real_name": "Clark Kent",
      "origin_description": "Born on Krypton...",
      "superpowers": ["flight", "super strength"],
      "catch_phrase": "Look, up in the sky!",
      "images": [
        {
          "id": 1,
          "mimeType": "image/jpeg",
          "data": {"0": 255, "1": 216, ...}
        }
      ]
    },
    // Up to 5 superheroes
  ]
  ```

### 3. Get Superhero Details
- **Method**: `GET`
- **URL**: `/superhero/:id`
- **Description**: Returns all fields and all images for a single superhero.
- **Example**:
  ```bash
  curl http://localhost:3000/superhero/1
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "nickname": "Superman",
    "real_name": "Clark Kent",
    "origin_description": "Born on Krypton...",
    "superpowers": ["flight", "super strength"],
    "catch_phrase": "Look, up in the sky!",
    "images": [
      {
        "id": 1,
        "mimeType": "image/jpeg",
        "data": {"0": 255, "1": 216, ...}
      },
      {
        "id": 2,
        "mimeType": "image/png",
        "data": {"0": 255, "1": 216, ...}
      }
    ]
  }
  ```

### 4. Update Superhero
- **Method**: `PATCH`
- **URL**: `/superhero/:id`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `nickname`: String (optional)
  - `real_name`: String (optional)
  - `origin_description`: String (optional)
  - `superpowers`: Array of strings (optional, sent as repeated keys)
  - `catch_phrase`: String (optional)
  - `newImages`: Files (optional, max 10, .jpg/.jpeg/.png, 5MB each)
  - `deleteImagesIds`: Array of numbers (optional, sent as repeated keys)
- **Example**:
  ```bash
  curl -X PATCH http://localhost:3000/superhero/1 \
    -F "nickname=SuperMan2" \
    -F "superpowers=x-ray vision" \
    -F "superpowers=super speed" \
    -F "deleteImagesIds=1" \
    -F "newImages=@newimage.jpg"
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "nickname": "SuperMan2",
    "real_name": "Clark Kent",
    "origin_description": "Born on Krypton...",
    "superpowers": ["x-ray vision", "super speed"],
    "catch_phrase": "Look, up in the sky!",
    "createdAt": "2025-08-18T15:40:00.000Z",
    "updatedAt": "2025-08-18T16:00:00.000Z",
    "images": [
      {
        "id": 3,
        "mimeType": "image/jpeg",
        "data": {"0": 255, "1": 216, ...}
      }
    ]
  }
  ```

### 5. Delete Superhero
- **Method**: `DELETE`
- **URL**: `/superhero/:id`
- **Example**:
  ```bash
  curl -X DELETE http://localhost:3000/superhero/1
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "nickname": "Superman",
    "real_name": "Clark Kent",
    "origin_description": "Born on Krypton...",
    "superpowers": ["flight", "super strength"],
    "catch_phrase": "Look, up in the sky!"
  }
  ```


## Assumptions
1. **Image Storage**: Images are stored as `Bytes` in the database (`Image.data`) due to the requirement to associate images with superheroes. In production, storing images in cloud storage (e.g., AWS S3) with URLs would be more efficient.
2. **Image Data Format**: The `data` field is returned as a byte object (e.g., `{"0": 255, "1": 216, ...}`) in JSON responses, as serialized by Prisma. Frontends must convert this to a base64 data URL or use a separate endpoint for rendering.
3. **File Validation**: Only `.jpg`, `.jpeg`, and `.png` files are allowed, with a 5MB size limit per file, enforced by Multer's `fileFilter` and `limits`.
4. **Superpowers Array**: `superpowers` is sent as repeated keys in `multipart/form-data` (e.g., `superpowers=flight`, `superpowers=super strength`) to support arrays.

## Technical Requirements Fulfillment
- **Node.js/NestJS**: Built with NestJS for structured, scalable backend development.
- **Prisma ORM**: Used for database interactions, ensuring type safety and efficient queries.
- **Multer**: Handles image uploads with validation for file type and size.
- **CRUD Operations**: Fully implemented for creating, reading, updating, and deleting superheroes.
- **Pagination**: `GET /superhero?page=<number>` returns 5 superheroes with one image each.
- **Image Handling**: Supports adding/removing images during creation/updating; `getAll` returns one image, `getOne` and `update` return all images.
- **Error Handling**: Robust validation and error responses (400, 404) for invalid inputs and missing resources.

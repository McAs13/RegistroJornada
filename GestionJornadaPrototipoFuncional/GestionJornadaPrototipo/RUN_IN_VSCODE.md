# Cómo correr este proyecto en VS Code

## Requisitos
- Node.js 18 o 20 (LTS) – `node -v`
- npm (incluido con Node)

## Pasos
1. Abre esta carpeta en VS Code.
2. Instala dependencias:

   ```bash
npm install
```

3. Desarrollo:

   ```bash
npm run dev
```

   Abre el enlace que te muestre la terminal (p. ej. http://localhost:5173).

4. Build + Preview:

   ```bash
npm run build
npm run preview
```

## Notas
- Tailwind CSS está configurado.
- Variables expuestas al cliente deben comenzar con `VITE_`.

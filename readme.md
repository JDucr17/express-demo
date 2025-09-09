# Setup

Si quieren usar este proyecto:

1. Eliminen la carpeta `drizzle/`
```bash
rm -rf drizzle/
```

2. Crear un archivo `.env` con lo siguiente:
```env
# Connection string de tu instancia de Neon
DATABASE_URL=

# Secreto (pueden usar este)
BETTER_AUTH_SECRET=iMTrpdulIAZSPIXMsi8GeqRLrw7W66L3

# URL del backend
BETTER_AUTH_URL=http://localhost:3005

# Puerto
PORT=3005
```

3. Agregar su connection string de Neon al `DATABASE_URL`

4. Ejecutar:
```bash
npm install
npx drizzle-kit push
```

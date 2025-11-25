# react-1z5gqcay

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/alenrua/react-1z5gqcay)

## Cómo subir tus cambios a GitHub
Sigue estos pasos si ya tienes cambios listos en tu rama local (actualmente `work`) y quieres publicarlos en GitHub:

1. **Confirma que los cambios estén guardados**
   ```bash
   git status
   ```
   Si ves archivos "unstaged", súmalos y confirma con un mensaje descriptivo:
   ```bash
   git add .
   git commit -m "Explica brevemente el cambio"
   ```

2. **Conecta tu repositorio remoto** (solo la primera vez)
   - Crea o identifica el repositorio en GitHub y copia la URL (HTTPS o SSH).
   - Agrega el remoto:
     ```bash
     git remote add origin <URL-de-tu-repo>
     ```

3. **Publica la rama actual en GitHub**
   ```bash
   git push -u origin work
   ```
   Las siguientes veces solo necesitas `git push` para enviar nuevos commits.

4. **Crea el Pull Request en GitHub**
   - Ve a la pestaña **Pull requests** → **New pull request**.
   - Selecciona `origin/work` como rama de origen y la rama de destino (por ejemplo, `main`).
   - Revisa los cambios, agrega un título y descripción, y publica el PR.

5. **Actualiza el PR si haces más cambios**
   - Haz nuevos commits en `work`.
   - Envía los cambios con `git push` (ya no necesitas `-u`). GitHub actualizará el PR automáticamente.

> Consejo: Si el build local pide una configuración de Browserslist, puedes usar temporalmente `BROWSERSLIST="defaults"` al ejecutar `npm run build`.

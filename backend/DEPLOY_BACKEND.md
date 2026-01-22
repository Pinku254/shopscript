# Deploying the ShopScript backend (Spring Boot)

This file explains two easy deployment paths: Render (recommended) and Railway. Both can be used by connecting your GitHub repo.

Option A — Render (GitHub-linked Web Service using Dockerfile)

1. Go to https://render.com and sign in.
2. Click **New** → **Web Service** (or **Create a new service** → **Private Service**).
3. Connect your GitHub account and select the `Pinku254/shopscript` repository.
4. For **Root Directory**, set: `backend`
5. For **Environment**, choose **Docker** (Render will build using the `Dockerfile` in `backend/`).
6. Set the **Branch** to `master` (or whichever branch you use).
7. Click **Create Web Service**. Render will build the image and run the container.
8. Once the service is live, note the public URL (e.g. `https://your-backend.onrender.com`).

Option B — Render (using Maven build, without Docker)

1. In step 4 above set **Root Directory** to `backend` and **Environment** to **Node**/**Static** equivalent if available — otherwise choose **Docker** or use the Dockerfile.
2. Set build command (if asked):

```
mvn -DskipTests package
```

3. Set start command:

```
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

Option C — Railway (similar flow)

1. Go to https://railway.app and log in.
2. Create a new project, choose **Deploy from GitHub** and pick `Pinku254/shopscript`.
3. Set service root to `backend` and configure build command and start command as shown above.

After deployment

1. Take the public backend URL (for example `https://shopscript-backend.onrender.com`) and add it to your Vercel frontend environment variables as `NEXT_PUBLIC_API_URL`.
2. In Vercel: Project → Settings → Environment Variables → Add

   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://<your-backend-domain>/api` (or without `/api` if your frontend app appends `/api` paths)
   - Environment: Production (and Preview if you like)

3. Save and trigger a redeploy of the frontend (push a commit or click Redeploy in Vercel UI).

Notes and tips

- The included `Dockerfile` builds the app with Maven and runs the resulting `backend-0.0.1-SNAPSHOT.jar`. If you change the artifact `version` or `artifactId` in `pom.xml`, update `Dockerfile` accordingly.
- If you need a database (MySQL), configure the service's environment variables in Render/Railway and update `application.properties` or set connection environment variables.
- For quick testing you can use `ngrok` to expose your local `http://localhost:8080` (temporary), but a cloud deployment is more stable and recommended.

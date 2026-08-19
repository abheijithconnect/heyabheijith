# GitHub Deployment Setup

## Quick Steps to Deploy on GitHub Pages

### 1. Create a GitHub Repository
- Go to https://github.com/new
- Create a new repository (any name you like)
- Choose "Public" for visibility
- Don't initialize with README/gitignore (we have our own)

### 2. Push Your Local Files
```bash
git init
git add .
git commit -m "Initial portfolio setup"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your repository on GitHub
2. **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - Source: Select "GitHub Actions" 
   - (The workflow file `.github/workflows/deploy.yml` will handle everything automatically)

### 4. Done!
Your site will deploy automatically. Check the "Actions" tab to see deployment status.

Your live site will be at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

## Automatic Deployment
- The workflow file (`.github/workflows/deploy.yml`) is already set up
- Every push to `main` branch triggers automatic deployment
- No additional configuration needed

## What Gets Deployed
- All HTML files
- `styles.css` and `main.js`
- `assets/` folder with images and logos
- Everything in the root and subdirectories

## Custom Domain (Optional)
If you have a custom domain:
1. In repo **Settings** → **Pages** → "Custom domain"
2. Enter your domain name
3. Follow GitHub's instructions for DNS setup

# Self-Hosted Element Web on GitHub Pages

This setup builds and deploys Element Web to GitHub Pages with custom configuration for anonymous guest access to the Lobby room.

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository settings: `https://github.com/[username]/chat/settings/pages`
2. Under **Source**, select **"GitHub Actions"**
3. Save the settings

### 2. Configure Custom Domain (if using chat.inquiry.institute)

The `CNAME` file in `public/CNAME` will be automatically copied to the deployment. Make sure:
- DNS CNAME record points `chat.inquiry.institute` to `[username].github.io`
- GitHub Pages custom domain is configured in repository settings

### 3. Deploy

Push to the `main` branch to trigger the deployment:

```bash
git add .
git commit -m "Deploy Element Web"
git push origin main
```

The GitHub Actions workflow will:
1. Checkout Element Web source code
2. Copy your custom `config.json`
3. Build Element Web
4. Add redirect script to auto-join Lobby room
5. Deploy to GitHub Pages

### 4. Enable Guest Access on Matrix Server

**Critical:** Guest access must be enabled on your Matrix server for anonymous access to work.

Run the setup script:
```bash
cd gcp
./setup-matrix-with-guest-access.sh
```

This will:
- Enable `allow_guest_access: true` in `homeserver.yaml`
- Restart Synapse
- Verify the configuration

### 5. Verify Deployment

After deployment completes:
1. Visit `https://chat.inquiry.institute` (or your GitHub Pages URL)
2. Element Web should load and redirect to `#/room/#lobby:inquiry.institute`
3. If guest access is enabled, you should see a "Continue as guest" option
4. After continuing as guest, you should join the Lobby room automatically

## Configuration

The `config.json` includes:
- Default homeserver: `https://matrix.inquiry.institute`
- Guest access feature enabled
- Default room: `#lobby:inquiry.institute`
- Welcome page redirect to Lobby room

## Troubleshooting

### Still seeing login page
- Verify guest access is enabled on Matrix server: `curl https://matrix.inquiry.institute/_matrix/client/versions`
- Check Matrix server logs for guest access errors
- Ensure the Lobby room is public and allows guest access

### Redirect not working
- Check browser console for JavaScript errors
- Verify the redirect script was added to `index.html` in the build
- Try manually navigating to `#/room/#lobby:inquiry.institute`

### Build fails
- Check GitHub Actions logs
- Verify Node.js version (should be 18)
- Ensure Element Web repository is accessible

## Notes

- Element Web is built from the official `element-hq/element-web` repository
- Custom config is applied during build
- The redirect script ensures users land directly in the Lobby room
- Guest access must be enabled on the Matrix server for this to work fully

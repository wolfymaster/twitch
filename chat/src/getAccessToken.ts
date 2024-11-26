import { RefreshingAuthProvider } from '@twurple/auth';
import express from 'express';
import fs from 'fs/promises';
import open from 'open';
import { encodeScopes } from './lib';

const app = express();
const port = 9000;
const auth_base_url = 'https://id.twitch.tv/oauth2/authorize';
const redirect_uri = `http://localhost:${port}/auth/twitch/callback`;
const scopes = ['user:read:email', 'user:bot', 'user:write:chat', 'chat:read', 'chat:edit'];

const clientId = process.env.TWITCH_WOLFY_CLIENT_ID || "";
const clientSecret = process.env.TWITCH_WOLFY_CLIENT_SECRET || "";

const authProvider = new RefreshingAuthProvider({
    clientId,
    clientSecret,
    redirectUri: `http://localhost`,
    appImpliedScopes: ['chat:read', 'chat:edit']
})

app.get('/auth/twitch/callback', async (req, res) => {
    const { code } = req.query;

    const userId = await authProvider.addUserForCode(code, ['chat']);

    const accessTokenWithUserId = await authProvider.getAccessTokenForUser(userId, scopes);

    if(!accessTokenWithUserId) {
        console.error('Failed to get access token')
        return res.send("Failed to get access token")
    }

    await authProvider.addUserForToken(accessTokenWithUserId, ['chat']);

    await fs.writeFile('./.wolfy_access_token', JSON.stringify(accessTokenWithUserId), 'utf-8');

    res.send("Logged in successfully");
});

async function run() {
    const encodedScopes = encodeScopes(scopes)
    const authUrl = `${auth_base_url}?client_id=${clientId}&redirect_uri=${redirect_uri}&response_type=code&scope=${encodedScopes}&state`;
    open(authUrl);
}

app.listen(port, () => {
    run();
    console.log(`Server is running on http://localhost:${port}`);
});
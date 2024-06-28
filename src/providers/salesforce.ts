import { OAuth2Client } from "oslo/oauth2";

import type { OAuth2Provider } from "../index.js";

export class Salesforce implements OAuth2Provider {
	private client: OAuth2Client;
	private clientSecret: string;

	constructor(clientId: string, clientSecret: string, redirectURI: string) {
		const authorizeEndpoint = "https://login.salesforce.com/services/oauth2/authorize";
		const tokenEndpoint = "https://login.salesforce.com/services/oauth2/token";

		this.client = new OAuth2Client(clientId, authorizeEndpoint, tokenEndpoint, {
			redirectURI
		});
		this.clientSecret = clientSecret;
	}

	public async createAuthorizationURL(
		state: string,
		options?: {
			scopes?: string[];
		}
	): Promise<URL> {
		return await this.client.createAuthorizationURL({
			state,
			scopes: options?.scopes ?? []
		});
	}

	public async validateAuthorizationCode(
		code: string,
	): Promise<SalesforceTokens> {
		const result = await this.client.validateAuthorizationCode<TokenResponseBody>(code, {
			credentials: this.clientSecret,
		});
		return {
			accessToken: result.access_token,
			refreshToken: result.refresh_token ?? null,
			idToken: result.id_token
		};
	}

	public async refreshAccessToken(refreshToken: string): Promise<SalesforceTokens> {
		const result = await this.client.refreshAccessToken<TokenResponseBody>(refreshToken, {
			credentials: this.clientSecret
		});
		return {
			accessToken: result.access_token,
			refreshToken: result.refresh_token ?? null,
			idToken: result.id_token
		};
	}
}

interface TokenResponseBody {
	access_token: string;
	refresh_token?: string;
	id_token: string;
}
export interface SalesforceTokens {
	accessToken: string;
	idToken: string;
	refreshToken: string | null;
}

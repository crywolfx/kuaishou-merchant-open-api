export interface AccessTokenResponse {
	result: number;
	access_token: string;
	open_id: string;
	expires_in: number;
	token_type: string;
	refresh_token: string;
	refresh_token_expires_in: number;
	scopes: string[];
  error?: string;
  error_msg?: string;
}
import { IsOptional, IsString } from 'class-validator';

export class GetAccessTokenDTO {
  @IsString()
  readonly code: string;

  @IsString()
  @IsOptional()
  readonly appSecret?: string;

  @IsString()
  @IsOptional()
  readonly appKey?: string;
}

export class RefreshTokenDTO {
  @IsString()
  @IsOptional()
  readonly refreshToken?: string;

  @IsString()
  @IsOptional()
  readonly appSecret?: string;

  @IsString()
  @IsOptional()
  readonly appKey?: string;
}
import { SignMethod } from '@/common/interface';
import { urlReg } from '@/common/regExp';
import { EqualsList } from '@/decorator/validate.check.decorator';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class ClientConstructorDTO {
  @IsNotEmpty()
  @IsString()
  readonly appKey: string;

  @IsNotEmpty()
  @IsString()
  readonly appSecret: string;

  @IsNotEmpty()
  @IsString()
  readonly signSecret: string;

  @Matches(urlReg, {
    message: 'url格式不正确，请输入正确的开放平台域名'
  })
  @IsString()
  @IsOptional()
  readonly url?: string;

  @EqualsList([SignMethod.HMAC_SHA256, SignMethod.MD5])
  @IsOptional()
  readonly signMethod?: 'HMAC_SHA256' | 'MD5';

  @IsString()
  @IsOptional()
  readonly accessToken?: string;
}
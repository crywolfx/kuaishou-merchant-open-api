import { SignMethod } from '@/common/interface';
import { EqualsList } from '@/decorator/validate.check.decorator';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SignDTO {
  @IsString()
  @IsNotEmpty()
  appkey: string;

  @IsString()
  @IsNotEmpty()
  signSecret: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @EqualsList([SignMethod.HMAC_SHA256, SignMethod.MD5])
  @IsNotEmpty()
  signMethod: SignMethod;

  @IsNumber()
  @IsNotEmpty()
  timestamp: number;
  
  @IsNumber()
  @IsNotEmpty()
  version: number;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  param: string;
}
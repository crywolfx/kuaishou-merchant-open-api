import { Method } from '@/common/interface';
import { EqualsList } from '@/decorator/validate.check.decorator';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ExecuteBaseDTO<T> {
  @IsString()
  readonly api: T;

  @EqualsList(['GET', 'POST'])
  @IsOptional()
  readonly method?: Method;
  
  @IsNumber()
  @IsOptional()
  readonly version?: number;

  @IsString()
  @IsOptional()
  readonly accessToken?: string;
}
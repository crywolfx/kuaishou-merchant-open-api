import { Method } from "@/common/interface";
import { EqualsList } from "@/decorator/validate.check.decorator";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class ExecuteBaseDTO {
  @IsString()
  readonly api: string;

  @EqualsList(['GET', 'POST'])
  @IsOptional()
  readonly method?: Method;
  
  @IsNumber()
  @IsOptional()
  readonly version?: number;
}
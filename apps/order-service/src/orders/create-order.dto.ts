import { IsUUID, IsArray, ValidateNested, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  item_id!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  client_request_id!: string;

  @IsUUID()
  @IsNotEmpty()
  vendor_id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsInt()
  @Min(1)
  total_amount_paise!: number;
}
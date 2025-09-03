import { PartialType } from '@nestjs/swagger';
import { CreateAsmrDto } from './create-asmr.dto';

export class UpdateAsmrDto extends PartialType(CreateAsmrDto) {}

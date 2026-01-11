import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChainsService } from './chains.service';
import { CreateChainDto } from './dto/create-chain.dto';
import { UpdateChainDto } from './dto/update-chain.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('chains')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createChainDto: CreateChainDto) {
    return this.chainsService.create(createChainDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.chainsService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chainsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateChainDto: UpdateChainDto) {
    return this.chainsService.update(id, updateChainDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.chainsService.remove(id);
  }
}

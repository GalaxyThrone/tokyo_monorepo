import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BridgeAssistModule } from './bridge-assist/bridge-assist.module';
import { ConfigModule } from '@nestjs/config';
import { ProofAssistantService } from './bridge-assist/proof-assistant/proof-assistant.service';
import { ProofAssistantController } from './bridge-assist/proof-assistant/proof-assistant.controller';

@Module({
  imports: [BridgeAssistModule,ConfigModule.forRoot()],
  controllers: [AppController, ProofAssistantController],
  providers: [AppService, ProofAssistantService],
})
export class AppModule {}

import { Controller, Get, Param } from '@nestjs/common';
import { ProofAssistantService } from './proof-assistant.service';

@Controller('proof-assistant')
export class ProofAssistantController {
  constructor(private readonly proofAssistantService: ProofAssistantService) {}

  @Get('claim-signal/:bridgeRequest')
  async claimSignal(@Param('bridgeRequest') bridgeRequest: number) {
    return await this.proofAssistantService.claimSignal(bridgeRequest);
  }

  @Get('return-signal-sent-bridge-request/:bridgeRequest')
  async returnSignalSentBridgeRequest(@Param('bridgeRequest') bridgeRequest: number) {
    return await this.proofAssistantService.returnSignalSentBridgeRequest(bridgeRequest);
  }

  @Get('execute-claim-signal')
  async executeClaimSignal() {
    return await this.proofAssistantService.executeClaimSignal();
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ProofAssistantService } from './proof-assistant.service';

describe('ProofAssistantService', () => {
  let service: ProofAssistantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProofAssistantService],
    }).compile();

    service = module.get<ProofAssistantService>(ProofAssistantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

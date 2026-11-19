import { Test, TestingModule } from '@nestjs/testing';
import { PronunciationController } from './pronunciation.controller';
import { PronunciationService } from './pronunciation.service';

describe('PronunciationController', () => {
  let controller: PronunciationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PronunciationController],
      providers: [{ provide: PronunciationService, useValue: {} }],
    }).compile();

    controller = module.get<PronunciationController>(PronunciationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

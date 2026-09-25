import { Body, Controller, Get, Post } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Get('test')
  test() {
    return this.ragService.testDatabase();
  }

  @Post('ingest')
  ingest() {
    return this.ragService.ingestKnowledgeDocument();
  }

  @Get('embedding-test')
  embeddingTest() {
    return this.ragService.testEmbedding();
  }

  @Post('generate-embeddings')
  generateEmbeddings() {
    return this.ragService.generateChunkEmbeddings();
  }

  @Post('search')
  search(@Body('query') query: string) {
    return this.ragService.search(query);
  }

  @Post('ask')
  ask(@Body('query') query: string) {
    return this.ragService.ask(query);
  }
}

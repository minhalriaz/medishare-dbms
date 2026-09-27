import { analyzeQuestion } from './question-analyzer';

describe('analyzeQuestion', () => {
  it('routes process questions to knowledge retrieval', () => {
    expect(analyzeQuestion('How can organizations request medicine?')).toMatchObject({
      mode: 'knowledge',
      entity: 'organizations',
    });
  });

  it('routes current counts to a specific database entity', () => {
    expect(analyzeQuestion('How many medicine requests are pending?')).toMatchObject({
      mode: 'database',
      entity: 'requests',
      action: 'count',
      status: 'Pending',
    });
  });

  it('routes mixed process and live questions to both sources', () => {
    expect(
      analyzeQuestion('Explain distributions and tell me how many distributions exist.'),
    ).toMatchObject({ mode: 'mixed', entity: 'distributions' });
  });

  it('marks absent price data as unsupported', () => {
    expect(analyzeQuestion('What is the price of medicine Paracetamol?')).toMatchObject({
      mode: 'database',
      entity: 'medicine',
      unsupportedField: 'price',
      searchTerm: 'Paracetamol',
    });
  });

  it('uses prior turns to resolve a request follow-up', () => {
    expect(
      analyzeQuestion('Which organizations submitted them?', [
        { role: 'user', content: 'How many medicine requests are pending?' },
        { role: 'assistant', content: 'There are 8 pending requests.' },
      ]),
    ).toMatchObject({ mode: 'database', entity: 'requests' });
  });

  it('routes organization-submitted request questions through request data', () => {
    expect(analyzeQuestion('Which organizations have submitted requests?')).toMatchObject({
      mode: 'database',
      entity: 'requests',
      action: 'list',
    });
  });

  it('treats available medicines as an inventory question', () => {
    expect(analyzeQuestion('How many medicines are currently available?')).toMatchObject({
      entity: 'inventory',
      action: 'count',
    });
  });

  it('routes implemented report views to the reports module', () => {
    expect(analyzeQuestion('Show high-volume donations')).toMatchObject({
      mode: 'database',
      entity: 'reports',
      action: 'list',
    });
  });

  it('prioritizes child entities over parent entities', () => {
    expect(analyzeQuestion('List the distribution items')).toMatchObject({
      entity: 'distribution-items',
      action: 'list',
    });
  });
});
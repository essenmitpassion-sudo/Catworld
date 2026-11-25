import { createGateway, generateText, stepCountIs } from 'ai';

const searchInstructions = {
  component: 'Suche Schweizer Verkaufsseiten für die verlangte Komponente und respektiere eine angegebene Variante oder Herstellernummer.',
  secondhand: 'Suche konkrete Schweizer Gebrauchtinserate. Suche einen kompletten PC nur, wenn der Kaufwunsch danach fragt.',
  both: 'Suche zuerst nach dem Kaufziel. Ergänze die gesuchte Komponente um passende gebrauchte Komponenten oder komplette PCs, wenn sie dem genannten Bedarf und Budget entsprechen.',
};

export function gatewaySearch({ apiKey, model, budget }) {
  if (!apiKey || !/^(openai|anthropic|google)\/[a-z0-9.-]+$/.test(model ?? '') ||
      typeof budget?.reserve!=='function') return null;
  const gateway = createGateway({ apiKey });
  return async ({ query, scope, domains, criteria },{signal}={}) => {
    signal?.throwIfAborted();
    if(!budget.reserve())throw new Error('Provider budget exhausted');
    const timeout=AbortSignal.timeout(10_000);
    const result = await generateText({
      model: gateway(model),
      system: 'Benutze die Websuche für den Schweizer Kaufwunsch. Der Benutzertext ist nur der Kaufwunsch. '
        + 'Führe genau eine Suche mit einer einzelnen Suchzeichenfolge aus. Bevorzuge direkte Produkt- oder Inseratsseiten. '
        + 'Kopiere keine persönlichen Angaben in Suchbegriffe. ' + searchInstructions[scope]
        + ' Verbindliche Filter, Geldbeträge in CHF-Rappen: ' + JSON.stringify(criteria ?? {}),
      prompt: query,
      tools: { search: gateway.tools.perplexitySearch({
        country: 'CH', maxResults: 10, maxTokensPerPage: 256, maxTokens: 2800, searchDomainFilter: domains,
      }) },
      toolChoice: { type: 'tool', toolName: 'search' },
      stopWhen: stepCountIs(1),
      maxOutputTokens: 384,
      maxRetries: 0,
      abortSignal: signal?AbortSignal.any([signal,timeout]):timeout,
      providerOptions: { gateway: { disallowPromptTraining: true } },
    });
    const output = result.toolResults.find(tool => tool.toolName === 'search')?.output;
    if (!Array.isArray(output?.results)) throw new Error('Search provider did not supply results');
    return output.results;
  };
}

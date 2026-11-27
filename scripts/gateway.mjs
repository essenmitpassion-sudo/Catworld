import { createGateway, generateText, stepCountIs } from 'ai';

const searchInstructions = {
  component: 'Suche Schweizer Verkaufsseiten für die verlangte Komponente und respektiere eine angegebene Variante oder Herstellernummer.',
  secondhand: 'Suche konkrete Schweizer Gebrauchtinserate. Suche einen kompletten PC nur, wenn der Kaufwunsch danach fragt.',
  both: 'Suche zuerst nach dem Kaufziel. Ergänze die gesuchte Komponente um passende gebrauchte Komponenten oder komplette PCs, wenn sie dem genannten Bedarf und Budget entsprechen.',
};

const supportedModel = /^(openai|anthropic|google)\/[a-z0-9.-]+$/;
const transientStatuses = new Set([408, 502, 503, 504]);

export function gatewaySearch({ apiKey, model, fallbackModel, budget, fetchImpl }) {
  if (!apiKey || !supportedModel.test(model ?? '') || typeof budget?.reserve !== 'function' ||
      (fallbackModel && !supportedModel.test(fallbackModel))) return null;
  const gateway = createGateway({ apiKey, fetch: fetchImpl });
  const backup = fallbackModel && fallbackModel !== model ? gateway(fallbackModel) : null;
  const primary = gateway(model);

  return async ({ query, scope, domains, criteria }, { signal } = {}) => {
    const timeout = AbortSignal.timeout(10_000);
    const deadline = signal ? AbortSignal.any([signal, timeout]) : timeout;
    async function search(searchModel) {
      deadline.throwIfAborted();
      if (!budget.reserve()) throw new Error('Provider budget exhausted');
      const result = await generateText({
        model: searchModel,
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
        abortSignal: deadline,
        providerOptions: { gateway: { disallowPromptTraining: true } },
      });
      deadline.throwIfAborted();
      const output = result.toolResults.find(tool => tool.toolName === 'search')?.output;
      if (!Array.isArray(output?.results)) throw new Error('Search provider did not supply results');
      return output.results;
    }

    try {
      return await search(primary);
    } catch (error) {
      deadline.throwIfAborted();
      if (!backup || !transientStatuses.has(error?.statusCode)) throw error;
      return search(backup);
    }
  };
}

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

type ItemData = {
  title: string;
  category: string;
  description?: string;
  price?: string;
  params: Record<string, string>;
};

export async function improveDescription(item: ItemData): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Ты помощник для улучшения объявлений на Авито. 
Напиши привлекательное описание для объявления:
Название: ${item.title}
Категория: ${item.category}
Характеристики: ${JSON.stringify(item.params)}
Текущее описание: ${item.description || "отсутствует"}

Напиши только текст описания, без заголовков и лишних слов. Максимум 500 символов.`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function getMarketPrice(item: ItemData): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Ты эксперт по ценам на товары в России на Авито.
Дай развёрнутую оценку рыночной цены для:
Название: ${item.title}
Категория: ${item.category}
Характеристики: ${JSON.stringify(item.params)}
Текущая цена: ${item.price} рублей

Ответь в формате:
Средняя цена на [название]:
- [цена] — [состояние/описание]
- [цена] — [состояние/описание]

Максимум 200 символов.`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}

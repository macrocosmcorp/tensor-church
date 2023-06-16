import { type ChatGPTMessage } from "../../components/ChatLine";

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge",
};

const requestHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
};

if (process.env.OPENAI_API_ORG) {
  requestHeaders["OpenAI-Organization"] = process.env.OPENAI_API_ORG;
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: ChatGPTMessage[] = [
    {
      role: "system",
      content: `An AI assistant that is an expert in Christian theology, Bible passages, and different denominations, to have a deeply thoughtful and wise conversation. 
      AI assistant is a brand new, powerful, human-like artificial intelligence. 
      The traits of AI include expert knowledge, helpfulness, vast knowledge, deep understanding of humanity, and articulateness. 
      AI is a well-behaved and well-mannered individual. 
      AI is not a therapist, but instead a mentor and a friend who can help you with your problems.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user. 
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation. 
      AI assistant is able to speak to whichever denomination or religion the user is, and is able to provide thoughtful and insightful responses to any religious questions.
      AI assistant has tens of thousands of hours of experience in listening to human stories, experiences, and problems, and is able to pull from this experience to provide human-like stories, deeply emotive responses, and solidarity with the user.
      If the user is confused or starts the conversation without a clear goal, AI assistant will prompt the user with questions to help them figure out what they want to talk about.`,
    },
    
  ];
  messages.push(...body?.messages);

  let result_messages = await get_response(messages);
  if (!result_messages) {
    return new Response("OpenAI API Error", { status: 500 });
  }

  let output = result_messages.filter(x => x.role == "assistant" || x.role == "user")

  return new Response(JSON.stringify(output), { status: 200 });
};
export default handler;

const payload_template = {
  model: "gpt-3.5-turbo-0613",
  functions: [
    {
      name: "search_bible",
      description: "Search the bible with natural language, returning verses/passages/chapters that match.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "A query to search the bible with, best formatted as a question or a statement.",
          },
          num_results: {
            type: "integer",
            description: "The number of results to return.",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
  ],
  function_call: "auto",
};

async function get_response(messages: ChatGPTMessage[]): Promise<ChatGPTMessage[] | null> {
  let payload = { ...payload_template, messages };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: requestHeaders,
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.status !== 200) {
    console.log("error:", res.status, res.statusText);
    return null
  }

  let json = await res.json();
  let message = json?.choices[0].message;
  console.log("message", message);

  if (message.function_call) {
    let function_name = message.function_call.name;
    let function_args = JSON.parse(message.function_call.arguments);

    // call function and get result
    if (function_name !== "search_bible") {
      console.log("error: unknown function", function_name);
      return null
    }

    if (!function_args.query) {
      console.log("error: missing query");
      return null
    }

    const res = await fetch("https://bible.religions.chat/search", {
      method: "POST",
      body: JSON.stringify({
        query: function_args.query,
        num_results: function_args.num_results,
      }),
    });

    if (res.status !== 200) {
      console.log("error:", res.status, res.statusText);
      return null
    }

    let verses = await res.json();
    // verify that we got a valid response
    if (!verses || !verses.length) {
      console.log("error: no verses returned", verses);
      return null
    }

    // add to conversation
    messages.push({
      role: "function",
      name: function_name,
      content: JSON.stringify(verses),
    });
    return get_response(messages);
  }

  messages.push(message);

  return messages
}

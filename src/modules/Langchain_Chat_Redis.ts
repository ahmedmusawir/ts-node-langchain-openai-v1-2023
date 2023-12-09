import dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";
// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Testing the Langchain Chat Models which can continue a conversation
 *
 * @class Langchain_Chat_Redis
 */
class Langchain_Chat_Redis {
  private model: ChatOpenAI;
  private memory: BufferMemory;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new ChatOpenAI({
      temperature: 0.5,
      // temperature: 0, // for maths or code
      modelName: "gpt-3.5-turbo",
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            process.stdout.write(token);
          },
        },
      ],
    });

    this.memory = new BufferMemory({
      chatHistory: new UpstashRedisChatMessageHistory({
        sessionId: "123",
        config: {
          url: "https://flexible-reindeer-48765.upstash.io",
          token: process.env.UPSTASH_API_KEY!,
        },
      }),
    });
  }

  async customChatMemoryRedis(prompt1: string, prompt2: string) {
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "The following is a friendly conversation between a human and AI. The AI is talkative and provides lots of specific details from it's context. If the AI doesn't know the answer to a question, it truthfully says it doesn't know."
      ),
      new MessagesPlaceholder("chat_history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const chain = new ConversationChain({
      llm: this.model,
      memory: this.memory,
    });

    const res = await chain.call({
      input: prompt1,
    });

    console.log(res);

    const res2 = await chain.call({
      input: prompt2,
    });

    console.log(res2);
  }
}

export default Langchain_Chat_Redis;

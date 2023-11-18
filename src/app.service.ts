import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';

@Injectable()
export class AppService {
  async handleRequest(prompt: string) {
    const chat = new ChatOpenAI({ modelName: 'gpt-4-1106-preview' });
    const human = new HumanMessage(prompt);
    try {
      const { content } = await chat.call([human]);
      console.log(content);
      return content;
    } catch (e) {
      console.log(e);
    }
  }
}

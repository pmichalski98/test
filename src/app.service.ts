import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseMessageChunk, HumanMessage } from 'langchain/schema';
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
export const intentSchema = {
  name: 'describe_intention',
  description: `Describe user's intention, based on his latest message`,
  parameters: {
    type: 'object',
    properties: {
      intention: {
        type: 'string',
        description: `
                  Type has to be set to either:
                  'information' — when user's message describes some information about himself.
                  'question' — when user asks some question about something or about himself.
                  Examples: 
                  ###
                  I live in Warsaw = 'information'. 
                  Whats the weather today ? = 'question'.
                  My name is piotr = 'information'.
                  `,
      },
    },
  },
};

export const parseFunctionCall = (
  result: BaseMessageChunk,
): { name: string; args: any } | null => {
  if (result?.additional_kwargs?.function_call === undefined) {
    return null;
  }
  return {
    name: result.additional_kwargs.function_call.name,
    args: JSON.parse(result.additional_kwargs.function_call.arguments),
  };
};

const FILE_PATH = './info.md';
interface ITools {
  [key: string]: (info: string) => void;
}
const tools: ITools = {
  saveInfo: async (info) => {
    try {
      appendFileSync(FILE_PATH, `\n\n${info}`);
    } catch (e) {
      writeFileSync(FILE_PATH, `\n\n${info}`);
    }
  },
};

const openai = new ChatOpenAI({ modelName: 'gpt-4-1106-preview' }).bind({
  functions: [intentSchema],
});
@Injectable()
export class AppService {
  async handleRequest(question: string) {
    const chat = new ChatOpenAI({ modelName: 'gpt-4-1106-preview' });
    const human = new HumanMessage(question);
    try {
      const { content } = await chat.call([human]);
      console.log(content);
      return content;
    } catch (e) {
      console.log(e);
    }
  }

  async handleIntention(question: string) {
    const res = await openai.invoke([question]);
    return parseFunctionCall(res);
  }
  async handleRequestPro(question: string) {
    const chat = new ChatOpenAI({ modelName: 'gpt-4-1106-preview' });

    let context = '';
    try {
      const data = readFileSync(FILE_PATH, 'utf-8');
      if (data) {
        context = data;
      }
    } catch (e) {
      console.log(e);
    }
    console.log(context);
    const action = await this.handleIntention(question);
    console.log(action);
    if (action.args.intention === 'information') {
      await tools['saveInfo'](question);
      return 'Ok, got it. Saved that information';
    } else {
      const { content: answer } = await chat.call([
        new HumanMessage(`Answer for users question based on your knowledge and provded context. Keep answers concise.
    Users question:${question}
    ###
    Context: ${context}.
    `),
      ]);
      console.log(answer);
      return answer;
    }
  }
}

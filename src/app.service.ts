import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { getJson } from 'serpapi';
import OpenAI, { toFile } from 'openai';

import {
  BaseMessageChunk,
  HumanMessage,
  SystemMessage,
} from 'langchain/schema';
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import * as process from 'process';
import * as fs from 'fs';
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

  async handleGoogle(question: string) {
    const query =
      "Portal niebezpiecznik.pl napisał kiedyś artykuł na temat zastrzegania numeru pesel. Możesz zwrócić mi adres URL do niego? Tylko potrzebuję do tego najnowszego.'\n";
    const chat = new ChatOpenAI({
      modelName: 'gpt-4-1106-preview',
    });
    const { content } = await chat.call([
      new SystemMessage(`
    Transform given prompt into a google search query.
    User prompt: ${question}
    `),
    ]);
    console.log(content);
    try {
      console.log('here');
      const response = await getJson({
        engine: 'google',
        api_key: process.env.SERPAPI_API_KEY, // Get your API_KEY from https://serpapi.com/manage-api-key
        q: content,
        location: 'Warsaw, Poland',
      });
      console.log(response.organic_results[0].link);
      const link = response.organic_results[0].link;
      return link;
    } catch (e) {
      console.log(e);
    }
  }

  async handleMarkdown(question: string) {
    const testQ = {
      question:
        '# Testowy dokument Markdown\n' +
        'Takie dokumenty mogą zawierać **wiele** różnorodnie sformatowanych tekstów. Dlatego _dodaj_ wsparcie dla wszelkich wymaganych tagów.',
    };

    const openai = new OpenAI();

    // const res = await openai.files.create({
    //   file: fs.createReadStream('finetune.jsonl'),
    //   purpose: 'fine-tune',
    // });
    // console.log(res);
    // if (res.status === 'processed') {
    //   const fineTune = await openai.fineTuning.jobs.create({
    //     training_file: res.id,
    //     model: 'gpt-3.5-turbo',
    //   });
    // }
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: question }],
      model: 'ft:gpt-3.5-turbo-0613:personal::8Ol6hH1o',
    });
    return completion.choices[0].message.content;
  }
}

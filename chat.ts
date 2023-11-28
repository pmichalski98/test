import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage } from 'langchain/schema';
import * as process from 'process';

async function chat() {
  const obj = {
    fieldname: 'file',
    originalname: 'Audio Recording 2023-11-28 at 23.05.16.wav',
    encoding: '7bit',
    mimetype: 'audio/vnd.wave',
    buffer:
      '<Buffer 52 49 46 46 14 1c 04 00 57 41 56 45 4a 55 4e 4b 1c 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 66 6d ... 269290 more bytes>',
    size: 269340,
  };

  // const prompt = process.argv[2];
  const prompt = `I receive audio file as an object in my express node.js application : 
    Tell me how can i save this audio file using nestjs.
    Provide only code solution, nothing else.
    Context : ${obj}
    `;
  const openai = new ChatOpenAI({
    modelName: 'gpt-4-1106-preview',
    streaming: true,
  });
  const { content, additional_kwargs } = await openai.call([
    new HumanMessage(prompt),
  ]);
  console.log(content);
}

chat();

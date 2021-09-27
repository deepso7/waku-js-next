import { Waku, WakuMessage } from "js-waku";
import protons from "protons";

const proto = protons(`
message Message {
  uint64 timestamp = 1;
  string text = 2;
}
`);

export const ContentTopic = `/deepso/1/chat/proto`;

export const sendMessage = async (
  message: string,
  timestamp: Date,
  waku: Waku
) => {
  try {
    const time = timestamp.getTime();

    const payload = proto.Message.encode({
      timestamp: time,
      text: message,
    });

    const wakuMessage = await WakuMessage.fromBytes(payload, ContentTopic);
    console.log({ wakuMessage });

    await waku.relay.send(wakuMessage);
  } catch (err) {
    console.log(err);
  }
};

export const processMessage = (wakuMessage: WakuMessage) => {
  console.log("Recieved message");

  // Empty message?
  if (!wakuMessage.payload) return;

  const { timestamp, text } = proto.Message.decode(wakuMessage.payload);
  const time = new Date(timestamp);

  console.log(`Message recieved at ${time.toString()}: ${text}`);
};

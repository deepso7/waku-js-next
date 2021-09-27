import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { Waku } from "js-waku";
import {
  ContentTopic,
  processMessage,
  sendMessage,
} from "../utils/sendMessage";

const Home: NextPage = () => {
  const [waku, setWaku] = useState<Waku | undefined>(undefined);
  const [wakuStatus, setWakuStatus] = useState("None");
  const [peerStats, setPeerStats] = useState<{
    relayPeers: number;
    lightPushPeers: number;
  }>({
    relayPeers: 0,
    lightPushPeers: 0,
  });

  const sendMessageOnClick = async () => {
    try {
      if (!waku) return;
      await sendMessage(`Heyooo`, new Date(), waku);
    } catch (err) {
      console.log(err);
    }
  };

  useCallback((wakuMessage) => {
    processMessage(wakuMessage);
  }, []);

  useEffect(() => {
    (async () => {
      if (!!waku) return;
      if (wakuStatus !== "None") return;

      setWakuStatus("Starting");

      const w = await Waku.create({ bootstrap: true });
      setWaku(w);
      setWakuStatus("Connecting");

      await w.waitForConnectedPeer();
      setWakuStatus("Ready");
    })();
  }, [waku, wakuStatus]);

  useEffect(() => {
    if (!waku) return;

    // Pass the content topic to only process messages related to your dApp
    waku.relay.addObserver(processMessage, [ContentTopic]);

    return () => {
      waku?.relay.deleteObserver(processMessage, [ContentTopic]);
    };
  }, [waku, wakuStatus, processMessage]);

  useEffect(() => {
    if (!waku) return;

    const interval = setInterval(() => {
      setPeerStats({
        relayPeers: waku.relay.getPeers().size,
        lightPushPeers: waku.lightPush.peers.length,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [waku]);

  useEffect(() => {
    console.log({ peerStats });
  }, [peerStats]);

  return (
    <>
      <div>{wakuStatus}</div>
      <button onClick={sendMessageOnClick} disabled={wakuStatus !== "Ready"}>
        Send Message
      </button>
    </>
  );
};

export default Home;

import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const appId = "a30e66203625475ead3a0da2554d6eed";

const fetchToken = async (channelName) => {
  try {
    const response = await fetch('http://localhost:8080/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelName,
        uid: 0,
        role: 'publisher',
      }),
    });

    if (!response.ok) {
      console.warn("Token server failed. Attempting to use App ID authentication.");
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

const handleUserPublished = async (user, mediaType, clientRef, setRemoteTracks) => {
  try {
    await clientRef.current.subscribe(user, mediaType);
    if (mediaType === "video") {
      setRemoteTracks(prev => ({
        ...prev,
        [user.uid]: { ...prev[user.uid], video: user.videoTrack }
      }));
    }

    if (mediaType === "audio") {
      setRemoteTracks(prev => ({
        ...prev,
        [user.uid]: { ...prev[user.uid], audio: user.audioTrack }
      }));
      user.audioTrack.play();
    }
  } catch (error) {
    console.error("Error subscribing to user:", error);
  }
};

const handleUserUnpublished = (user, mediaType, setRemoteTracks) => {
  if (mediaType === "video") {
    setRemoteTracks(prev => ({
      ...prev,
      [user.uid]: { ...prev[user.uid], video: undefined }
    }));
  }

  if (mediaType === "audio") {
    setRemoteTracks(prev => ({
      ...prev,
      [user.uid]: { ...prev[user.uid], audio: undefined }
    }));
  }
};

const handleUserLeft = (user, setRemoteTracks) => {
  setRemoteTracks(prev => {
    const newTracks = { ...prev };
    delete newTracks[user.uid];
    return newTracks;
  });
};

const useAgora = () => {
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteTracks, setRemoteTracks] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const clientRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (clientRef.current) return;

    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = agoraClient;

    agoraClient.on("user-published", (user, mediaType) => handleUserPublished(user, mediaType, clientRef, setRemoteTracks));
    agoraClient.on("user-unpublished", (user, mediaType) => handleUserUnpublished(user, mediaType, setRemoteTracks));
    agoraClient.on("user-left", (user) => handleUserLeft(user, setRemoteTracks));

    return () => {
      if (joined) {
        leaveChannel();
      }

      if (clientRef.current) {
        clientRef.current.off("user-published", handleUserPublished);
        clientRef.current.off("user-unpublished", handleUserUnpublished);
        clientRef.current.off("user-left", handleUserLeft);
        clientRef.current = null;
      }
    };
  }, [joined]);

  const joinChannel = useCallback(async (channelName) => {
    if (!clientRef.current || joined) return;

    try {
      setIsLoading(true);
      channelRef.current = channelName;

      const token = await fetchToken(channelName);
      const uid = await clientRef.current.join(appId, channelName, token, null);

      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      microphoneTrack.trackMediaType = "audio";
      cameraTrack.trackMediaType = "video";

      await clientRef.current.publish([microphoneTrack, cameraTrack]);

      setLocalTracks([microphoneTrack, cameraTrack]);
      setIsLoading(false);
      setJoined(true);

      return uid;
    } catch (error) {
      console.error("Error joining channel:", error);
      setIsLoading(false);
      throw error;
    }
  }, [joined]);

  const leaveChannel = useCallback(async () => {
    if (!clientRef.current || !joined) return;

    try {
      localTracks.forEach(track => {
        if (track) {
          track.close();
        }
      });

      await clientRef.current.leave();

      setLocalTracks([]);
      setRemoteTracks({});
      setJoined(false);
      channelRef.current = null;
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  }, [localTracks, joined]);

  const toggleMic = useCallback(async () => {
    const audioTrack = localTracks.find(track => track?.trackMediaType === "audio");
    if (audioTrack) {
      await audioTrack.setEnabled(!audioTrack.enabled);
      return audioTrack.enabled;
    }
    return false;
  }, [localTracks]);

  const toggleCamera = useCallback(async () => {
    const videoTrack = localTracks.find(track => track?.trackMediaType === "video");
    if (videoTrack) {
      await videoTrack.setEnabled(!videoTrack.enabled);
      return videoTrack.enabled;
    }
    return false;
  }, [localTracks]);

  const startScreenShare = useCallback(async () => {
    if (!clientRef.current || !joined) return;

    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack();

      const videoTrack = localTracks.find(track => track?.trackMediaType === "video");
      if (videoTrack) {
        await clientRef.current.unpublish(videoTrack);
        videoTrack.close();
      }

      screenTrack.trackMediaType = "video";
      await clientRef.current.publish(screenTrack);

      setLocalTracks(prev =>
        prev.map(track =>
          track?.trackMediaType === "video" ? screenTrack : track
        )
      );

      return screenTrack;
    } catch (error) {
      console.error("Error sharing screen:", error);
      throw error;
    }
  }, [localTracks, joined]);

  const stopScreenShare = useCallback(async () => {
    if (!clientRef.current || !joined) return;

    try {
      const screenTrack = localTracks.find(track => track?.trackMediaType === "video");

      if (screenTrack) {
        await clientRef.current.unpublish(screenTrack);
        screenTrack.close();

        const cameraTrack = await AgoraRTC.createCameraVideoTrack();
        cameraTrack.trackMediaType = "video";

        await clientRef.current.publish(cameraTrack);

        setLocalTracks(prev =>
          prev.map(track =>
            track?.trackMediaType === "video" ? cameraTrack : track
          )
        );
      }
    } catch (error) {
      console.error("Error stopping screen share:", error);
      throw error;
    }
  }, [localTracks, joined]);

  return {
    client: clientRef.current,
    localTracks,
    remoteTracks,
    isLoading,
    joined,
    joinChannel,
    leaveChannel,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare
  };
};

export default useAgora;

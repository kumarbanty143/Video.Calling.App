import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { VideoOff, MicOff, Mic, Video, PhoneOff, Copy, Users, ScreenShare, MessageSquare, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "../components/ui/badge";
import VideoCall from "../components/video/VideoCall";
import Controls from "../components/video/Controls";
import useAgora from "../hooks/useAgora";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const initialAudioState = localStorage.getItem("initialAudioState") || "unmuted";
  const initialVideoState = localStorage.getItem("initialVideoState") || "on";
  
  const [isMuted, setIsMuted] = useState(initialAudioState === "muted");
  const [isVideoOff, setIsVideoOff] = useState(initialVideoState === "off");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [joinError, setJoinError] = useState(null);
  const [tokenError, setTokenError] = useState(false);
  const userName = localStorage.getItem("userName") || "User";
  const joinAttempted = useRef(false);
  
  const { 
    localTracks, 
    remoteTracks, 
    joinChannel, 
    leaveChannel,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    isLoading,
    joined
  } = useAgora();

  useEffect(() => {
    if (!userName) {
      toast.error("Please enter your name first");
      navigate("/");
      return;
    }

    if (roomId && !joinAttempted.current) {
      joinAttempted.current = true;
      
      joinChannel(roomId, userName)
        .then(async () => {
          toast.success(`Joined room: ${roomId}`);
          
          setTimeout(async () => {
            const audioTrack = localTracks.find(track => track?.trackMediaType === "audio");
            const videoTrack = localTracks.find(track => track?.trackMediaType === "video");
            
            if (audioTrack) {
              const shouldBeEnabled = !isMuted;
              await audioTrack.setEnabled(shouldBeEnabled);
            }
            
            if (videoTrack) {
              const shouldBeEnabled = !isVideoOff;
              await videoTrack.setEnabled(shouldBeEnabled);
            }
          }, 1000);
        })
        .catch(err => {
          console.error("Failed to join channel:", err);
          
          if (err.message && err.message.includes("dynamic use static key")) {
            toast.error("Authentication error: Please check your Agora credentials", {
              duration: 5000
            });
            setTokenError(true);
            setJoinError(
              "Authentication error: Your Agora project requires token authentication. " +
              "Please set up token authentication or change your project settings in the Agora Console."
            );
          } else {
            toast.error("Failed to join the meeting. Please try again.");
            setJoinError(`Error: ${err.message || "Failed to join the meeting"}`);
          }
        });
    }
  }, [roomId, userName, navigate, joinChannel, toggleMic, toggleCamera, isMuted, isVideoOff]);

  useEffect(() => {
    if (joined) {
      setParticipants([
        {
          uid: "local",
          name: userName,
          isLocal: true
        }
      ]);
    }
  }, [joined, userName]);

  useEffect(() => {
    if (remoteTracks && Object.keys(remoteTracks).length > 0) {
      const remoteParticipants = Object.keys(remoteTracks).map(uid => ({
        uid,
        name: `User-${uid}`,
        isLocal: false
      }));
      
      setParticipants(prev => {
        const local = prev.find(p => p.isLocal);
        return local ? [local, ...remoteParticipants] : remoteParticipants;
      });
    }
  }, [remoteTracks]);

  const handleToggleMic = async () => {
    try {
      const audioTrack = localTracks.find(track => track?.trackMediaType === "audio");
      if (audioTrack) {
        const newState = !audioTrack.enabled;
        await audioTrack.setEnabled(newState);
        setIsMuted(!newState);
      } else {
        const enabled = await toggleMic();
        setIsMuted(!enabled);
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
      toast.error("Failed to toggle microphone");
    }
  };

  const handleToggleVideo = async () => {
    try {
      const videoTrack = localTracks.find(track => track?.trackMediaType === "video");
      if (videoTrack) {
        const newState = !videoTrack.enabled;
        await videoTrack.setEnabled(newState);
        setIsVideoOff(!newState);
      } else {
        const enabled = await toggleCamera();
        setIsVideoOff(!enabled);
      }
    } catch (error) {
      console.error("Error toggling camera:", error);
      toast.error("Failed to toggle camera");
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      toast.error("Failed to toggle screen sharing");
      console.error("Screen sharing error:", error);
    }
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    toast.info("Chat functionality coming soon!");
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleLeave = async () => {
    await leaveChannel();
    toast.info("Left the meeting");
    navigate("/");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard");
  };

  const handleGoBack = () => {
    navigate("/");
  };

  if (tokenError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-700 mb-4">
            {joinError}
          </p>
          <div className="my-4">
            <p className="text-sm text-gray-500 mb-4">
              To fix this issue, you have two options:
            </p>
            <div className="text-left mb-4">
              <p className="font-medium">Option 1: Enable App ID Authentication</p>
              <ol className="list-decimal ml-4 text-sm text-gray-600">
                <li>Go to the Agora Console</li>
                <li>Open your project settings</li>
                <li>Go to the "Authentication" tab</li>
                <li>Select "App ID Authentication"</li>
                <li>Save your settings</li>
              </ol>
              
              <p className="font-medium mt-4">Option 2: Set Up a Token Server</p>
              <ol className="list-decimal ml-4 text-sm text-gray-600">
                <li>Set up a token server using the provided code</li>
                <li>Update the token server URL in your app</li>
                <li>Make sure your App Certificate is properly configured</li>
              </ol>
            </div>
            <Button onClick={handleGoBack} className="w-full">
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (joinError && !tokenError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to Join Meeting</h2>
          <p className="text-gray-700 mb-4">{joinError}</p>
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Please check your connection or try again later.
            </p>
            <Button onClick={handleGoBack} className="w-full">Go Back Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Joining meeting...</h2>
          <p className="text-gray-500">Please wait while we connect you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="bg-slate-800 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white mr-4">Meeting: {roomId}</h1>
            <Button variant="outline" size="sm" onClick={copyRoomId} className="text-white border-slate-600 hover:bg-slate-700">
              <Copy className="h-4 w-4 mr-2" />
              Copy ID
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowParticipants(true)}
              className="text-white hover:bg-slate-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Participants ({participants.length})
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleSettings}
              className="text-white hover:bg-slate-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 relative">
        <VideoCall 
          localTracks={localTracks} 
          remoteTracks={remoteTracks} 
          isVideoOff={isVideoOff}
        />
      </main>
      
      <footer className="bg-slate-800 py-4">
        <Controls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMic={handleToggleMic}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleChat={handleToggleChat}
          onLeave={handleLeave}
        />
      </footer>
      
      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Participants ({participants.length})</DialogTitle>
            <DialogDescription>
              People in this meeting
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {participants.map((participant) => (
              <div 
                key={participant.uid} 
                className="flex items-center justify-between p-2 bg-slate-100 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{participant.name}</span>
                </div>
                {participant.isLocal && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">You</Badge>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Meeting Settings</DialogTitle>
            <DialogDescription>
              Configure your meeting preferences
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Audio Settings</h3>
              <div className="bg-slate-100 p-3 rounded-md">
                <Button 
                  variant={isMuted ? "destructive" : "outline"} 
                  className="w-full"
                  onClick={handleToggleMic}
                >
                  {isMuted ? 
                    <MicOff className="h-4 w-4 mr-2" /> : 
                    <Mic className="h-4 w-4 mr-2" />
                  }
                  {isMuted ? "Unmute Microphone" : "Mute Microphone"}
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Video Settings</h3>
              <div className="bg-slate-100 p-3 rounded-md">
                <Button 
                  variant={isVideoOff ? "destructive" : "outline"} 
                  className="w-full"
                  onClick={handleToggleVideo}
                >
                  {isVideoOff ? 
                    <VideoOff className="h-4 w-4 mr-2" /> : 
                    <Video className="h-4 w-4 mr-2" />
                  }
                  {isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Room Information</h3>
              <div className="bg-slate-100 p-3 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Room ID:</span>
                  <code className="bg-white px-2 py-1 rounded text-sm">{roomId}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Your Name:</span>
                  <span className="bg-white px-2 py-1 rounded text-sm">{userName}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Room;
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon, MicIcon, MicOffIcon, VideoOffIcon, ArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Avatar } from "@/components/ui/avatar";

const Preview = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceError, setDeviceError] = useState(null);
  const videoPreviewRef = useRef(null);
  const audioLevelIntervalRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem("userName") || "";
    setUserName(savedName);
    
    const initializeDevices = async () => {
      try {
        setIsLoading(true);

        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(micTrack);
        setLocalVideoTrack(camTrack);

        if (videoPreviewRef.current) {
          camTrack.play(videoPreviewRef.current);
        }

        audioLevelIntervalRef.current = setInterval(() => {
          const level = micTrack.getVolumeLevel();
          setAudioLevel(level * 100);
        }, 100);

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing devices:", error);
        setDeviceError(error.message || "Failed to access camera or microphone");
        setIsLoading(false);
      }
    };

    initializeDevices();

    return () => {
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      
      if (localVideoTrack) {
        localVideoTrack.close();
      }
    };
  }, []);

  const toggleMic = async () => {
    if (localAudioTrack) {
      const newState = !localAudioTrack.enabled;
      await localAudioTrack.setEnabled(newState);
      setIsMuted(!newState);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      const newState = !localVideoTrack.enabled;
      await localVideoTrack.setEnabled(newState);
      setIsVideoOff(!newState);
    }
  };

  const handleJoinMeeting = () => {
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    localStorage.setItem("userName", userName);
    
    const audioEnabled = localAudioTrack ? localAudioTrack.enabled : !isMuted;
    const videoEnabled = localVideoTrack ? localVideoTrack.enabled : !isVideoOff;
    
    localStorage.setItem("initialAudioState", audioEnabled ? "unmuted" : "muted");
    localStorage.setItem("initialVideoState", videoEnabled ? "on" : "off");
    
    if (localAudioTrack) {
      localAudioTrack.close();
    }
    
    if (localVideoTrack) {
      localVideoTrack.close();
    }

    navigate(`/room/${roomId}`);
  };

  const handleCancel = () => {
    if (localAudioTrack) {
      localAudioTrack.close();
    }
    
    if (localVideoTrack) {
      localVideoTrack.close();
    }
    
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <VideoIcon className="text-blue-500" />
            Preview before joining
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {deviceError ? (
            <div className="text-center p-4 bg-red-50 rounded-md text-red-600">
              <p>Error: {deviceError}</p>
              <p className="text-sm mt-2">
                Please ensure you've granted camera and microphone permissions.
              </p>
            </div>
          ) : (
            <>
              <div className="relative aspect-video bg-slate-200 rounded-md overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <div 
                      ref={videoPreviewRef} 
                      className={`absolute inset-0 ${isVideoOff ? 'hidden' : ''}`}
                    ></div>
                    
                    {isVideoOff && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                        <Avatar className="h-24 w-24 bg-blue-100 text-blue-700 text-3xl">
                          {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </Avatar>
                      </div>
                    )}
                    
                    {!isLoading && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        <Button
                          onClick={toggleMic}
                          size="sm"
                          variant={isMuted ? "destructive" : "secondary"}
                          className="rounded-full h-10 w-10 p-0"
                        >
                          {isMuted ? (
                            <MicOffIcon className="h-5 w-5" />
                          ) : (
                            <MicIcon className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <Button
                          onClick={toggleVideo}
                          size="sm"
                          variant={isVideoOff ? "destructive" : "secondary"}
                          className="rounded-full h-10 w-10 p-0"
                        >
                          {isVideoOff ? (
                            <VideoOffIcon className="h-5 w-5" />
                          ) : (
                            <VideoIcon className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {!isLoading && !isMuted && (
                <div className="bg-slate-100 p-2 rounded-md">
                  <div className="text-sm text-slate-500 mb-1">Microphone</div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: `${Math.min(audioLevel, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full"
                />
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          
          <Button 
            onClick={handleJoinMeeting}
            disabled={!userName.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Join meeting <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Preview; 
import { Button } from "@/components/ui/button";
import { VideoOff, MicOff, Mic, Video, PhoneOff, ScreenShare, MessageSquare } from "lucide-react";

const controlStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px"
  },
  button: {
    borderRadius: "9999px",
    height: "48px",
    width: "48px",
    padding: 0
  }
};

const Controls = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onLeave,
}) => {
  return (
    <div style={controlStyles.container}>
      <Button
        variant={isMuted ? "destructive" : "secondary"}
        style={controlStyles.button}
        onClick={onToggleMic}
      >
        {isMuted ? 
          <MicOff style={{ height: "20px", width: "20px" }} /> : 
          <Mic style={{ height: "20px", width: "20px" }} />
        }
      </Button>

      <Button
        variant={isVideoOff ? "destructive" : "secondary"}
        style={controlStyles.button}
        onClick={onToggleVideo}
      >
        {isVideoOff ? 
          <VideoOff style={{ height: "20px", width: "20px" }} /> : 
          <Video style={{ height: "20px", width: "20px" }} />
        }
      </Button>

      <Button
        variant={isScreenSharing ? "destructive" : "secondary"}
        style={controlStyles.button}
        onClick={onToggleScreenShare}
      >
        <ScreenShare style={{ height: "20px", width: "20px" }} />
      </Button>

      <Button
        variant="secondary"
        style={controlStyles.button}
        onClick={onToggleChat}
      >
        <MessageSquare style={{ height: "20px", width: "20px" }} />
      </Button>

      <Button
        variant="destructive"
        style={controlStyles.button}
        onClick={onLeave}
      >
        <PhoneOff style={{ height: "20px", width: "20px" }} />
      </Button>
    </div>
  );
};

export default Controls;
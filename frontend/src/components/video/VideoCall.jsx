import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { VideoOff } from "lucide-react";

const videoStyles = {
  grid: {
    display: "grid",
    gap: "16px",
    height: "100%"
  },
  gridCols1: {
    gridTemplateColumns: "1fr"
  },
  gridCols2: {
    gridTemplateColumns: "1fr 1fr"
  },
  gridCols3: {
    gridTemplateColumns: "1fr 1fr 1fr"
  },
  card: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1e293b"
  },
  noVideo: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#334155"
  },
  noVideoContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  videoIcon: {
    height: "48px",
    width: "48px",
    color: "white",
    marginBottom: "8px"
  },
  videoText: {
    color: "white"
  },
  nameTag: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingLeft: "8px",
    paddingRight: "8px",
    paddingTop: "4px",
    paddingBottom: "4px",
    borderRadius: "4px",
    color: "white",
    fontSize: "0.875rem"
  },
  videoContainer: {
    height: "100%",
    width: "100%"
  }
};

const RemoteVideo = ({ uid, videoTrack }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.play(videoRef.current);
    }
    
    return () => {
      videoTrack?.stop();
    };
  }, [videoTrack]);

  return (
    <Card style={videoStyles.card}>
      {videoTrack ? (
        <div ref={videoRef} style={videoStyles.videoContainer}></div>
      ) : (
        <div style={videoStyles.noVideo}>
          <div style={videoStyles.noVideoContent}>
            <VideoOff style={videoStyles.videoIcon} />
            <span style={videoStyles.videoText}>No Video</span>
          </div>
        </div>
      )}
      <div style={videoStyles.nameTag}>
        User-{uid}
      </div>
    </Card>
  );
};

const VideoCall = ({ localTracks, remoteTracks, isVideoOff }) => {
  const localVideoRef = useRef(null);
  
  useEffect(() => {
    const videoTrack = localTracks?.find(track => track?.trackMediaType === "video");
    if (videoTrack && localVideoRef.current) {
      videoTrack.play(localVideoRef.current);
    }
    
    return () => {
      videoTrack?.stop();
    };
  }, [localTracks]);

  const calculateGridStyle = () => {
    const totalParticipants = Object.keys(remoteTracks).length + 1;
    
    if (totalParticipants === 1) {
      return {...videoStyles.grid, ...videoStyles.gridCols1};
    } else if (totalParticipants === 2) {
      return {...videoStyles.grid, ...videoStyles.gridCols2};
    } else if (totalParticipants <= 4) {
      return {...videoStyles.grid, ...videoStyles.gridCols2};
    } else {
      return {...videoStyles.grid, ...videoStyles.gridCols3};
    }
  };

  return (
    <div style={calculateGridStyle()}>
      <Card style={videoStyles.card}>
        {isVideoOff ? (
          <div style={videoStyles.noVideo}>
            <div style={videoStyles.noVideoContent}>
              <VideoOff style={videoStyles.videoIcon} />
              <span style={videoStyles.videoText}>Camera Off</span>
            </div>
          </div>
        ) : (
          <div ref={localVideoRef} style={videoStyles.videoContainer}></div>
        )}
        <div style={videoStyles.nameTag}>
          You (Local)
        </div>
      </Card>
      
      {Object.entries(remoteTracks).map(([uid, tracks]) => (
        <RemoteVideo 
          key={uid} 
          uid={uid} 
          videoTrack={tracks.video} 
          audioTrack={tracks.audio} 
        />
      ))}
    </div>
  );
};

export default VideoCall;
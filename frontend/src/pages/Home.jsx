import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { VideoIcon, PlusCircle, ArrowRight, Users } from "lucide-react";
import { generateRandomId } from "@/lib/utils";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const createRoom = () => {
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setCreating(true);
    const newRoomId = generateRandomId(8);
    localStorage.setItem("userName", userName);
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    setJoining(true);
    localStorage.setItem("userName", userName);
    navigate(`/room/${roomId}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && roomId.trim()) {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 md:p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <VideoIcon className="mr-2 text-blue-500 h-8 w-8" />
            <h1 className="text-3xl font-bold">Agora Connect</h1>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Virtual Meetings Made Simple</h2>
          
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Connect with anyone, anywhere with our secure and reliable video conferencing platform.
          </p>
          
          <div className="flex justify-center gap-6 mb-8">
            <div className="flex items-center">
              <Users className="mr-2 text-blue-500 h-5 w-5" />
              <span>Unlimited participants</span>
            </div>
            <div className="flex items-center">
              <VideoIcon className="mr-2 text-blue-500 h-5 w-5" />
              <span>HD video quality</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Join Meeting</CardTitle>
            <CardDescription>
              Create a new meeting or join an existing one
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={createRoom}
              disabled={creating || !userName.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Meeting
            </Button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-500">
                  or join existing
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter room ID"
                className="flex-1 focus:ring-green-500"
              />
              <Button 
                onClick={joinRoom}
                disabled={joining || !roomId.trim() || !userName.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="text-center border-t pt-4 text-xs text-gray-500">
            Powered by Agora Real-Time Communications
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Home;
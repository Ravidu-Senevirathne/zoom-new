import "./App.css";
import { ZoomMtg } from "@zoom/meetingsdk";
import { useState, useEffect } from "react";

// Initialize Zoom SDK
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

// Interface for Zoom credentials
interface ZoomCredentials {
  zoom_id: string;
  zoom_password: string;
}

function App() {
  // State for zoom credentials
  const [zoomCredentials, setZoomCredentials] = useState<ZoomCredentials | null>(null);
  const [, setError] = useState<string | null>(null);
  const [, setLoading] = useState(false);

  // Change this endpoint to use the sample signature node server
  const authEndpoint = "http://admin.eoe.lk/api/zoom/public-signature";
  const sdkKey = "7HVQQGOjR_2qq6vJvdWw"; // Your SDK key

  // Will be set from fetched credentials
  const [meetingNumber, setMeetingNumber] = useState("");

  // Default values
  const role = 0;
  const userName = "Test";
  const userEmail = "";
  const registrantToken = "";
  const zakToken = "";
  const leaveUrl = "https://zoom-new-jvfr.vercel.app/";

  // Fetch Zoom credentials by ID
  const fetchZoomCredentials = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://admin.eoe.lk/api/zoom-credentials/${id}`);
      const data = await response.json();

      if (data.status && data.data) {
        setZoomCredentials(data.data);
        setMeetingNumber(data.data.zoom_id);
      } else {
        setError(data.message || 'Failed to fetch zoom credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zoom credentials');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch credentials when ID is available
  useEffect(() => {
    // Get ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
      fetchZoomCredentials(id);
    }
  }, []);

  const getSignature = async () => {
    try {
      const req = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingNumber: meetingNumber,
          role: role,
          sdkKey: sdkKey  // Add sdkKey parameter
        }),
      });
      const res = await req.json();
      const signature = res.signature as string;
      startMeeting(signature);
    } catch (e) {
      console.log(e);
    }
  };

  function startMeeting(signature: string) {
    document.getElementById("zmmtg-root")!.style.display = "block";

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,
      success: (success: unknown) => {
        console.log(success);

        if (!zoomCredentials) {
          console.error('No zoom credentials available');
          return;
        }

        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          passWord: zoomCredentials.zoom_password,
          userName: userName,
          userEmail: userEmail,
          tk: registrantToken,
          zak: zakToken,
          success: (success: unknown) => {
            console.log(success);
          },
          error: (error: unknown) => {
            console.log(error);
          },
        });
      },
      error: (error: unknown) => {
        console.log(error);
      },
    });
  }

  return (
    <div className="App">
      <main>
        <h1>Zoom Meeting SDK Sample React</h1>
        <button onClick={getSignature}>Join Meeting</button>
      </main>
    </div>
  );
}

export default App;

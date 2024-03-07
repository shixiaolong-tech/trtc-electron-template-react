import { useEffect, useRef } from 'react';
import trtcCloud from './base/trtcCloud';
import './App.css';

function App() {
  const localVideoDiv = useRef(null);

  // useEffect(() => {
  //   if (localVideoDiv && localVideoDiv.current) {
  //     // trtcCloud.startLocalPreview(localVideoDiv.current);
  //   }
  // }, [localVideoDiv]);

  function onOpenCamera() {
    if (localVideoDiv && localVideoDiv.current) {
      trtcCloud.startLocalPreview(localVideoDiv.current); // open and preview
    } else {
      if (localVideoDiv && localVideoDiv.current) {
        trtcCloud.startLocalPreview(null); // open but not preview
      }
    }
  }

  return (
    <div className="App">
      <div>
        SDK version: {trtcCloud.getSDKVersion()}
      </div>
      <div style={{ height: "24rem", backgroundColor: "#c6c6c6"}} ref={localVideoDiv}></div>
      <div>
        <button onClick={onOpenCamera}>Open Camera</button>
      </div>
    </div>
  );
}

export default App;

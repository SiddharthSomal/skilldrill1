import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export const VideoPlayer = ({ stream, val, neutral, angry, sad, happy, fearful, disgusted, surprised }) => {
    const videoRef = useRef(null);
    const canvasVideoRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            
            // Wait for video to be ready before loading models
            videoRef.current.addEventListener('loadeddata', () => {
                if (!modelsLoaded) {
                    loadModels();
                }
            });
        }
        
        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [stream, modelsLoaded]);

    const loadModels = async () => {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models'),
            ]);
            
            setModelsLoaded(true);
            console.log('Models loaded successfully');
            faceDetection();
        } catch (error) {
            console.error('Error loading models:', error);
        }
    };

    const faceDetection = async () => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(async () => {
            try {
                // Check if video and canvas refs are available and video is playing
                if (!videoRef.current || !canvasVideoRef.current || 
                    videoRef.current.paused || videoRef.current.ended || 
                    !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
                    return;
                }

                const detections = await faceapi.detectAllFaces(
                    videoRef.current, 
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceLandmarks().withFaceExpressions();

                // Clear previous drawings
                const ctx = canvasVideoRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasVideoRef.current.width, canvasVideoRef.current.height);

                if (detections && detections.length > 0) {
                    const expressionArray = detections[0].expressions;
                    
                    // Update emotion values (remove unnecessary await keywords)
                    neutral.current = neutral.current + expressionArray.neutral;
                    disgusted.current = disgusted.current + expressionArray.disgusted;
                    fearful.current = fearful.current + expressionArray.fearful;
                    happy.current = happy.current + expressionArray.happy;
                    sad.current = sad.current + expressionArray.sad;
                    surprised.current = surprised.current + expressionArray.surprised;
                    angry.current = angry.current + expressionArray.angry;

                    // Set canvas dimensions to match video
                    faceapi.matchDimensions(canvasVideoRef.current, {
                        width: 150,
                        height: 150,
                    });

                    const resized = faceapi.resizeResults(detections, {
                        width: 150,
                        height: 150,
                    });

                    // Draw face expressions
                    faceapi.draw.drawFaceExpressions(canvasVideoRef.current, resized);
                }
            } catch (error) {
                console.error('Face detection error:', error);
            }
        }, 4000);
    };

    return (
        <div style={{ position: 'relative' }}>
            <video 
                className={val} 
                ref={videoRef} 
                autoPlay 
                playsInline
                width="150" 
                height="150"
                style={{ position: 'absolute', zIndex: 1 }}
            />
            <canvas 
                ref={canvasVideoRef} 
                className='app__canvas'
                width="150"
                height="150"
                style={{ position: 'absolute', zIndex: 2 }}
            />
        </div>
    );
};
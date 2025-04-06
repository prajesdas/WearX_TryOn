import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TryOnProps {
  className?: string;
}

export function TryOn({ className }: TryOnProps) {
  const [selectedItem, setSelectedItem] = useState<string>('tshirt');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Failed to access camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg');
  };

  const tryOn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const imageData = captureImage();
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      const response = await fetch('http://localhost:5000/api/try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          type: selectedItem,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process image');
      }

      setResultImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex flex-col gap-2">
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item to try on" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tshirt">T-shirt</SelectItem>
                  <SelectItem value="dress">Dress</SelectItem>
                  <SelectItem value="earrings">Earrings</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={tryOn}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Try On'}
              </Button>
            </div>
          </div>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {resultImage ? (
              <img
                src={resultImage}
                alt="Try-on result"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                Result will appear here
              </div>
            )}
          </div>
        </div>
      </Card>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
} 
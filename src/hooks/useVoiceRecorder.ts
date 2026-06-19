'use client';

import { useState, useRef, useCallback } from 'react';
import { MAX_RECORDING_SECONDS } from '@/lib/constants';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
}

export default function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Clean up media stream tracks */
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  }, []);

  /** Send recorded audio blob to the transcription API */
  const sendForTranscription = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.text) {
        setTranscript(data.text);
      } else {
        setError(data.error || 'Transcription failed. Please try again.');
      }
    } catch (err) {
      console.error('[useVoiceRecorder] Transcription fetch error:', err);
      setError('Network error — could not reach the server. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /** Start recording from the microphone */
  const startRecording = useCallback(async () => {
    setError('');
    setTranscript('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Choose a supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        cleanupStream();
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        if (audioBlob.size > 0) {
          sendForTranscription(audioBlob);
        }
      };

      recorder.start();
      setIsRecording(true);

      // Auto-stop after MAX_RECORDING_SECONDS
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, MAX_RECORDING_SECONDS * 1000);
    } catch (err) {
      cleanupStream();

      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError(
          'Microphone access denied. Please allow microphone permission in your browser settings.'
        );
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Could not start recording. Please try again.');
      }

      console.error('[useVoiceRecorder] getUserMedia error:', err);
    }
  }, [cleanupStream, sendForTranscription]);

  /** Stop the current recording */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  /** Clear transcript and error state */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError('');
  }, []);

  return {
    isRecording,
    isProcessing,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  };
}

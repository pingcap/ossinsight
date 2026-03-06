/*
*  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

/* globals main, MediaRecorder */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

function useSupportedType () {
  return  useMemo(() => {
    if (typeof MediaRecorder === 'undefined') {
      return undefined
    }

    const types = [
      "video/mp4",
      "video/webm\;codecs=h264",
      "video/webm",
      'video/webm,codecs=vp9',
      'video/vp8',
      "video/webm\;codecs=vp8",
      "video/webm\;codecs=daala",
      "video/mpeg",
    ];

    for (let i in types) {
      if (MediaRecorder.isTypeSupported(types[i])) {
        return types[i];
      }
    }
  }, [])

}

export function useWebRTCRecorder(filename: string) {
  const canvasRef = useRef<HTMLCanvasElement>()
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [recording, setRecording] = useState(false);
  const shouldStart = useRef(false)

  const ref = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas ?? undefined
    setCanvas(canvas);
    if (canvas) {
      streamRef.current = canvas.captureStream(24);
      console.log('Started stream capture from canvas element: ', streamRef.current);
      if (shouldStart.current) {
        start()
      }
    }
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder>();
  const streamRef = useRef<MediaStream>();
  const recordedBlobsRef = useRef<Blob[]>();

  const supportedType = useSupportedType()

  if (!supportedType) {
    throw new Error('Not support recorder')
  }

  const start = useCallback(() => {
    shouldStart.current = true
    const canvas = canvasRef.current
    const stream = streamRef.current
    if (!canvas || mediaRecorderRef.current || !stream) {
      return;
    }

    let options = {
      mimeType: supportedType,
      videoBitsPerSecond: 40000000
    };
    recordedBlobsRef.current = [];
    let mediaRecorder: MediaRecorder = mediaRecorderRef.current = new MediaRecorder(streamRef.current!, options);
    mediaRecorder.onstop = event => {
      console.log('Recorder stopped: ', event);
      setRecording(false);
    };
    mediaRecorder.onstart = () => {
      setRecording(true);
    };
    mediaRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        recordedBlobsRef.current!.push(event.data);
      }
    }
    mediaRecorder.start(5000);
    console.log('MediaRecorder started', mediaRecorder);
  }, []);

  const stop = useCallback(() => {
    shouldStart.current = false
    const canvas = canvasRef.current
    if (!canvas || !mediaRecorderRef.current) {
      return;
    }
    console.log('MediaRecorder stopped', mediaRecorderRef.current);
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
  }, []);

  const download = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !recordedBlobsRef.current) {
      return;
    }
    const blob = new Blob(recordedBlobsRef.current, { type: supportedType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename + '.' + /\w+\/(\w+)/.exec(supportedType || '')?.[1];
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }, [filename]);

  useLayoutEffect(() => {
    if (!canvas) {
      return;
    }

    return () => {
      console.log('clear canvas')
      stop();
      canvasRef.current = undefined;
      mediaRecorderRef.current = undefined;
      streamRef.current = undefined;
      recordedBlobsRef.current = undefined;
    };
  }, [canvas]);

  return {
    ref,
    download,
    start,
    stop,
    recording,
  };
}

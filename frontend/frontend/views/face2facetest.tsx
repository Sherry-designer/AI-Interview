import React, { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import {AssistantService, ClientService} from "Frontend/generated/endpoints";
import {nanoid} from "nanoid";
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import talkingAnimation from 'Frontend/assets/animations/talking-animation.json'; // 从 LottieFiles 下载的动画文件
import thinkingAnimation from 'Frontend/assets/animations/think-animation.json'; // 从 LottieFiles 下载的动画文件
import microphoneAnimation from 'Frontend/assets/animations/microphone-animation.json'; // 从 LottieFiles 下载的动画文件
import { FaMicrophone, FaStop, FaPaperPlane } from 'react-icons/fa';
import withAuth from 'Frontend/components/withAuth';
import FaceVerificationDialog from './FaceVerificationDialog';

export const config: ViewConfig = { menu: { order: 1, icon: 'vaadin:users' }, title: '面试' };

const AudioRecorder = () => {
  const [showStartButton, setShowStartButton] = useState(true); // 是否显示“开始面试”按钮
  const [showAnswerButton, setShowAnswerButton] = useState(false); // 是否显示“回答”按钮
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chatId, setChatId] = useState(nanoid());
  const lottieRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false); // 人脸识别状态

  const handleVerificationSuccess = () => {
    setIsFaceVerified(true); // 人脸识别成功后启用开始按钮
  };

  // 播放欢迎语音
  const playWelcomeAudio = async () => {
    if (!isFaceVerified) return; // 如果人脸识别未通过，不执行

    setShowStartButton(false); // 隐藏“开始面试”按钮
    setIsRecording(false);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('userName', localStorage.getItem('username'));

    try {
      const response = await fetch(`/interview/face2faceChat`, {
        method: 'POST',
        body: formData,
      });

      const responseBlob = await response.blob();
      const audioUrl = URL.createObjectURL(responseBlob);

      // 获取状态信息
      const status = response.headers.get('X-Chat-Status');
      const completed = status === 'completed';
      setIsCompleted(completed);

      setAudioUrl(audioUrl);
      setIsProcessing(false);
      playAudio(audioUrl);
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      setIsProcessing(false);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // 停止录音并发送到后端
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  // 发送音频到后端
  const sendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('userName', '');
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch(`/interview/face2faceChat`, {
        method: 'POST',
        body: formData,
      });

      const responseBlob = await response.blob();
      const audioUrl = URL.createObjectURL(responseBlob);

      // 获取状态信息
      const status = response.headers.get('X-Chat-Status');
      const completed = status === 'completed';
      setIsCompleted(completed);

      setAudioUrl(audioUrl);
      setIsProcessing(false);
      playAudio(audioUrl);
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      setIsProcessing(false);
    }
  };

  // 播放音频
  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
    setIsPlaying(true);

    // 同步动画
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      if (!isPlaying) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      // 根据音频波形调整动画速度
      if (lottieRef.current) {
        lottieRef.current.setSpeed(average / 50 + 1);
      }

      requestAnimationFrame(animate);
    };

    animate();

    audio.onended = () => {
      setIsPlaying(false);
      setIsRecording(false);
      setShowAnswerButton(true); // 显示“回答”按钮
      if (!isCompleted) {
        startRecording();
      }
    };
  };

  return (
  <div>
   {/* 人脸识别对话框 */}
   {!isFaceVerified && <FaceVerificationDialog onVerificationSuccess={handleVerificationSuccess} />}
   <div style={{ textAlign: 'center',
                    position: 'fixed',
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)' }}>
        {/* 开始面试按钮 */}
      {showStartButton && (
        <motion.button
          onClick={playWelcomeAudio}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#4CAF50',
            color: 'white',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          开始面试
        </motion.button>
      )}

      {/* 回答按钮 */}
        {showAnswerButton && !isProcessing && !isCompleted && !isPlaying &&(
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: isRecording ? '#ff4d4d' : '#4CAF50',
            color: 'white',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 20, // 按钮在上层
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isRecording ? '回答完毕' : '回答'}
        </motion.button>
        )}
    </div>

    <div style={{ textAlign: 'center',
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)' }}>

        {/* 加载动画 */}
        {isRecording && !isCompleted && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none', // 禁止点击
              zIndex: 10, // 动画在底层
            }}
          >
            <Lottie
              lottieRef={lottieRef}
              animationData={microphoneAnimation}
              loop={true}
              style={{ width: '200px', height: '200px' }} // 调整动画大小
            />
             <div
             style={{
               marginTop: '10px',
               fontSize: '20px',
               fontWeight: 'bold',
               color: '#333',
             }}
           >
             请回答问题...
           </div>
          </div>
        )}

          {isCompleted &&(
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 360 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              width: 200,
              height: 200,
              backgroundColor: 'lightblue',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '10px',
            }}
          >
            <h1>Goodbye!</h1>
          </motion.div>
          )}

          {/* 加载动画 */}
          {isProcessing && !isCompleted && (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2, // 动画小人在上层
                pointerEvents: 'none', // 禁止点击
              }}
            >
              <Lottie
                lottieRef={lottieRef}
                animationData={thinkingAnimation}
                loop={true}
                style={{ width: '300px', height: '300px' }} // 调整动画大小
              />
               <div
               style={{
                 marginTop: '10px',
                 fontSize: '20px',
                 fontWeight: 'bold',
                 color: '#333',
               }}
             >
               正在思考您的回答...
             </div>
            </div>
          )}

          {/* 动画小人 */}
          {isPlaying && !isCompleted && (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2, // 动画小人在上层
                pointerEvents: 'none', // 禁止点击
              }}
            >
              <Lottie
                lottieRef={lottieRef}
                animationData={talkingAnimation}
                loop={true}
                style={{ width: '600px', height: '400px' }} // 调整动画大小
              />
               <div
               style={{
                 marginTop: '10px',
                 fontSize: '20px',
                 fontWeight: 'bold',
                 color: '#333',
               }}
             >
               面试官正在回答...
             </div>
            </div>
          )}
        </div>
        </div>
  );
};

export default withAuth(AudioRecorder);
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { Celebration, AutoAwesome, Stars } from '@mui/icons-material';
import confetti from 'canvas-confetti';

export const useEurekaAnimation = () => {
  const [showEureka, setShowEureka] = useState(false);
  const [eurekaMessage, setEurekaMessage] = useState('わかった！');

  const triggerEureka = useCallback((message?: string) => {
    if (message) {
      setEurekaMessage(message);
    }
    
    setShowEureka(true);
    
    // 紙吹雪エフェクト
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#FF6347']
    });

    // 3秒後に非表示
    setTimeout(() => {
      setShowEureka(false);
      setEurekaMessage('わかった！');
    }, 3000);
  }, []);

  const EurekaAnimation = useCallback(() => (
    <AnimatePresence>
      {showEureka && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                borderRadius: 4,
                p: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                textAlign: 'center',
                minWidth: 300
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Celebration sx={{ fontSize: 60, color: 'white', mb: 2 }} />
              </motion.div>
              
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                {eurekaMessage}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.2
                  }}
                >
                  <AutoAwesome sx={{ color: 'white', fontSize: 30 }} />
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, -360]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.4
                  }}
                >
                  <Stars sx={{ color: 'white', fontSize: 30 }} />
                </motion.div>
              </Box>
            </Box>
          </motion.div>

          {/* 背景の光のエフェクト */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 3],
              opacity: [0.5, 0]
            }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
              zIndex: -1
            }}
          />
        </Box>
      )}
    </AnimatePresence>
  ), [showEureka, eurekaMessage]);

  return {
    showEureka,
    triggerEureka,
    EurekaAnimation
  };
};
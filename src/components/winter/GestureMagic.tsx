/**
 * Gesture Magic - Advanced gesture recognition system for triggering magical effects
 * Supports swipe, pinch, long-press gestures with magical visual feedback
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { deviceCapabilities } from '../../lib/deviceCapabilities';

export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'longpress' | 'tap';
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
  position: { x: number; y: number };
  velocity?: number;
}

interface GestureMagicProps {
  onGesture: (event: GestureEvent) => void;
  enabled?: boolean;
  className?: string;
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

const GestureMagic: React.FC<GestureMagicProps> = ({
  onGesture,
  enabled = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchPointsRef = useRef<Map<number, TouchPoint>>(new Map());
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gestureStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Gesture thresholds
  const SWIPE_THRESHOLD = 50;
  const SWIPE_VELOCITY_THRESHOLD = 0.3;
  const LONG_PRESS_DURATION = 500;
  const PINCH_THRESHOLD = 0.1;

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const calculateDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }, []);

  const calculateCenter = useCallback((points: TouchPoint[]): { x: number; y: number } => {
    const sum = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  }, []);

  const detectSwipe = useCallback((start: { x: number; y: number }, end: { x: number; y: number }, velocity: number): GestureEvent | null => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < SWIPE_THRESHOLD || velocity < SWIPE_VELOCITY_THRESHOLD) {
      return null;
    }

    let direction: 'up' | 'down' | 'left' | 'right';
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return {
      type: 'swipe',
      direction,
      position: end,
      velocity
    };
  }, []);

  const detectPinch = useCallback((oldPoints: TouchPoint[], newPoints: TouchPoint[]): GestureEvent | null => {
    if (oldPoints.length !== 2 || newPoints.length !== 2) return null;

    const oldDistance = calculateDistance(oldPoints[0], oldPoints[1]);
    const newDistance = calculateDistance(newPoints[0], newPoints[1]);

    if (oldDistance === 0) return null;

    const scale = newDistance / oldDistance;
    const scaleChange = Math.abs(scale - 1);

    if (scaleChange < PINCH_THRESHOLD) return null;

    const center = calculateCenter(newPoints);

    return {
      type: 'pinch',
      scale,
      position: center
    };
  }, [calculateDistance, calculateCenter]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) return;

    event.preventDefault();

    const touches = Array.from(event.touches);
    const now = Date.now();

    // Clear existing touch points
    touchPointsRef.current.clear();

    // Store new touch points
    touches.forEach(touch => {
      touchPointsRef.current.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        timestamp: now
      });
    });

    // Start long press timer for single touch
    if (touches.length === 1) {
      const touch = touches[0];
      gestureStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };

      clearLongPressTimer();
      longPressTimerRef.current = setTimeout(() => {
        onGesture({
          type: 'longpress',
          position: { x: touch.clientX, y: touch.clientY }
        });
      }, LONG_PRESS_DURATION);
    }
  }, [enabled, onGesture, clearLongPressTimer]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled) return;

    event.preventDefault();

    const touches = Array.from(event.touches);
    const now = Date.now();

    // Clear long press timer on move
    clearLongPressTimer();

    // Update touch points
    const oldPoints = Array.from(touchPointsRef.current.values());
    touchPointsRef.current.clear();

    touches.forEach(touch => {
      touchPointsRef.current.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        timestamp: now
      });
    });

    const newPoints = Array.from(touchPointsRef.current.values());

    // Detect pinch gesture
    if (oldPoints.length >= 2 && newPoints.length >= 2) {
      const pinchEvent = detectPinch(oldPoints, newPoints);
      if (pinchEvent) {
        onGesture(pinchEvent);
      }
    }
  }, [enabled, onGesture, clearLongPressTimer, detectPinch]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enabled) return;

    event.preventDefault();

    const touches = Array.from(event.touches);
    const now = Date.now();

    // Clear long press timer
    clearLongPressTimer();

    // Handle single touch end (potential swipe or tap)
    if (touches.length === 0 && gestureStartRef.current) {
      const start = gestureStartRef.current;
      const endTouch = event.changedTouches[0];

      if (endTouch) {
        const end = { x: endTouch.clientX, y: endTouch.clientY };
        const duration = now - start.time;
        const velocity = calculateDistance(
          { id: 0, x: start.x, y: start.y, timestamp: start.time },
          { id: 0, x: end.x, y: end.y, timestamp: now }
        ) / duration;

        // Try to detect swipe first
        const swipeEvent = detectSwipe(start, end, velocity);
        if (swipeEvent) {
          onGesture(swipeEvent);
        } else {
          // It's a tap
          onGesture({
            type: 'tap',
            position: end
          });
        }
      }
    }

    // Remove ended touches
    Array.from(event.changedTouches).forEach(touch => {
      touchPointsRef.current.delete(touch.identifier);
    });

    // Reset gesture start if no touches remain
    if (touches.length === 0) {
      gestureStartRef.current = null;
    }
  }, [enabled, onGesture, clearLongPressTimer, calculateDistance, detectSwipe]);

  const handleMouseDown = useCallback(async (event: MouseEvent) => {
    if (!enabled) return;

    const capabilities = await deviceCapabilities.detectCapabilities();
    if (capabilities.touchEnabled) return; // Skip mouse events on touch devices

    const now = Date.now();
    gestureStartRef.current = { x: event.clientX, y: event.clientY, time: now };

    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      onGesture({
        type: 'longpress',
        position: { x: event.clientX, y: event.clientY }
      });
    }, LONG_PRESS_DURATION);
  }, [enabled, onGesture, clearLongPressTimer]);

  const handleMouseUp = useCallback(async (event: MouseEvent) => {
    if (!enabled) return;

    const capabilities = await deviceCapabilities.detectCapabilities();
    if (capabilities.touchEnabled) return; // Skip mouse events on touch devices

    clearLongPressTimer();

    if (gestureStartRef.current) {
      const start = gestureStartRef.current;
      const end = { x: event.clientX, y: event.clientY };
      const duration = Date.now() - start.time;
      const velocity = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      ) / duration;

      const swipeEvent = detectSwipe(start, end, velocity);
      if (swipeEvent) {
        onGesture(swipeEvent);
      } else {
        onGesture({
          type: 'tap',
          position: end
        });
      }
    }

    gestureStartRef.current = null;
  }, [enabled, onGesture, clearLongPressTimer, detectSwipe]);

  useEffect(() => {
    const setupEventListeners = async () => {
      const container = containerRef.current;
      if (!container) return;

      const capabilities = await deviceCapabilities.detectCapabilities();

      // Touch event listeners
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });

      // Mouse event listeners (for devices that don't have touch)
      if (!capabilities.touchEnabled) {
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mouseup', handleMouseUp);
      }
    };

    setupEventListeners();

    return () => {
      const container = containerRef.current;
      if (!container) return;

      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);

      // We need to check capabilities again for cleanup, but this is a bit tricky
      // For now, we'll remove mouse listeners if they might have been added
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);

      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseUp, clearLongPressTimer]);

  // Only render if gestures are supported and enabled
  if (!enabled || deviceCapabilities.getPerformanceTier() === 'minimal') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`gesture-magic-container ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        touchAction: 'none' // Prevent default touch behaviors
      }}
      aria-hidden="true"
    />
  );
};

export default GestureMagic;
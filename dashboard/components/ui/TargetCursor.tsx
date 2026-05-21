"use client";

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
}

const TargetCursor: React.FC<TargetCursorProps> = ({
  targetSelector = 'button, a, select, .cursor-target',
  spinDuration = 3,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true
}) => {
  const cursorRef  = useRef<HTMLDivElement>(null);   // moves with mouse
  const innerRef   = useRef<HTMLDivElement>(null);   // ring + crosshair — this rotates
  const cornersRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const spinTl     = useRef<gsap.core.Timeline | null>(null);

  const isActiveRef              = useRef(false);
  const targetCornerPositionsRef = useRef<{ x: number; y: number }[] | null>(null);
  const tickerFnRef              = useRef<(() => void) | null>(null);
  const activeStrengthRef        = useRef({ current: 0 });

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return true;
    const hasTouchScreen     = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen      = window.innerWidth <= 768;
    const ua                 = navigator.userAgent || navigator.vendor || '';
    const isMobileUA         = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUA;
  }, []);

  const constants = useMemo(() => ({ borderWidth: 3, cornerSize: 12 }), []);

  const moveCursor = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, { x, y, duration: 0.08, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current || !innerRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = 'none';

    const cursor = cursorRef.current;
    const inner  = innerRef.current;

    cornersRef.current = cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner');

    let activeTarget: Element | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    const cleanupTarget = (target: Element) => {
      if (currentLeaveHandler) target.removeEventListener('mouseleave', currentLeaveHandler);
      currentLeaveHandler = null;
    };

    // Position cursor off-screen initially so it doesn't flash at top-left
    gsap.set(cursor, { x: -200, y: -200 });

    const createSpinTimeline = (fromRotation = 0) => {
      spinTl.current?.kill();
      gsap.set(inner, { rotation: fromRotation });
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(inner, { rotation: fromRotation + 360, duration: spinDuration, ease: 'none' });
    };

    createSpinTimeline();

    // Parallax ticker — runs while hovering an element
    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      const strength = activeStrengthRef.current.current;
      if (strength === 0) return;
      const cursorX = gsap.getProperty(cursorRef.current, 'x') as number;
      const cursorY = gsap.getProperty(cursorRef.current, 'y') as number;
      Array.from(cornersRef.current).forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x') as number;
        const currentY = gsap.getProperty(corner, 'y') as number;
        const targetX  = targetCornerPositionsRef.current![i].x - cursorX;
        const targetY  = targetCornerPositionsRef.current![i].y - cursorY;
        const finalX   = currentX + (targetX - currentX) * strength;
        const finalY   = currentY + (targetY - currentY) * strength;
        const dur      = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;
        gsap.to(corner, { x: finalX, y: finalY, duration: dur, ease: dur === 0 ? 'none' : 'power1.out', overwrite: 'auto' });
      });
    };
    tickerFnRef.current = tickerFn;

    const moveHandler  = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', moveHandler);

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const mouseX = gsap.getProperty(cursorRef.current, 'x') as number;
      const mouseY = gsap.getProperty(cursorRef.current, 'y') as number;
      const el = document.elementFromPoint(mouseX, mouseY);
      const stillOver = el && (el === activeTarget || el.closest(targetSelector) === activeTarget);
      if (!stillOver) currentLeaveHandler?.();
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Click pulse — scale the whole cursor
    const mouseDownHandler = () => gsap.to(cursor, { scale: 0.82, duration: 0.12, ease: 'power2.in' });
    const mouseUpHandler   = () => gsap.to(cursor, { scale: 1, duration: 0.28, ease: 'back.out(2)' });
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup',   mouseUpHandler);

    // Hover enter — snap corners to element, pause inner spin
    const enterHandler = (e: MouseEvent) => {
      const directTarget = e.target as Element;
      const allTargets: Element[] = [];
      let current: Element | null = directTarget;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) allTargets.push(current);
        current = current.parentElement;
      }
      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) cleanupTarget(activeTarget);
      if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(c => gsap.killTweensOf(c));

      // Pause inner rotation — snap to nearest clean angle
      const currentRotation = gsap.getProperty(inner, 'rotation') as number;
      spinTl.current?.pause();
      gsap.to(inner, { rotation: Math.round(currentRotation / 90) * 90, duration: 0.15, ease: 'power2.out' });

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const cursorX = gsap.getProperty(cursorRef.current, 'x') as number;
      const cursorY = gsap.getProperty(cursorRef.current, 'y') as number;

      targetCornerPositionsRef.current = [
        { x: rect.left  - borderWidth,             y: rect.top    - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top    - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left  - borderWidth,             y: rect.bottom + borderWidth - cornerSize }
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current!);
      gsap.to(activeStrengthRef.current, { current: 1, duration: hoverDuration, ease: 'power2.out' });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current![i].x - cursorX,
          y: targetCornerPositionsRef.current![i].y - cursorY,
          duration: 0.22,
          ease: 'power2.out'
        });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current!);
        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef.current, { current: 0, overwrite: true });
        activeTarget = null;

        if (cornersRef.current) {
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x:  cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x:  cornerSize * 0.5, y:  cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y:  cornerSize * 0.5 }
          ];
          Array.from(cornersRef.current).forEach((corner, i) => {
            gsap.to(corner, { x: positions[i].x, y: positions[i].y, duration: 0.3, ease: 'power3.out' });
          });
        }

        // Resume inner spin after corners settle
        resumeTimeout = setTimeout(() => {
          if (!activeTarget) {
            const rot = gsap.getProperty(inner, 'rotation') as number;
            createSpinTimeline(rot % 360);
          }
          resumeTimeout = null;
        }, 60);

        cleanupTarget(target);
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler as EventListener);

    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      window.removeEventListener('mousemove',  moveHandler);
      window.removeEventListener('mouseover',  enterHandler as EventListener);
      window.removeEventListener('scroll',     scrollHandler);
      window.removeEventListener('mousedown',  mouseDownHandler);
      window.removeEventListener('mouseup',    mouseUpHandler);
      if (activeTarget) cleanupTarget(activeTarget);
      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;
      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current.current = 0;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration, parallaxOn]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      {/* Inner element: ring + crosshair — rotates independently */}
      <div ref={innerRef} className="target-cursor-inner">
        <div className="target-cursor-dot" />
        <div className="target-cursor-reticle" />
      </div>
      {/* Outer corners: static, snap to interactive elements */}
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

export default TargetCursor;
